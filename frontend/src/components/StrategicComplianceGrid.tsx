import type { KpiDefinition } from '../types/contracts'
import { KpiComplianceBar } from './KpiComplianceBar'
import { StatusBadge } from './StatusBadge'

export function StrategicComplianceGrid({ kpis }: { kpis: KpiDefinition[] }) {
  return (
    <div className="strategic-compliance-grid" aria-label="Cumplimiento de KPIs estratégicos">
      {kpis.map((kpi) => (
        <article key={kpi.id} className={`strategic-compliance-item rag-border-${kpi.status}`}>
          <div className="strategic-compliance-title">
            <span>{kpi.name}</span>
            <StatusBadge type={kpi.status} />
          </div>
          <KpiComplianceBar kpi={kpi} />
        </article>
      ))}
    </div>
  )
}
