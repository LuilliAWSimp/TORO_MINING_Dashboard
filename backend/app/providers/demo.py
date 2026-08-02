from __future__ import annotations

import hashlib
import math
from datetime import datetime, timedelta

from backend.app.catalog import AREAS, EQUIPMENT, EQUIPMENT_BY_ID
from backend.app.config import settings
from backend.app.executive_catalog import SCENARIOS, build_executive_dashboard, build_kpi_catalog
from backend.app.models import (
    AlarmEvent,
    CatalogResponse,
    DashboardSnapshot,
    DataQuality,
    DemoScenario,
    EquipmentDetailResponse,
    EquipmentState,
    EquipmentStatus,
    KPISet,
    Measurement,
    TrendPoint,
)
from backend.app.providers.base import DataProvider


STATUS_LABELS = {
    EquipmentStatus.RUNNING: "Operando",
    EquipmentStatus.STOPPED: "Detenido",
    EquipmentStatus.WARNING: "Advertencia",
    EquipmentStatus.ALARM: "Alarma",
    EquipmentStatus.OFFLINE: "Sin comunicación",
}


class DemoDataProvider(DataProvider):
    """Datos deterministas por bloques de cinco segundos y escenario.

    Dashboard, detalle de equipos, catálogo ejecutivo y PDF consultan esta
    implementación para evitar mezclar datos de arranque y objetivo.
    """

    source_label = "DATOS DEMO"

    def _now(self) -> datetime:
        return datetime.now(settings.tz).replace(microsecond=0)

    @staticmethod
    def _bucket(timestamp: datetime, seconds: int = 5) -> int:
        return int(timestamp.timestamp()) // seconds

    @staticmethod
    def _stable_phase(key: str) -> float:
        digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
        return (int(digest[:8], 16) % 10000) / 10000 * math.tau

    def _wave(self, timestamp: datetime, key: str, base: float, amplitude: float, period_seconds: float) -> float:
        phase = self._stable_phase(key)
        return base + amplitude * math.sin(timestamp.timestamp() / period_seconds * math.tau + phase)

    @staticmethod
    def _current_shift(timestamp: datetime) -> str:
        hour = timestamp.hour + timestamp.minute / 60
        if 0 <= hour < 7:
            return "Turno 1 · 00:00-07:00"
        if 7 <= hour < 15:
            return "Turno 2 · 07:00-15:00"
        return "Turno 3 · 15:00-00:00"

    @staticmethod
    def _scenario_value(scenario: DemoScenario, startup: float, target: float) -> float:
        return startup if scenario == DemoScenario.STARTUP else target

    def _production_rate(self, timestamp: datetime, scenario: DemoScenario) -> float:
        bucket_time = datetime.fromtimestamp(self._bucket(timestamp) * 5, tz=settings.tz)
        base = self._scenario_value(scenario, 17.2, 42.2)
        amplitude = self._scenario_value(scenario, 1.45, 2.1)
        fast_amplitude = self._scenario_value(scenario, 0.38, 0.65)
        rate = self._wave(bucket_time, f"production-{scenario.value}", base, amplitude, 620)
        rate += self._wave(bucket_time, f"production-fast-{scenario.value}", 0, fast_amplitude, 85)
        return round(max(rate, 0), 2)

    def _power_kw(
        self,
        timestamp: datetime,
        scenario: DemoScenario,
        production_tph: float | None = None,
    ) -> float:
        production_tph = production_tph if production_tph is not None else self._production_rate(timestamp, scenario)
        specific = self._scenario_value(scenario, 24.3, 24.5)
        variation = self._scenario_value(scenario, 10.5, 20.0)
        power = production_tph * specific + self._wave(timestamp, f"power-{scenario.value}", 0, variation, 440)
        return round(max(power, 0), 1)

    def _water_pct(self, timestamp: datetime, scenario: DemoScenario) -> float:
        base = self._scenario_value(scenario, 82.4, 82.0)
        amplitude = self._scenario_value(scenario, 2.1, 1.2)
        return round(min(90, max(68, self._wave(timestamp, f"water-{scenario.value}", base, amplitude, 780))), 1)

    def _production_cumulative(self, timestamp: datetime, scenario: DemoScenario) -> float:
        midnight = timestamp.replace(hour=0, minute=0, second=0, microsecond=0)
        elapsed_h = max((timestamp - midnight).total_seconds() / 3600, 0)
        daily_rate = self._scenario_value(scenario, 399.6, 1000.0)
        correction = self._scenario_value(scenario, 1.8, 4.0) * math.sin(elapsed_h / 24 * math.pi)
        return round(max(0, daily_rate / 24 * elapsed_h + correction), 1)

    def _energy_cumulative(self, timestamp: datetime, scenario: DemoScenario) -> float:
        production = self._production_cumulative(timestamp, scenario)
        specific = self._scenario_value(scenario, 24.3, 24.5)
        return round(max(0, production * specific), 1)

    def _equipment_status(
        self,
        equipment_id: str,
        timestamp: datetime,
        scenario: DemoScenario,
    ) -> EquipmentStatus:
        if scenario == DemoScenario.STARTUP:
            if equipment_id == "P-602B":
                return EquipmentStatus.OFFLINE
            if equipment_id == "ML-201":
                return EquipmentStatus.WARNING
            if equipment_id == "CR-104":
                return EquipmentStatus.ALARM
        else:
            if equipment_id in {"CR-104", "TH-401"}:
                return EquipmentStatus.ALARM
            if equipment_id == "ML-201":
                return EquipmentStatus.WARNING
        if equipment_id == "P-201B":
            return EquipmentStatus.STOPPED
        if equipment_id == "FP-402":
            return EquipmentStatus.RUNNING if (self._bucket(timestamp, 60) % 3) != 2 else EquipmentStatus.STOPPED
        return EquipmentStatus.RUNNING

    @staticmethod
    def _quality_for_status(status: EquipmentStatus) -> DataQuality:
        return {
            EquipmentStatus.RUNNING: DataQuality.GOOD,
            EquipmentStatus.STOPPED: DataQuality.GOOD,
            EquipmentStatus.WARNING: DataQuality.WARNING,
            EquipmentStatus.ALARM: DataQuality.CRITICAL,
            EquipmentStatus.OFFLINE: DataQuality.OFFLINE,
        }[status]

    def _measurement_value(
        self,
        sensor_id: str,
        timestamp: datetime,
        status: EquipmentStatus,
        scenario: DemoScenario,
    ) -> float | None:
        if status == EquipmentStatus.OFFLINE:
            return None
        production = self._production_rate(timestamp, scenario)
        target = scenario == DemoScenario.TARGET
        values: dict[str, float] = {
            "HT101_LEVEL": self._wave(timestamp, sensor_id, 68 if target else 63, 7.5, 820),
            "VF102_FLOW": production,
            "CV103_FLOW": max(0, production - (0.3 if target else 0.15)),
            "CR104_TEMP": self._wave(timestamp, sensor_id, 87 if status == EquipmentStatus.ALARM else 67, 2.4, 510),
            "CR104_FLOW": max(0, production - (0.45 if target else 0.25)),
            "ML201_TEMP": self._wave(timestamp, sensor_id, 79 if status == EquipmentStatus.WARNING else 69, 1.8, 620),
            "ML201_DENSITY": self._wave(timestamp, sensor_id, 1450 if target else 1390, 28, 760),
            "CY202_PRESSURE": self._wave(timestamp, sensor_id, 126 if target else 112, 7.2, 430),
            "CY202_DENSITY": self._wave(timestamp, sensor_id, 1410 if target else 1330, 34, 690),
            "SP203_LEVEL": self._wave(timestamp, sensor_id, 61 if target else 57, 8.5, 390),
            "P201A_PRESSURE": self._wave(timestamp, sensor_id, 174 if target else 146, 6.5, 500),
            "P201A_FLOW": self._wave(timestamp, sensor_id, 154 if target else 111, 7.5, 560),
            "P201B_PRESSURE": 0,
            "P201B_FLOW": 0,
            "TK301_PH": self._wave(timestamp, sensor_id, 9.25 if target else 9.15, 0.12, 720),
            "TK301_ORP": self._wave(timestamp, sensor_id, 292 if target else 278, 14, 630),
            "TK301_LEVEL": self._wave(timestamp, sensor_id, 70 if target else 68, 4.0, 540),
            "TH401_LEVEL": self._wave(timestamp, sensor_id, 76 if status == EquipmentStatus.ALARM else (58 if target else 52), 4.8, 840),
            "TH401_DENSITY": self._wave(timestamp, sensor_id, 1580 if target else 1510, 36, 790),
            "FP402_PRESSURE": self._wave(timestamp, sensor_id, 13.6 if target and status == EquipmentStatus.RUNNING else (12.4 if status == EquipmentStatus.RUNNING else 1.1), 0.8, 160),
            "WT601_LEVEL": self._wave(timestamp, sensor_id, 72 if target else 74, 4.5, 980),
            "WT601_COND": self._wave(timestamp, sensor_id, 1260 if target else 1180, 45, 870),
            "CL602_LEVEL": self._wave(timestamp, sensor_id, 64 if target else 61, 5.5, 920),
            "P602A_PRESSURE": self._wave(timestamp, sensor_id, 8.4 if target else 6.8, 0.35, 430),
            "P602A_FLOW": self._wave(timestamp, sensor_id, 148 if target else 96, 5.8, 470),
            "P602B_PRESSURE": self._wave(timestamp, sensor_id, 8.2 if target else 0, 0.3, 430),
            "P602B_FLOW": self._wave(timestamp, sensor_id, 145 if target else 0, 5.0, 470),
        }
        return round(values.get(sensor_id, self._wave(timestamp, sensor_id, 50, 5, 600)), 2)

    def _equipment_state(
        self,
        equipment_id: str,
        timestamp: datetime,
        scenario: DemoScenario,
    ) -> EquipmentState:
        definition = EQUIPMENT_BY_ID[equipment_id]
        status = self._equipment_status(equipment_id, timestamp, scenario)
        quality = self._quality_for_status(status)
        measurements = [
            Measurement(
                sensor_id=item.id,
                name=item.name,
                metric=item.metric,
                value=self._measurement_value(item.id, timestamp, status, scenario),
                unit=item.unit,
                quality=quality,
                timestamp=timestamp,
            )
            for item in definition.sensors
        ]
        return EquipmentState(
            id=definition.id,
            name=definition.name,
            area_id=definition.area_id,
            equipment_type=definition.equipment_type,
            description=definition.description,
            conceptual=definition.conceptual,
            status=status,
            status_label=STATUS_LABELS[status],
            quality=quality,
            last_update=timestamp,
            measurements=measurements,
        )

    def _trends(self, end: datetime, window_hours: int, scenario: DemoScenario) -> list[TrendPoint]:
        points = max(16, min(96, window_hours * 4 + 1))
        interval = timedelta(minutes=max(5, int(window_hours * 60 / (points - 1))))
        start = end - interval * (points - 1)
        trends: list[TrendPoint] = []
        fresh_water_specific = self._scenario_value(scenario, 1.05, 0.72)
        for index in range(points):
            ts = start + interval * index
            production = self._production_rate(ts, scenario)
            power = self._power_kw(ts, scenario, production)
            trends.append(TrendPoint(
                timestamp=ts,
                production_tph=production,
                production_cumulative_t=self._production_cumulative(ts, scenario),
                power_kw=power,
                energy_cumulative_kwh=self._energy_cumulative(ts, scenario),
                water_recirculation_pct=self._water_pct(ts, scenario),
                fresh_water_m3h=round(production * fresh_water_specific + self._wave(ts, f"fresh-water-{scenario.value}", 0, 0.8, 690), 1),
            ))
        return trends

    def _alarms(
        self,
        equipment: list[EquipmentState],
        timestamp: datetime,
        scenario: DemoScenario,
    ) -> list[AlarmEvent]:
        alarms: list[AlarmEvent] = []
        by_id = {item.id: item for item in equipment}
        if by_id["CR-104"].status == EquipmentStatus.ALARM:
            alarms.append(AlarmEvent(
                id="ALM-CR104-TEMP",
                severity="critical",
                equipment_id="CR-104",
                equipment_name="Trituradora CR-104",
                area_id="reception",
                title="Temperatura alta",
                message="Temperatura demo de rodamiento por encima del rango conceptual.",
                active_since=timestamp - timedelta(minutes=18),
            ))
        if by_id["TH-401"].status == EquipmentStatus.ALARM:
            alarms.append(AlarmEvent(
                id="ALM-TH401-BED",
                severity="critical",
                equipment_id="TH-401",
                equipment_name="Espesador TH-401",
                area_id="thickening",
                title="Nivel de cama alto",
                message="Condición demo alta en la cama del espesador conceptual.",
                active_since=timestamp - timedelta(minutes=26),
            ))
        if by_id["ML-201"].status == EquipmentStatus.WARNING:
            alarms.append(AlarmEvent(
                id="WRN-ML201-TEMP",
                severity="warning",
                equipment_id="ML-201",
                equipment_name="Molino ML-201",
                area_id="milling",
                title="Temperatura en advertencia",
                message="Tendencia demo de chumacera cercana al límite conceptual.",
                active_since=timestamp - timedelta(minutes=43),
            ))
        if scenario == DemoScenario.STARTUP and by_id["P-602B"].status == EquipmentStatus.OFFLINE:
            alarms.append(AlarmEvent(
                id="COM-P602B",
                severity="offline",
                equipment_id="P-602B",
                equipment_name="Bomba P-602B",
                area_id="water_tailings",
                title="Sin comunicación",
                message="No hay lectura demo disponible para el equipo de respaldo.",
                active_since=timestamp - timedelta(minutes=7),
            ))
        return alarms

    def get_catalog(self, scenario: DemoScenario = DemoScenario.STARTUP) -> CatalogResponse:
        now = self._now()
        info = SCENARIOS[scenario]
        return CatalogResponse(
            mine="Mina San Bernardo",
            scenario=info,
            phase="Fase inicial conceptual" if scenario == DemoScenario.STARTUP else "Operación objetivo conceptual · Mes 36",
            objective_tpd=info.capacity_tpd,
            future_target_tpd=1000,
            inventory_status="Catálogo conceptual no confirmado",
            source_label=self.source_label,
            source_notice="Fuentes listadas son metadatos demo; no existen conexiones activas.",
            areas=AREAS,
            equipment=EQUIPMENT,
            kpis=build_kpi_catalog(scenario, now),
        )

    def get_snapshot(
        self,
        scenario: DemoScenario = DemoScenario.STARTUP,
        window_hours: int = 12,
    ) -> DashboardSnapshot:
        now = self._now()
        info = SCENARIOS[scenario]
        equipment = [self._equipment_state(item.id, now, scenario) for item in EQUIPMENT]
        alarms = self._alarms(equipment, now, scenario)
        production = self._production_rate(now, scenario)
        production_today = self._production_cumulative(now, scenario)
        energy_today = self._energy_cumulative(now, scenario)
        statuses = [item.status for item in equipment]
        kpis = KPISet(
            production_current_tph=production,
            production_today_t=production_today,
            objective_tpd=info.capacity_tpd,
            objective_progress_pct=round(min(100, production_today / info.capacity_tpd * 100), 1),
            power_kw=self._power_kw(now, scenario, production),
            energy_today_kwh=energy_today,
            specific_energy_kwh_t=round(energy_today / production_today, 2) if production_today > 0 else 0,
            water_recirculation_pct=self._water_pct(now, scenario),
            equipment_running=statuses.count(EquipmentStatus.RUNNING),
            equipment_stopped=statuses.count(EquipmentStatus.STOPPED),
            equipment_warning=statuses.count(EquipmentStatus.WARNING),
            equipment_alarm=statuses.count(EquipmentStatus.ALARM),
            equipment_offline=statuses.count(EquipmentStatus.OFFLINE),
            active_alarms=len(alarms),
        )
        overall_quality = DataQuality.GOOD
        if any(item.status == EquipmentStatus.OFFLINE for item in equipment):
            overall_quality = DataQuality.OFFLINE
        elif any(item.status == EquipmentStatus.ALARM for item in equipment):
            overall_quality = DataQuality.CRITICAL
        elif any(item.status == EquipmentStatus.WARNING for item in equipment):
            overall_quality = DataQuality.WARNING
        return DashboardSnapshot(
            mine="Mina San Bernardo",
            scenario=info,
            shift=self._current_shift(now),
            generated_at=now,
            last_reading_at=now,
            overall_quality=overall_quality,
            source_label=self.source_label,
            demo_notice="Simulación conceptual. No representa inventario, producción ni mediciones confirmadas.",
            catalog_status="Catálogo conceptual no confirmado",
            kpis=kpis,
            equipment=equipment,
            alarms=alarms,
            trends=self._trends(now, window_hours, scenario),
            executive=build_executive_dashboard(scenario, now),
        )

    def get_equipment_detail(
        self,
        equipment_id: str,
        scenario: DemoScenario = DemoScenario.STARTUP,
        start: datetime | None = None,
        end: datetime | None = None,
    ) -> EquipmentDetailResponse:
        if equipment_id not in EQUIPMENT_BY_ID:
            raise KeyError(equipment_id)
        end = end.astimezone(settings.tz) if end else self._now()
        start = start.astimezone(settings.tz) if start else end - timedelta(hours=6)
        if start >= end:
            start = end - timedelta(hours=6)
        definition = EQUIPMENT_BY_ID[equipment_id]
        points = 25
        step = (end - start) / (points - 1)
        history: list[dict[str, float | str | datetime | None]] = []
        for index in range(points):
            ts = start + step * index
            status = self._equipment_status(equipment_id, ts, scenario)
            row: dict[str, float | str | datetime | None] = {"timestamp": ts, "status": status.value}
            for sensor_def in definition.sensors:
                row[sensor_def.id] = self._measurement_value(sensor_def.id, ts, status, scenario)
            history.append(row)
        return EquipmentDetailResponse(
            scenario=SCENARIOS[scenario],
            equipment=self._equipment_state(equipment_id, end, scenario),
            history=history,
        )
