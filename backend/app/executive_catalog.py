from __future__ import annotations

from datetime import datetime, timedelta
from typing import Iterable

from backend.app.models import (
    AreaPerformance,
    DemoScenario,
    EvaluationDirection,
    ExecutiveControl,
    ExecutiveDashboard,
    ExecutiveMilestone,
    ExecutiveRisk,
    ExecutiveTrendPoint,
    GeneralRagItem,
    KpiDefinition,
    RagStatus,
    ScenarioInfo,
)


SCENARIOS: dict[DemoScenario, ScenarioInfo] = {
    DemoScenario.STARTUP: ScenarioInfo(
        id=DemoScenario.STARTUP,
        label="Arranque · 400 t/d",
        short_label="Arranque · 400 t/d",
        capacity_tpd=400,
    ),
    DemoScenario.TARGET: ScenarioInfo(
        id=DemoScenario.TARGET,
        label="Objetivo · 1,000 t/d · Mes 36",
        short_label="Objetivo · 1,000 t/d",
        capacity_tpd=1000,
        target_month=36,
    ),
}


KPI_ROWS = [
    ("KPI-001", "Producción diaria", "Producción", "t/día", "SCADA / báscula"),
    ("KPI-002", "Producción mensual", "Producción", "t/mes", "Historiador / ERP"),
    ("KPI-003", "Disponibilidad planta", "Producción", "%", "SCADA / mantenimiento"),
    ("KPI-004", "Utilización efectiva", "Producción", "%", "SCADA"),
    ("KPI-005", "Cumplimiento plan producción", "Producción", "%", "Plan diario vs real"),
    ("KPI-006", "Toneladas extraídas por turno", "Mina", "t/turno", "Despacho mina"),
    ("KPI-007", "Avance de desarrollo", "Mina", "m/mes", "Planeación mina"),
    ("KPI-008", "Disponibilidad de flota", "Mina", "%", "FMS / mantenimiento"),
    ("KPI-009", "Dilución minera", "Mina", "%", "Geología / control de ley"),
    ("KPI-010", "Ventilación dentro de estándar", "Mina", "%", "Sensores ambiente"),
    ("KPI-011", "Toneladas alimentadas", "Trituración", "t/día", "Tolva / bandas"),
    ("KPI-012", "Disponibilidad trituración", "Trituración", "%", "SCADA"),
    ("KPI-013", "Tamaño P80 alimentación", "Trituración", "mm", "Laboratorio"),
    ("KPI-014", "Tiempo paro trituración", "Trituración", "h/día", "SCADA eventos"),
    ("KPI-015", "Throughput molienda", "Molienda", "t/h", "SCADA"),
    ("KPI-016", "Energía específica molienda", "Molienda", "kWh/t", "Medidor energía"),
    ("KPI-017", "Disponibilidad molino", "Molienda", "%", "SCADA / CMMS"),
    ("KPI-018", "Densidad de pulpa", "Molienda", "% sólidos", "Densímetro"),
    ("KPI-019", "Recuperación oro", "Beneficio metalúrgico", "%", "Balance metalúrgico"),
    ("KPI-020", "Recuperación plata", "Beneficio metalúrgico", "%", "Balance metalúrgico"),
    ("KPI-021", "Ley de cabeza Au", "Beneficio metalúrgico", "g/t", "Laboratorio"),
    ("KPI-022", "Ley de cabeza Ag", "Beneficio metalúrgico", "g/t", "Laboratorio"),
    ("KPI-023", "Consumo reactivos", "Beneficio metalúrgico", "kg/t", "Dosificación / almacén"),
    ("KPI-024", "Estabilidad pH proceso", "Beneficio metalúrgico", "%", "Analizador pH"),
    ("KPI-025", "Sólidos underflow", "Espesamiento y producto final", "%", "Densímetro"),
    ("KPI-026", "Humedad producto final", "Espesamiento y producto final", "%", "Laboratorio"),
    ("KPI-027", "Disponibilidad filtro", "Espesamiento y producto final", "%", "SCADA / CMMS"),
    ("KPI-028", "Cumplimiento especificación producto", "Espesamiento y producto final", "%", "QA/QC"),
    ("KPI-029", "Consumo agua fresca", "Agua y jales", "m3/t", "Medidores flujo"),
    ("KPI-030", "Recuperación de agua", "Agua y jales", "%", "Balance hídrico"),
    ("KPI-031", "Nivel presa de jales", "Agua y jales", "% capacidad", "Nivel / topografía"),
    ("KPI-032", "Consumo energético total", "Energía", "kWh/t", "Medición eléctrica"),
    ("KPI-033", "Demanda máxima", "Energía", "MW", "Subestación"),
    ("KPI-034", "MTBF equipos críticos", "Mantenimiento", "h", "CMMS"),
    ("KPI-035", "MTTR equipos críticos", "Mantenimiento", "h", "CMMS"),
    ("KPI-036", "Backlog mantenimiento", "Mantenimiento", "semanas", "CMMS"),
    ("KPI-037", "Paros no programados", "Mantenimiento", "h/mes", "SCADA / CMMS"),
    ("KPI-038", "TRIFR", "Seguridad", "índice", "HSE"),
    ("KPI-039", "Días sin accidente incapacitante", "Seguridad", "días", "HSE"),
    ("KPI-040", "Alarmas críticas activas", "Digitalización y calidad", "#", "SCADA alarmas"),
    ("KPI-041", "Disponibilidad SCADA/Red", "Digitalización y calidad", "%", "Monitoreo OT"),
    ("KPI-042", "Variables comunicadas", "Digitalización y calidad", "%", "SCADA / Historian"),
    ("KPI-043", "Calidad de datos", "Digitalización y calidad", "%", "Historiador"),
    ("KPI-044", "Satisfacción usuario interno", "Digitalización y calidad", "NPS", "Encuesta mensual"),
]


