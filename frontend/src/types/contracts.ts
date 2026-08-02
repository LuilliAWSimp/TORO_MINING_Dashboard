export type DemoScenario = 'startup' | 'target'
export type DataQuality = 'good' | 'warning' | 'critical' | 'offline'
export type EquipmentStatus = 'running' | 'stopped' | 'warning' | 'alarm' | 'offline'
export type EvaluationDirection = 'higher_is_better' | 'lower_is_better'
export type RagStatus = 'green' | 'yellow' | 'red' | 'critical'

export interface ScenarioInfo {
  id: DemoScenario
  label: string
  short_label: string
  capacity_tpd: number
  target_month: number | null
}

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

export interface KpiDefinition {
  id: string
  name: string
  domain: string
  value: number
  unit: string
  target: number
  yellow_limit: number
  red_limit: number
  evaluation_direction: EvaluationDirection
  optimal_min: number | null
  optimal_max: number | null
  warning_min: number | null
  warning_max: number | null
  critical_min: number | null
  critical_max: number | null
  source: string
  frequency: string | null
  responsible: string | null
  definition: string | null
  formula: string | null
  management_use: string | null
  updated_at: string
  status: RagStatus
}

export interface CatalogResponse {
  mine: string
  scenario: ScenarioInfo
  phase: string
  objective_tpd: number
  future_target_tpd: number
  inventory_status: string
  source_label: string
  source_notice: string
  areas: AreaDefinition[]
  equipment: EquipmentDefinition[]
  kpis: KpiDefinition[]
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

export interface ExecutiveTrendPoint {
  week: string
  production_tpd: number
  availability_pct: number
  recovery_au_pct: number
  fresh_water_m3_t: number
  energy_kwh_t: number
  mtbf_h: number
  trifr: number
  critical_alarms: number
  spi: number
  cpi: number
  plan_cumulative_t: number
  actual_cumulative_t: number
  open_issues: number
}

export interface GeneralRagItem {
  id: string
  label: string
  status: RagStatus
  supporting_kpi_ids: string[]
}

export interface AreaPerformance {
  area: string
  kpi_id: string
  trend: 'up' | 'down' | 'flat'
  observation: string | null
  responsible: string | null
}

export interface ExecutiveControl {
  plan_completed_pct: number
  actual_completed_pct: number
  spi: number
  cpi: number
  issues_open: number
  budget_opex_month_usd_m: number
  actual_opex_month_usd_m: number
  cost_variance_usd_m: number
  eac_annual_usd_m: number
  contingency_consumed_pct: number
}

export interface ExecutiveRisk {
  id: string
  title: string
  probability: string
  impact: string
  status: RagStatus
  action: string
}

export interface ExecutiveMilestone {
  id: string
  title: string
  date: string
  state: string
  status: RagStatus
  criterion: string
}

export interface ExecutiveDashboard {
  kpis: KpiDefinition[]
  strategic_kpi_ids: string[]
  general_rag: GeneralRagItem[]
  area_performance: AreaPerformance[]
  trends: ExecutiveTrendPoint[]
  control: ExecutiveControl
  risks: ExecutiveRisk[]
  milestones: ExecutiveMilestone[]
  achievements: string[]
  source_notice: string
}

export interface DashboardSnapshot {
  mine: string
  scenario: ScenarioInfo
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
  executive: ExecutiveDashboard
}

export interface EquipmentDetailResponse {
  scenario: ScenarioInfo
  equipment: EquipmentState
  history: Array<Record<string, string | number | null>>
}
