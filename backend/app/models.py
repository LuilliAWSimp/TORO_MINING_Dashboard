from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


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


class CatalogResponse(BaseModel):
    mine: str
    phase: str
    objective_tpd: float
    future_target_tpd: float
    inventory_status: str
    source_label: str
    areas: list[AreaDefinition]
    equipment: list[EquipmentDefinition]


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


class DashboardSnapshot(BaseModel):
    mine: str
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


class EquipmentDetailResponse(BaseModel):
    equipment: EquipmentState
    history: list[dict[str, float | str | datetime | None]]


class ReportRequest(BaseModel):
    period: Literal["current_shift", "day", "custom"] = "current_shift"
    shift: Literal["current", "1", "2", "3"] = "current"
    start: datetime | None = None
    end: datetime | None = None