# valor, meta, límite amarillo, límite rojo
TARGET_PROFILE: dict[str, tuple[float, float, float, float]] = {
    "KPI-001": (1000, 1000, 950, 900), "KPI-002": (30000, 30000, 28500, 27000),
    "KPI-003": (94.5, 95, 92, 88), "KPI-004": (91, 92, 88, 84),
    "KPI-005": (98, 100, 95, 90), "KPI-006": (340, 333, 317, 300),
    "KPI-007": (118, 120, 110, 100), "KPI-008": (90, 92, 88, 82),
    "KPI-009": (8.5, 8, 10, 12), "KPI-010": (98.5, 100, 95, 90),
    "KPI-011": (1005, 1000, 950, 900), "KPI-012": (95, 95, 92, 88),
    "KPI-013": (12.5, 12, 14, 16), "KPI-014": (1.4, 1, 2, 3),
    "KPI-015": (42.2, 41.7, 39.5, 37.5), "KPI-016": (18.8, 18, 20, 22),
    "KPI-017": (94.2, 95, 92, 88), "KPI-018": (68, 68, 65, 62),
    "KPI-019": (91.8, 92, 89, 86), "KPI-020": (88.5, 89, 86, 82),
    "KPI-021": (3.2, 3, 2.7, 2.4), "KPI-022": (115, 110, 100, 90),
    "KPI-023": (12.6, 12, 14, 16), "KPI-024": (96, 97, 94, 90),
    "KPI-025": (58.5, 60, 56, 52), "KPI-026": (9.8, 10, 12, 14),
    "KPI-027": (93.5, 95, 90, 85), "KPI-028": (99, 100, 97, 94),
    "KPI-029": (0.72, 0.7, 0.8, 0.95), "KPI-030": (82, 85, 80, 75),
    "KPI-031": (68, 65, 75, 85), "KPI-032": (24.5, 24, 27, 30),
    "KPI-033": (2.85, 2.8, 3.1, 3.4), "KPI-034": (186, 200, 170, 140),
    "KPI-035": (3.2, 3, 4, 5), "KPI-036": (3.8, 4, 5, 6),
    "KPI-037": (4.8, 4, 6, 9), "KPI-038": (0.35, 0.4, 0.6, 0.8),
    "KPI-039": (214, 180, 120, 60), "KPI-040": (2, 0, 3, 6),
    "KPI-041": (99.7, 99.5, 99, 98), "KPI-042": (99.2, 99, 97, 94),
    "KPI-043": (98.8, 99, 97, 94), "KPI-044": (82, 80, 70, 60),
}


