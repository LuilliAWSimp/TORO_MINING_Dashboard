export type DataQuality = 'good' | 'warning' | 'critical' | 'offline'
export type EquipmentStatus = 'running' | 'stopped' | 'warning' | 'alarm' | 'offline'

export interface SensorDefinition {
  id: string
  name: string
  metric: string
  unit: string
  decimals: number
  min_value: number | null
  max_value: number | null
}

export interface EquipmentDefinition {
  id: string
  name: string
  area_id: string
  equipment_type: string
  description: string
  conceptual: boolean
  sensors: SensorDefinition[]
}

export interface AreaDefinition {
  id: string
  name: string
  order: number
  description: string
  equipment_ids: string[]
}

export interface CatalogResponse {
  mine: string
  phase: string
  objective_tpd: number
  future_target_tpd: number
  inventory_status: string
  source_label: string
  areas: AreaDefinition[]
  equipment: EquipmentDefinition[]
}

export interface Measurement {
  sensor_id: string
  name: string
  metric: string
  value: number | null
  unit: string
  quality: DataQuality
  timestamp: string
}

export interface EquipmentState {
  id: string
  name: string
  area_id: string
  equipment_type: string
  description: string
  conceptual: boolean
  status: EquipmentStatus
  status_label: string
  quality: DataQuality
  last_update: string
  measurements: Measurement[]
}

export interface TrendPoint {
  timestamp: string
  production_tph: number
  production_cumulative_t: number
  power_kw: number
  energy_cumulative_kwh: number
  water_recirculation_pct: number
  fresh_water_m3h: number
}

export interface KPISet {
  production_current_tph: number
  production_today_t: number
  objective_tpd: number
  objective_progress_pct: number
  power_kw: number
  energy_today_kwh: number
  specific_energy_kwh_t: number
  water_recirculation_pct: number
  equipment_running: number
  equipment_stopped: number
  equipment_warning: number
  equipment_alarm: number
  equipment_offline: number
  active_alarms: number
}

export interface AlarmEvent {
  id: string
  severity: 'info' | 'warning' | 'critical' | 'offline'
  equipment_id: string
  equipment_name: string
  area_id: string
  title: string
  message: string
  active_since: string
  acknowledged: boolean
}

export interface DashboardSnapshot {
  mine: string
  shift: string
  generated_at: string
  last_reading_at: string
  overall_quality: DataQuality
  source_label: string
  demo_notice: string
  catalog_status: string
  kpis: KPISet
  equipment: EquipmentState[]
  alarms: AlarmEvent[]
  trends: TrendPoint[]
}

export interface EquipmentDetailResponse {
  equipment: EquipmentState
  history: Array<Record<string, string | number | null>>
}
