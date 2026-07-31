from __future__ import annotations

import hashlib
import math
from datetime import datetime, timedelta

from backend.app.catalog import EQUIPMENT, EQUIPMENT_BY_ID
from backend.app.config import settings
from backend.app.models import (
    AlarmEvent,
    DashboardSnapshot,
    DataQuality,
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
    """Datos deterministas por bloques de cinco segundos.

    Toda la aplicación y el reporte consultan esta misma implementación para
    conservar coherencia entre KPIs, tendencias, equipos y alarmas.
    """

    source_label = "DATOS DEMO"

    def _now(self) -> datetime:
        now = datetime.now(settings.tz)
        return now.replace(microsecond=0)

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

    def _current_shift(self, timestamp: datetime) -> str:
        hour = timestamp.hour + timestamp.minute / 60
        if 0 <= hour < 7:
            return "Turno 1 · 00:00-07:00"
        if 7 <= hour < 15:
            return "Turno 2 · 07:00-15:00"
        return "Turno 3 · 15:00-00:00"

    def _production_rate(self, timestamp: datetime) -> float:
        bucket_time = datetime.fromtimestamp(self._bucket(timestamp) * 5, tz=settings.tz)
        rate = self._wave(bucket_time, "production", 17.2, 1.45, 620)
        rate += self._wave(bucket_time, "production_fast", 0, 0.38, 85)
        return round(max(rate, 0), 2)

    def _power_kw(self, timestamp: datetime, production_tph: float | None = None) -> float:
        production_tph = production_tph if production_tph is not None else self._production_rate(timestamp)
        base = 418 + 6.2 * (production_tph - 17.2)
        base += self._wave(timestamp, "power", 0, 10.5, 440)
        return round(max(base, 0), 1)

    def _water_pct(self, timestamp: datetime) -> float:
        return round(min(88, max(72, self._wave(timestamp, "water", 82.4, 2.1, 780))), 1)

    def _production_cumulative(self, timestamp: datetime) -> float:
        midnight = timestamp.replace(hour=0, minute=0, second=0, microsecond=0)
        elapsed_h = max((timestamp - midnight).total_seconds() / 3600, 0)
        baseline = 16.65 * elapsed_h
        correction = 1.8 * math.sin(elapsed_h / 24 * math.pi)
        return round(max(0, baseline + correction), 1)

    def _energy_cumulative(self, timestamp: datetime) -> float:
        midnight = timestamp.replace(hour=0, minute=0, second=0, microsecond=0)
        elapsed_h = max((timestamp - midnight).total_seconds() / 3600, 0)
        average_power = 417.5 + 4.2 * math.sin(elapsed_h / 24 * math.pi)
        return round(max(0, elapsed_h * average_power), 1)

    def _equipment_status(self, equipment_id: str, timestamp: datetime) -> EquipmentStatus:
        # Estados deliberados para demostrar normal, advertencia, alarma, paro y pérdida de comunicación.
        if equipment_id == "P-602B":
            return EquipmentStatus.OFFLINE
        if equipment_id == "ML-201":
            return EquipmentStatus.WARNING
        if equipment_id == "CR-104":
            return EquipmentStatus.ALARM
        if equipment_id in {"P-201B"}:
            return EquipmentStatus.STOPPED
        if equipment_id == "FP-402":
            # Ciclo operativo conceptual: filtrando 2 min, detenido 1 min.
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

    def _measurement_value(self, sensor_id: str, timestamp: datetime, status: EquipmentStatus) -> float | None:
        if status == EquipmentStatus.OFFLINE:
            return None
        production = self._production_rate(timestamp)
        values: dict[str, float] = {
            "HT101_LEVEL": self._wave(timestamp, sensor_id, 63, 7.5, 820),
            "VF102_FLOW": production,
            "CV103_FLOW": max(0, production - 0.15),
            "CR104_TEMP": self._wave(timestamp, sensor_id, 86 if status == EquipmentStatus.ALARM else 67, 2.4, 510),
            "CR104_FLOW": max(0, production - 0.25),
            "ML201_TEMP": self._wave(timestamp, sensor_id, 79 if status == EquipmentStatus.WARNING else 69, 1.8, 620),
            "ML201_DENSITY": self._wave(timestamp, sensor_id, 1390, 28, 760),
            "CY202_PRESSURE": self._wave(timestamp, sensor_id, 112, 7.2, 430),
            "CY202_DENSITY": self._wave(timestamp, sensor_id, 1330, 34, 690),
            "SP203_LEVEL": self._wave(timestamp, sensor_id, 57, 8.5, 390),
            "P201A_PRESSURE": self._wave(timestamp, sensor_id, 146, 6.5, 500),
            "P201A_FLOW": self._wave(timestamp, sensor_id, 111, 7.5, 560),
            "P201B_PRESSURE": 0,
            "P201B_FLOW": 0,
            "TK301_PH": self._wave(timestamp, sensor_id, 9.15, 0.12, 720),
            "TK301_ORP": self._wave(timestamp, sensor_id, 278, 14, 630),
            "TK301_LEVEL": self._wave(timestamp, sensor_id, 68, 4.0, 540),
            "TH401_LEVEL": self._wave(timestamp, sensor_id, 52, 4.8, 840),
            "TH401_DENSITY": self._wave(timestamp, sensor_id, 1510, 36, 790),
            "FP402_PRESSURE": self._wave(timestamp, sensor_id, 12.4 if status == EquipmentStatus.RUNNING else 1.1, 0.8, 160),
            "WT601_LEVEL": self._wave(timestamp, sensor_id, 74, 4.5, 980),
            "WT601_COND": self._wave(timestamp, sensor_id, 1180, 45, 870),
            "CL602_LEVEL": self._wave(timestamp, sensor_id, 61, 5.5, 920),
            "P602A_PRESSURE": self._wave(timestamp, sensor_id, 6.8, 0.35, 430),
            "P602A_FLOW": self._wave(timestamp, sensor_id, 96, 5.8, 470),
        }
        return round(values.get(sensor_id, self._wave(timestamp, sensor_id, 50, 5, 600)), 2)

    def _equipment_state(self, equipment_id: str, timestamp: datetime) -> EquipmentState:
        definition = EQUIPMENT_BY_ID[equipment_id]
        status = self._equipment_status(equipment_id, timestamp)
        quality = self._quality_for_status(status)
        measurements = [
            Measurement(
                sensor_id=item.id,
                name=item.name,
                metric=item.metric,
                value=self._measurement_value(item.id, timestamp, status),
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

    def _trends(self, end: datetime, window_hours: int) -> list[TrendPoint]:
        points = max(16, min(96, window_hours * 4 + 1))
        interval = timedelta(minutes=max(5, int(window_hours * 60 / (points - 1))))
        start = end - interval * (points - 1)
        trends: list[TrendPoint] = []
        for index in range(points):
            ts = start + interval * index
            production = self._production_rate(ts)
            power = self._power_kw(ts, production)
            trends.append(
                TrendPoint(
                    timestamp=ts,
                    production_tph=production,
                    production_cumulative_t=self._production_cumulative(ts),
                    power_kw=power,
                    energy_cumulative_kwh=self._energy_cumulative(ts),
                    water_recirculation_pct=self._water_pct(ts),
                    fresh_water_m3h=round(23.5 + self._wave(ts, "fresh-water", 0, 1.9, 690), 1),
                )
            )
        return trends

    def _alarms(self, equipment: list[EquipmentState], timestamp: datetime) -> list[AlarmEvent]:
        alarms: list[AlarmEvent] = []
        by_id = {item.id: item for item in equipment}
        if by_id["CR-104"].status == EquipmentStatus.ALARM:
            alarms.append(
                AlarmEvent(
                    id="ALM-CR104-TEMP",
                    severity="critical",
                    equipment_id="CR-104",
                    equipment_name="Trituradora CR-104",
                    area_id="reception",
                    title="Temperatura alta",
                    message="Temperatura demo de rodamiento por encima del rango conceptual.",
                    active_since=timestamp - timedelta(minutes=18),
                )
            )
        if by_id["ML-201"].status == EquipmentStatus.WARNING:
            alarms.append(
                AlarmEvent(
                    id="WRN-ML201-TEMP",
                    severity="warning",
                    equipment_id="ML-201",
                    equipment_name="Molino ML-201",
                    area_id="milling",
                    title="Temperatura en advertencia",
                    message="Tendencia demo de chumacera cercana al límite conceptual.",
                    active_since=timestamp - timedelta(minutes=43),
                )
            )
        if by_id["P-602B"].status == EquipmentStatus.OFFLINE:
            alarms.append(
                AlarmEvent(
                    id="COM-P602B",
                    severity="offline",
                    equipment_id="P-602B",
                    equipment_name="Bomba P-602B",
                    area_id="water_tailings",
                    title="Sin comunicación",
                    message="No hay lectura demo disponible para el equipo de respaldo.",
                    active_since=timestamp - timedelta(minutes=7),
                )
            )
        return alarms

    def get_snapshot(self, window_hours: int = 12) -> DashboardSnapshot:
        now = self._now()
        equipment = [self._equipment_state(item.id, now) for item in EQUIPMENT]
        alarms = self._alarms(equipment, now)
        production = self._production_rate(now)
        production_today = self._production_cumulative(now)
        energy_today = self._energy_cumulative(now)
        statuses = [item.status for item in equipment]
        kpis = KPISet(
            production_current_tph=production,
            production_today_t=production_today,
            objective_tpd=400,
            objective_progress_pct=round(min(100, production_today / 400 * 100), 1),
            power_kw=self._power_kw(now, production),
            energy_today_kwh=energy_today,
            specific_energy_kwh_t=round(energy_today / production_today, 2) if production_today > 0 else 0,
            water_recirculation_pct=self._water_pct(now),
            equipment_running=statuses.count(EquipmentStatus.RUNNING),
            equipment_stopped=statuses.count(EquipmentStatus.STOPPED),
            equipment_warning=statuses.count(EquipmentStatus.WARNING),
            equipment_alarm=statuses.count(EquipmentStatus.ALARM),
            equipment_offline=statuses.count(EquipmentStatus.OFFLINE),
            active_alarms=len(alarms),
        )
        return DashboardSnapshot(
            mine="Mina San Bernardo",
            shift=self._current_shift(now),
            generated_at=now,
            last_reading_at=now,
            overall_quality=DataQuality.WARNING if alarms else DataQuality.GOOD,
            source_label=self.source_label,
            demo_notice="Simulación conceptual. No representa inventario, producción ni mediciones confirmadas.",
            catalog_status="Catálogo conceptual no confirmado",
            kpis=kpis,
            equipment=equipment,
            alarms=alarms,
            trends=self._trends(now, window_hours),
        )

    def get_equipment_detail(
        self,
        equipment_id: str,
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
            status = self._equipment_status(equipment_id, ts)
            row: dict[str, float | str | datetime | None] = {"timestamp": ts, "status": status.value}
            for sensor_def in definition.sensors:
                row[sensor_def.id] = self._measurement_value(sensor_def.id, ts, status)
            history.append(row)
        return EquipmentDetailResponse(
            equipment=self._equipment_state(equipment_id, end),
            history=history,
        )