STARTUP_PROFILE: dict[str, tuple[float, float, float, float]] = {
    "KPI-001": (392, 400, 380, 360), "KPI-002": (11760, 12000, 11400, 10800),
    "KPI-003": (87.2, 85, 80, 75), "KPI-004": (82, 85, 80, 75),
    "KPI-005": (98, 100, 95, 90), "KPI-006": (132, 133, 126, 120),
    "KPI-007": (42, 45, 40, 35), "KPI-008": (84, 85, 80, 75),
    "KPI-009": (10.5, 10, 12, 14), "KPI-010": (96, 98, 94, 90),
    "KPI-011": (398, 400, 380, 360), "KPI-012": (88, 88, 82, 76),
    "KPI-013": (14, 14, 16, 18), "KPI-014": (2.5, 2, 3, 4),
    "KPI-015": (16.8, 16.7, 15.5, 14.5), "KPI-016": (20.8, 20, 22, 24),
    "KPI-017": (86, 85, 80, 75), "KPI-018": (66, 66, 62, 58),
    "KPI-019": (87.5, 88, 84, 80), "KPI-020": (83, 84, 80, 76),
    "KPI-021": (2.6, 2.5, 2.2, 1.9), "KPI-022": (92, 90, 82, 74),
    "KPI-023": (14.2, 14, 16, 18), "KPI-024": (93, 95, 90, 85),
    "KPI-025": (55, 56, 52, 48), "KPI-026": (11, 11, 13, 15),
    "KPI-027": (87, 88, 82, 76), "KPI-028": (96, 97, 94, 90),
    "KPI-029": (1.05, 1.0, 1.15, 1.3), "KPI-030": (76, 78, 72, 66),
    "KPI-031": (52, 55, 65, 75), "KPI-032": (25.2, 25, 28, 31),
    "KPI-033": (1.2, 1.15, 1.3, 1.45), "KPI-034": (120, 120, 100, 80),
    "KPI-035": (4.5, 4, 5, 6), "KPI-036": (5, 5, 6, 7),
    "KPI-037": (8, 8, 10, 13), "KPI-038": (0.6, 0.6, 0.8, 1.0),
    "KPI-039": (75, 60, 30, 10), "KPI-040": (3, 2, 4, 7),
    "KPI-041": (96.2, 95, 92, 88), "KPI-042": (95, 95, 90, 85),
    "KPI-043": (93, 95, 90, 85), "KPI-044": (72, 70, 60, 50),
}


DEFINITIONS: dict[str, dict[str, str]] = {
    "KPI-001": {"definition": "Toneladas procesadas en 24 horas.", "formula": "Suma de básculas / día", "source": "SCADA, básculas", "frequency": "Diaria", "responsible": "Operaciones", "management_use": "Cumplimiento capacidad"},
    "KPI-003": {"definition": "Tiempo disponible respecto al calendario.", "formula": "(Tiempo calendario - paro) / tiempo calendario", "source": "SCADA, CMMS", "frequency": "Diaria", "responsible": "Mantenimiento", "management_use": "Continuidad operacional"},
    "KPI-019": {"definition": "Proporción de oro recuperado respecto al alimentado.", "formula": "Metal recuperado / metal alimentado", "source": "Laboratorio, balance metalúrgico", "frequency": "Diaria/Semanal", "responsible": "Metalurgia", "management_use": "Valor generado"},
    "KPI-029": {"definition": "Agua nueva consumida por tonelada procesada.", "formula": "m3 agua fresca / t procesada", "source": "Medidores de flujo", "frequency": "Diaria", "responsible": "Servicios/Proceso", "management_use": "Eficiencia hídrica"},
    "KPI-032": {"definition": "Energía total por tonelada procesada.", "formula": "kWh / t procesada", "source": "Medidores eléctricos", "frequency": "Diaria", "responsible": "Energía", "management_use": "Costo y eficiencia"},
    "KPI-034": {"definition": "Tiempo promedio entre fallas.", "formula": "Horas operadas / número de fallas", "source": "CMMS", "frequency": "Semanal", "responsible": "Mantenimiento", "management_use": "Confiabilidad"},
    "KPI-035": {"definition": "Tiempo promedio de reparación.", "formula": "Horas reparación / número de fallas", "source": "CMMS", "frequency": "Semanal", "responsible": "Mantenimiento", "management_use": "Mantenibilidad"},
    "KPI-038": {"definition": "Frecuencia total de incidentes registrables.", "formula": "Incidentes × 200,000 / horas trabajadas", "source": "HSE", "frequency": "Mensual", "responsible": "Seguridad", "management_use": "Desempeño HSE"},
    "KPI-041": {"definition": "Tiempo disponible de la plataforma digital.", "formula": "Tiempo disponible / tiempo calendario", "source": "Monitoreo OT", "frequency": "Semanal", "responsible": "OT/IT", "management_use": "Confiabilidad digital"},
    "KPI-043": {"definition": "Porcentaje de tags válidos y consistentes.", "formula": "Tags válidos / tags esperados", "source": "Historiador", "frequency": "Semanal", "responsible": "OT/Analítica", "management_use": "Confiabilidad de decisiones"},
}


