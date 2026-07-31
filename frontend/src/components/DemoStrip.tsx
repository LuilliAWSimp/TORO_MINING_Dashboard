import { FlaskConical } from 'lucide-react'
import type { DashboardSnapshot } from '../types/contracts'

export function DemoStrip({ snapshot }: { snapshot: DashboardSnapshot | null }) {
  return (
    <div className="demo-strip" role="status">
      <FlaskConical size={16} aria-hidden="true" />
      <strong>DATOS DEMO</strong>
      <span>{snapshot?.demo_notice ?? 'Simulación local conceptual en preparación.'}</span>
      <span className="demo-catalog">{snapshot?.catalog_status ?? 'Catálogo conceptual no confirmado'}</span>
    </div>
  )
}
