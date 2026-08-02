import type { KpiDefinition } from '../types/contracts'
import { formatKpiValue, formatNumber } from '../utils/format'
import { calculateKpiCompliance } from '../utils/kpiCompliance'

interface KpiComplianceBarProps {
  kpi: KpiDefinition
  compact?: boolean
  showValues?: boolean
  label?: 'Cumplimiento' | 'Condición operativa'
}

export function KpiComplianceBar({
  kpi,
  compact = false,
  showValues = true,
  label = 'Cumplimiento',
}: KpiComplianceBarProps) {
  const compliance = calculateKpiCompliance(kpi)
  const rounded = Math.round(compliance)

  return (
    <div
      className={`kpi-compliance ${compact ? 'kpi-compliance-compact' : ''}`}
      aria-label={`${label} de ${kpi.name}: ${rounded} por ciento. Valor actual ${formatKpiValue(kpi.value, kpi.unit)}. Meta ${formatKpiValue(kpi.target, kpi.unit)}.`}
    >
      <div className="kpi-compliance-heading">
        <span>{label}</span>
        <strong>{formatNumber(compliance, 0)} %</strong>
      </div>
      <div className="kpi-compliance-track" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={rounded}>
        <span className="kpi-compliance-tick kpi-compliance-tick-red" aria-hidden="true" />
        <span className="kpi-compliance-tick kpi-compliance-tick-yellow" aria-hidden="true" />
        <span className={`kpi-compliance-fill kpi-compliance-fill-${kpi.status}`} style={{ width: `${compliance}%` }} />
        <span className="kpi-compliance-target" title="Meta = 100 %" aria-hidden="true" />
      </div>
      {showValues && (
        <div className="kpi-compliance-values">
          <span>Actual <strong>{formatKpiValue(kpi.value, kpi.unit)}</strong></span>
          <span>Meta <strong>{formatKpiValue(kpi.target, kpi.unit)}</strong></span>
        </div>
      )}
    </div>
  )
}