STRATEGIC_KPI_IDS = ["KPI-001", "KPI-003", "KPI-019", "KPI-029", "KPI-032", "KPI-039", "KPI-041"]


def infer_direction(target: float, yellow_limit: float, red_limit: float) -> EvaluationDirection:
    if target >= yellow_limit >= red_limit:
        return EvaluationDirection.HIGHER_IS_BETTER
    if target <= yellow_limit <= red_limit:
        return EvaluationDirection.LOWER_IS_BETTER
    raise ValueError(
        f"Umbrales RAG inválidos: meta={target}, amarillo={yellow_limit}, rojo={red_limit}"
    )


def evaluate_rag(
    value: float,
    target: float,
    yellow_limit: float,
    red_limit: float,
    direction: EvaluationDirection | None = None,
) -> RagStatus:
    direction = direction or infer_direction(target, yellow_limit, red_limit)
    if direction == EvaluationDirection.HIGHER_IS_BETTER:
        if value >= target:
            return RagStatus.GREEN
        if value >= yellow_limit:
            return RagStatus.YELLOW
        if value >= red_limit:
            return RagStatus.RED
        return RagStatus.CRITICAL
    if value <= target:
        return RagStatus.GREEN
    if value <= yellow_limit:
        return RagStatus.YELLOW
    if value <= red_limit:
        return RagStatus.RED
    return RagStatus.CRITICAL


def _updated_at(now: datetime, frequency: str | None, scenario: DemoScenario) -> datetime:
    if scenario == DemoScenario.TARGET:
        if frequency == "Semanal" or frequency == "Diaria/Semanal":
            return now.replace(year=2026, month=7, day=27, hour=7, minute=0, second=0, microsecond=0)
        if frequency == "Mensual":
            return now.replace(year=2026, month=8, day=1, hour=8, minute=0, second=0, microsecond=0)
        return now.replace(year=2026, month=8, day=1, hour=6, minute=0, second=0, microsecond=0)
    if frequency == "Semanal" or frequency == "Diaria/Semanal":
        monday = now - timedelta(days=now.weekday())
        return monday.replace(hour=7, minute=0, second=0, microsecond=0)
    if frequency == "Mensual":
        return now.replace(day=1, hour=8, minute=0, second=0, microsecond=0)
    return now.replace(hour=6, minute=0, second=0, microsecond=0)


