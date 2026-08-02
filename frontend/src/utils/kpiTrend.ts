import type { ExecutiveTrendPoint, KpiDefinition } from '../types/contracts'
import type { ChartSeriesDefinition } from '../components/SharedChartTooltip'

const KPI_TREND_KEYS: Partial<Record<string, keyof ExecutiveTrendPoint>> = {
  'KPI-001': 'production_tpd',
  'KPI-003': 'availability_pct',
  'KPI-019': 'recovery_au_pct',
  'KPI-029': 'fresh_water_m3_t',
  'KPI-032': 'energy_kwh_t',
  'KPI-034': 'mtbf_h',
  'KPI-038': 'trifr',
  'KPI-040': 'critical_alarms',
}

export function getKpiTrendSeries(kpi: KpiDefinition): ChartSeriesDefinition | null {
  const key = KPI_TREND_KEYS[kpi.id]
  if (!key) return null
  return {
    key,
    label: kpi.name,
    unit: kpi.unit,
    color: 'var(--chart-series-gold)',
    type: 'area',
  }
}
