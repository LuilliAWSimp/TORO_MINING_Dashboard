import { Info } from 'lucide-react'
import type { KpiDefinition } from '../types/contracts'
import { formatKpiValue } from '../utils/format'
import { StatusBadge } from './StatusBadge'

export function ExecutiveKpiCard({ kpi, onSelect }: { kpi: KpiDefinition; onSelect: (kpi: KpiDefinition) => void }) {
  return (
    <button type="button" className={`executive-kpi rag-border-${kpi.status}`} onClick={() => onSelect(kpi)}>
      <div className="executive-kpi-heading">
        <span>{kpi.name}</span>
        <Info size={14} aria-hidden="true" />
      </div>
      <strong>{formatKpiValue(kpi.value, kpi.unit)}</strong>
      <div className="executive-kpi-footer">
        <StatusBadge type={kpi.status} />
        <span>Meta {formatKpiValue(kpi.target, kpi.unit)}</span>
      </div>
    </button>
  )
}