def build_kpi_catalog(scenario: DemoScenario, now: datetime) -> list[KpiDefinition]:
    profile = STARTUP_PROFILE if scenario == DemoScenario.STARTUP else TARGET_PROFILE
    result: list[KpiDefinition] = []
    for kpi_id, name, domain, unit, source in KPI_ROWS:
        value, target, yellow_limit, red_limit = profile[kpi_id]
        details = DEFINITIONS.get(kpi_id, {})
        direction = infer_direction(target, yellow_limit, red_limit)
        result.append(KpiDefinition(
            id=kpi_id,
            name=name,
            domain=domain,
            value=value,
            unit=unit,
            target=target,
            yellow_limit=yellow_limit,
            red_limit=red_limit,
            evaluation_direction=direction,
            source=details.get("source", source),
            frequency=details.get("frequency"),
            responsible=details.get("responsible"),
            definition=details.get("definition", "Pendiente de definición"),
            formula=details.get("formula"),
            management_use=details.get("management_use"),
            updated_at=_updated_at(now, details.get("frequency"), scenario),
            status=evaluate_rag(value, target, yellow_limit, red_limit, direction),
        ))
    return result


def _trend_points(raw: list[tuple], now: datetime) -> list[ExecutiveTrendPoint]:
    points: list[ExecutiveTrendPoint] = []
    for row in raw:
        year, month, day = row[0]
        points.append(ExecutiveTrendPoint(
            week=now.replace(year=year, month=month, day=day, hour=0, minute=0, second=0, microsecond=0),
            production_tpd=row[1], availability_pct=row[2], recovery_au_pct=row[3],
            fresh_water_m3_t=row[4], energy_kwh_t=row[5], mtbf_h=row[6], trifr=row[7],
            critical_alarms=int(row[8]), spi=row[9], cpi=row[10],
            plan_cumulative_t=row[11], actual_cumulative_t=row[12], open_issues=int(row[13]),
        ))
    return points


TARGET_TRENDS = [
    ((2026, 5, 11), 930, 90.5, 87.2, 0.88, 29.5, 128, 0.62, 9, 0.92, 0.95, 7000, 6510, 28),
    ((2026, 5, 18), 945, 91.2, 88.0, 0.85, 28.4, 136, 0.58, 8, 0.94, 0.96, 14000, 13125, 25),
    ((2026, 5, 25), 960, 92.0, 88.8, 0.82, 27.6, 145, 0.54, 7, 0.95, 0.98, 21000, 19845, 22),
    ((2026, 6, 1), 975, 92.8, 89.3, 0.80, 26.8, 151, 0.50, 6, 0.97, 0.99, 28000, 26670, 20),
    ((2026, 6, 8), 988, 93.4, 90.0, 0.78, 26.0, 160, 0.46, 5, 0.98, 1.00, 35000, 33586, 17),
    ((2026, 6, 15), 995, 94.0, 90.7, 0.76, 25.4, 168, 0.44, 5, 0.99, 1.01, 42000, 40551, 15),
    ((2026, 6, 22), 1002, 94.2, 91.1, 0.75, 25.0, 174, 0.42, 4, 1.00, 1.02, 49000, 47565, 12),
    ((2026, 6, 29), 998, 94.6, 91.3, 0.74, 24.8, 178, 0.39, 3, 1.00, 1.01, 56000, 54551, 10),
    ((2026, 7, 6), 1005, 94.4, 91.5, 0.73, 24.6, 182, 0.38, 3, 1.01, 1.02, 63000, 61586, 8),
    ((2026, 7, 13), 1000, 94.8, 91.7, 0.72, 24.5, 184, 0.36, 2, 1.00, 1.01, 70000, 68586, 6),
    ((2026, 7, 20), 1008, 94.7, 91.9, 0.72, 24.5, 186, 0.35, 2, 1.01, 1.01, 77000, 75642, 5),
    ((2026, 7, 27), 1000, 94.5, 91.8, 0.72, 24.5, 186, 0.35, 2, 1.00, 1.02, 84000, 82642, 4),
]


