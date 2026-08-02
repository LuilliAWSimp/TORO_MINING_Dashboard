from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class DemoScenario(str, Enum):
    STARTUP = "startup"
    TARGET = "target"


class DataQuality(str, Enum):
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"
    OFFLINE = "offline"


class EquipmentStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    WARNING = "warning"
    ALARM = "alarm"
    OFFLINE = "offline"


class EvaluationDirection(str, Enum):
    HIGHER_IS_BETTER = "higher_is_better"
    LOWER_IS_BETTER = "lower_is_better"


class RagStatus(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"
    CRITICAL = "critical"


class ScenarioInfo(BaseModel):
    id: DemoScenario
    label: str
    short_label: str
    capacity_tpd: float
    target_month: int | None = None


class SensorDefinition(BaseModel):
    id: str
    name: str
    metric: str
    unit: str
    decimals: int = 1
    min_value: float | None = None
    max_value: float | None = None


class EquipmentDefinition(BaseModel):
    id: str
    name: str
    area_id: str
    equipment_type: str
    description: str
    conceptual: bool = True
    sensors: list[SensorDefinition] = Field(default_factory=list)


class AreaDefinition(BaseModel):
    id: str
    name: str
    order: int
    description: str
    equipment_ids: list[str] = Field(default_factory=list)


class KpiDefinition(BaseModel):
    id: str
    name: str
    domain: str
    value: float
    unit: str
    target: float
    yellow_limit: float
    red_limit: float
    evaluation_direction: EvaluationDirection
    optimal_min: float | None = None
    optimal_max: float | None = None
    warning_min: float | None = None
    warning_max: float | None = None
    critical_min: float | None = None
    critical_max: float | None = None
    source: str
    frequency: str | None = None
    responsible: str | None = None
    definition: str | None = None
    formula: str | None = None
    management_use: str | None = None
    updated_at: datetime
    status: RagStatus


class CatalogResponse(BaseModel):
    mine: str
    scenario: ScenarioInfo
    phase: str
    objective_tpd: float
    future_target_tpd: float
    inventory_status: str
    source_label: str
    source_notice: str
    areas: list[AreaDefinition]
    equipment: list[EquipmentDefinition]
    kpis: list[KpiDefinition]


class Measurement(BaseModel):
    sensor_id: str
    name: str
    metric: str
    value: float | None
    unit: str
    quality: DataQuality
    timestamp: datetime


class EquipmentState(BaseModel):
    id: str
    name: str
    area_id: str
    equipment_type: str
    description: str
    conceptual: bool
    status: EquipmentStatus
    status_label: str
    quality: DataQuality
    last_update: datetime
    measurements: list[Measurement]


class TrendPoint(BaseModel):
    timestamp: datetime
    production_tph: float
    production_cumulative_t: float
    power_kw: float
    energy_cumulative_kwh: float
    water_recirculation_pct: float
    fresh_water_m3h: float


class KPISet(BaseModel):
    production_current_tph: float
    production_today_t: float
    objective_tpd: float
    objective_progress_pct: float
    power_kw: float
    energy_today_kwh: float
    specific_energy_kwh_t: float
    water_recirculation_pct: float
    equipment_running: int
    equipment_stopped: int
    equipment_warning: int
    equipment_alarm: int
    equipment_offline: int
    active_alarms: int


class AlarmEvent(BaseModel):
    id: str
    severity: Literal["info", "warning", "critical", "offline"]
    equipment_id: str
    equipment_name: str
    area_id: str
    title: str
    message: str
    active_since: datetime
    acknowledged: bool = False


class ExecutiveTrendPoint(BaseModel):
    week: datetime
    production_tpd: float
    availability_pct: float
    recovery_au_pct: float
    fresh_water_m3_t: float
    energy_kwh_t: float
    mtbf_h: float
    trifr: float
    critical_alarms: int
    spi: float
    cpi: float
    plan_cumulative_t: float
    actual_cumulative_t: float
    open_issues: int


class GeneralRagItem(BaseModel):
    id: str
    label: str
    status: RagStatus
    supporting_kpi_ids: list[str] = Field(default_factory=list)


class AreaPerformance(BaseModel):
    area: str
    kpi_id: str
    trend: Literal["up", "down", "flat"]
    observation: str | None = None
    responsible: str | None = None


class ExecutiveControl(BaseModel):
    plan_completed_pct: float
    actual_completed_pct: float
    spi: float
    cpi: float
    issues_open: int
    budget_opex_month_usd_m: float
    actual_opex_month_usd_m: float
    cost_variance_usd_m: float
    eac_annual_usd_m: float
    contingency_consumed_pct: float


class ExecutiveRisk(BaseModel):
    id: str
    title: str
    probability: str
    impact: str
    status: RagStatus
    action: str


class ExecutiveMilestone(BaseModel):
    id: str
    title: str
    date: datetime
    state: str
    status: RagStatus
    criterion: str


class ExecutiveDashboard(BaseModel):
    kpis: list[KpiDefinition]
    strategic_kpi_ids: list[str]
    general_rag: list[GeneralRagItem]
    area_performance: list[AreaPerformance]
    trends: list[ExecutiveTrendPoint]
    control: ExecutiveControl
    risks: list[ExecutiveRisk]
    milestones: list[ExecutiveMilestone]
    achievements: list[str]
    source_notice: str


class DashboardSnapshot(BaseModel):
    mine: str
    scenario: ScenarioInfo
    shift: str
    generated_at: datetime
    last_reading_at: datetime
    overall_quality: DataQuality
    source_label: str
    demo_notice: str
    catalog_status: str
    kpis: KPISet
    equipment: list[EquipmentState]
    alarms: list[AlarmEvent]
    trends: list[TrendPoint]
    executive: ExecutiveDashboard


class EquipmentDetailResponse(BaseModel):
    scenario: ScenarioInfo
    equipment: EquipmentState
    history: list[dict[str, float | str | datetime | None]]


class ReportRequest(BaseModel):
    scenario: DemoScenario = DemoScenario.STARTUP
    period: Literal["current_shift", "day", "custom"] = "current_shift"
    shift: Literal["current", "1", "2", "3"] = "current"
    start: datetime | None = None
    end: datetime | None = None