STARTUP_TRENDS = [
    ((2026, 5, 11), 332, 79.5, 82.0, 1.28, 30.8, 72, 0.95, 8, 0.85, 0.90, 2800, 2380, 24),
    ((2026, 5, 18), 345, 80.8, 82.8, 1.24, 30.0, 78, 0.90, 7, 0.88, 0.91, 5600, 4900, 23),
    ((2026, 5, 25), 358, 81.6, 83.4, 1.20, 29.3, 84, 0.86, 7, 0.90, 0.92, 8400, 7600, 21),
    ((2026, 6, 1), 369, 82.5, 84.0, 1.17, 28.7, 90, 0.82, 6, 0.92, 0.93, 11200, 10300, 20),
    ((2026, 6, 8), 378, 83.4, 84.7, 1.14, 28.2, 96, 0.79, 6, 0.93, 0.94, 14000, 13050, 18),
    ((2026, 6, 15), 384, 84.2, 85.3, 1.12, 27.7, 102, 0.76, 5, 0.94, 0.95, 16800, 15800, 17),
    ((2026, 6, 22), 389, 85.0, 85.9, 1.10, 27.2, 108, 0.72, 5, 0.95, 0.95, 19600, 18650, 16),
    ((2026, 6, 29), 394, 85.6, 86.4, 1.08, 26.8, 112, 0.69, 4, 0.96, 0.96, 22400, 21400, 15),
    ((2026, 7, 6), 397, 86.2, 86.8, 1.07, 26.4, 116, 0.66, 4, 0.96, 0.97, 25200, 24200, 14),
    ((2026, 7, 13), 400, 86.8, 87.1, 1.06, 26.0, 118, 0.63, 3, 0.97, 0.97, 28000, 27000, 13),
    ((2026, 7, 20), 398, 87.0, 87.4, 1.05, 25.6, 120, 0.61, 3, 0.98, 0.98, 30800, 29800, 12),
    ((2026, 7, 27), 392, 87.2, 87.5, 1.05, 25.2, 120, 0.60, 3, 0.98, 0.98, 33600, 32600, 12),
]


def _risk_level(probability: str, impact: str) -> RagStatus:
    p = {"Baja": 1, "Media": 3, "Media-alta": 4, "Alta": 5}.get(probability, 3)
    i = {"Bajo": 1, "Medio": 3, "Alto": 4, "Muy alto": 5}.get(impact, 3)
    matrix = {
        1: [1, 1, 2, 2, 3],
        2: [1, 2, 2, 3, 4],
        3: [2, 2, 3, 4, 4],
        4: [2, 3, 4, 4, 5],
        5: [3, 4, 4, 5, 5],
    }
    score = matrix[i][p - 1]
    return {1: RagStatus.GREEN, 2: RagStatus.YELLOW, 3: RagStatus.RED}.get(score, RagStatus.CRITICAL)


def _risk(id_: str, title: str, probability: str, impact: str, action: str) -> ExecutiveRisk:
    return ExecutiveRisk(id=id_, title=title, probability=probability, impact=impact, status=_risk_level(probability, impact), action=action)


def _milestone_status(date: datetime, state: str, now: datetime) -> RagStatus:
    if date < now and state.lower() not in {"completado", "cumplido"}:
        return RagStatus.RED
    if state.lower() in {"en preparación", "en curso"}:
        return RagStatus.YELLOW
    return RagStatus.GREEN


def _worst(statuses: Iterable[RagStatus]) -> RagStatus:
    order = {RagStatus.GREEN: 0, RagStatus.YELLOW: 1, RagStatus.RED: 2, RagStatus.CRITICAL: 3}
    values = list(statuses)
    return max(values, key=lambda item: order[item]) if values else RagStatus.GREEN


def build_executive_dashboard(scenario: DemoScenario, now: datetime) -> ExecutiveDashboard:
    kpis = build_kpi_catalog(scenario, now)
    by_id = {item.id: item for item in kpis}

    if scenario == DemoScenario.TARGET:
        trends = _trend_points(TARGET_TRENDS, now)
        control = ExecutiveControl(
            plan_completed_pct=100, actual_completed_pct=100, spi=1.0, cpi=1.02, issues_open=4,
            budget_opex_month_usd_m=2.85, actual_opex_month_usd_m=2.79,
            cost_variance_usd_m=0.06, eac_annual_usd_m=33.8, contingency_consumed_pct=18,
        )
        risks = [
            _risk("R-01", "Variabilidad de ley de cabeza", "Media", "Alto", "Geología: blending semanal"),
            _risk("R-02", "Disponibilidad molino por desgaste", "Media", "Alto", "Mantenimiento: parada planificada"),
            _risk("R-03", "Consumo de agua fresca sobre meta", "Media", "Medio", "Proceso: optimizar recirculación"),
            _risk("R-04", "Saturación de alarmas en turno nocturno", "Baja", "Medio", "OT: racionalización de alarmas"),
            _risk("R-05", "Capacidad futura de presa de jales", "Media", "Muy alto", "Ingeniería: estudio de expansión"),
        ]
        milestone_rows = [
            ("H-01", "Prueba mensual de 1,000 t/d", (2026, 8, 31), "Programado", "Sostener promedio ≥1,000 t/d"),
            ("H-02", "Parada mayor molino", (2026, 9, 15), "Programado", "≤36 h y sin incidentes"),
            ("H-03", "Auditoría ambiental", (2026, 10, 10), "Programado", "Cero hallazgos mayores"),
            ("H-04", "Expansión monitoreo jales", (2026, 11, 20), "En preparación", "100% sensores integrados"),
            ("H-05", "Revisión anual de desempeño", (2026, 12, 15), "Programado", "KPIs estratégicos ≥90%"),
        ]
        achievements = [
            "Producción demo sostenida de 1,000 t/d durante 14 días.",
            "Recuperación Au demo superior a 91.5% durante cuatro semanas.",
            "Disponibilidad demo SCADA/Red de 99.7%.",
            "Reducción demo de 18% en agua fresca desde el ramp-up.",
        ]
        area = [
            AreaPerformance(area="Mina", kpi_id="KPI-006", trend="up"),
            AreaPerformance(area="Trituración", kpi_id="KPI-012", trend="flat"),
            AreaPerformance(area="Molienda", kpi_id="KPI-015", trend="up"),
            AreaPerformance(area="Beneficio", kpi_id="KPI-019", trend="up"),
            AreaPerformance(area="Producto final", kpi_id="KPI-028", trend="flat"),
            AreaPerformance(area="Mantenimiento", kpi_id="KPI-034", trend="up", observation="Mejora sostenida", responsible="Gerente Mantto."),
            AreaPerformance(area="Seguridad", kpi_id="KPI-038", trend="down", observation="Mejor que meta", responsible="Gerente HSE"),
            AreaPerformance(area="Agua y jales", kpi_id="KPI-030", trend="up", observation="Plan de optimización", responsible="Jefe Servicios"),
            AreaPerformance(area="Energía", kpi_id="KPI-032", trend="down", observation="Cercano a meta", responsible="Jefe Energía"),
            AreaPerformance(area="Digitalización", kpi_id="KPI-041", trend="flat", observation="Plataforma demo estable", responsible="OT/IT"),
        ]
    else:
        trends = _trend_points(STARTUP_TRENDS, now)
        control = ExecutiveControl(
            plan_completed_pct=100, actual_completed_pct=97, spi=0.98, cpi=0.98, issues_open=12,
            budget_opex_month_usd_m=1.25, actual_opex_month_usd_m=1.29,
            cost_variance_usd_m=-0.04, eac_annual_usd_m=15.4, contingency_consumed_pct=12,
        )
        risks = [
            _risk("R-01", "Reservas, ley o recuperación insuficientes", "Alta", "Muy alto", "Campaña geológica, pruebas representativas y gates"),
            _risk("R-02", "Permisos, superficie o conflicto comunitario", "Media-alta", "Muy alto", "Auditoría legal y gestión social temprana"),
            _risk("R-03", "Agua, energía o jales no viables", "Media", "Muy alto", "Estudios de alternativas y balances conceptuales"),
            _risk("R-04", "Retrasos en equipos críticos y construcción", "Alta", "Alto", "Plan de adquisiciones y seguimiento de ruta crítica"),
            _risk("R-05", "Sobrecosto o expansión prematura", "Media-alta", "Muy alto", "Control de cambios y Gate 6 con desempeño demostrado"),
        ]
        milestone_rows = [
            ("H-01", "Inicio y PMO", (2026, 9, 1), "Programado", "Charter aprobado, Sponsor y PM designados"),
            ("H-02", "Auditoría legal, geología y metalurgia inicial", (2026, 12, 15), "Programado", "Gate 1 y Gate 2 aprobados"),
            ("H-03", "Ingeniería conceptual y prefactibilidad", (2027, 3, 31), "Programado", "Modelo técnico-económico y Gate 3"),
            ("H-04", "Comisionamiento y arranque 400 t/d", (2028, 12, 15), "Programado", "Pruebas de desempeño y aceptación inicial"),
            ("H-05", "Expansión progresiva", (2029, 8, 31), "Programado", "Gate 6 y capacidad demo de 1,000 t/d"),
        ]
        achievements = [
            "Simulación demo estabilizada alrededor de 400 t/d.",
            "Catálogo conceptual de equipos integrado en una fuente común.",
            "Reporte Operativo local generado desde el backend.",
            "Calidad y actualización demo visibles por equipo.",
        ]
        area = [
            AreaPerformance(area="Mina", kpi_id="KPI-006", trend="up", observation="Estabilización demo"),
            AreaPerformance(area="Trituración", kpi_id="KPI-012", trend="up", observation="Disponibilidad en aumento"),
            AreaPerformance(area="Molienda", kpi_id="KPI-015", trend="up", observation="Cercano a capacidad de arranque"),
            AreaPerformance(area="Beneficio", kpi_id="KPI-019", trend="up", observation="Valor exclusivamente demo"),
            AreaPerformance(area="Producto final", kpi_id="KPI-028", trend="flat"),
            AreaPerformance(area="Mantenimiento", kpi_id="KPI-034", trend="up", observation="Confiabilidad en estabilización"),
            AreaPerformance(area="Seguridad", kpi_id="KPI-038", trend="down"),
            AreaPerformance(area="Agua y jales", kpi_id="KPI-030", trend="up", observation="Recirculación en optimización"),
            AreaPerformance(area="Energía", kpi_id="KPI-032", trend="down", observation="Consumo específico en ajuste"),
            AreaPerformance(area="Digitalización", kpi_id="KPI-041", trend="up", observation="Sin conexiones reales"),
        ]

    milestones: list[ExecutiveMilestone] = []
    for id_, title, date_parts, state, criterion in milestone_rows:
        date = now.replace(year=date_parts[0], month=date_parts[1], day=date_parts[2], hour=8, minute=0, second=0, microsecond=0)
        milestones.append(ExecutiveMilestone(
            id=id_, title=title, date=date, state=state,
            status=_milestone_status(date, state, now), criterion=criterion,
        ))

    production_status = _worst(by_id[id_].status for id_ in ["KPI-001", "KPI-003", "KPI-005"])
    cost_status = _worst(by_id[id_].status for id_ in ["KPI-032", "KPI-036"])
    quality_status = _worst(by_id[id_].status for id_ in ["KPI-024", "KPI-028", "KPI-043"])
    safety_status = _worst(by_id[id_].status for id_ in ["KPI-038", "KPI-039"])
    risk_status = _worst(item.status for item in risks)
    overall_status = _worst(by_id[id_].status for id_ in STRATEGIC_KPI_IDS)
    general_rag = [
        GeneralRagItem(id="overall", label="Overall", status=overall_status, supporting_kpi_ids=STRATEGIC_KPI_IDS),
        GeneralRagItem(id="production", label="Producción", status=production_status, supporting_kpi_ids=["KPI-001", "KPI-003", "KPI-005"]),
        GeneralRagItem(id="cost", label="Costo", status=cost_status, supporting_kpi_ids=["KPI-032", "KPI-036"]),
        GeneralRagItem(id="quality", label="Calidad", status=quality_status, supporting_kpi_ids=["KPI-024", "KPI-028", "KPI-043"]),
        GeneralRagItem(id="risks", label="Riesgos", status=risk_status),
        GeneralRagItem(id="safety", label="Seguridad", status=safety_status, supporting_kpi_ids=["KPI-038", "KPI-039"]),
    ]

    return ExecutiveDashboard(
        kpis=kpis,
        strategic_kpi_ids=STRATEGIC_KPI_IDS,
        general_rag=general_rag,
        area_performance=area,
        trends=trends,
        control=control,
        risks=risks,
        milestones=milestones,
        achievements=achievements,
        source_notice="Fuentes y frecuencias son metadatos demo tomados de la referencia; no representan conexiones activas.",
    )
