import { Database, LoaderCircle } from 'lucide-react'
import type { DashboardSnapshot, DemoScenario } from '../types/contracts'

const options: Array<{ id: DemoScenario; label: string }> = [
  { id: 'startup', label: 'Arranque · 400 t/d' },
  { id: 'target', label: 'Objetivo · 1,000 t/d' },
]

export function DemoStrip({
  snapshot,
  scenario,
  setScenario,
  changing,
}: {
  snapshot: DashboardSnapshot | null
  scenario: DemoScenario
  setScenario: (scenario: DemoScenario) => void
  changing: boolean
}) {
  return (
    <div className="demo-strip" role="status" aria-busy={changing}>
      <div className="demo-strip-copy">
        <Database size={16} aria-hidden="true" />
        <strong>DATOS DEMO</strong>
        <span>{changing ? 'Cambiando escenario…' : snapshot?.demo_notice ?? 'Simulación local conceptual en preparación.'}</span>
      </div>
      <div className="scenario-control" aria-label="Escenario demo">
        <span>Escenario demo</span>
        <div className="scenario-segments">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={scenario === option.id ? 'active' : ''}
              onClick={() => setScenario(option.id)}
              disabled={changing || scenario === option.id}
              aria-pressed={scenario === option.id}
            >
              {changing && scenario === option.id ? <LoaderCircle size={12} className="spin" /> : null}
              {option.label}
            </button>
          ))}
        </div>
        <select
          className="scenario-select"
          value={scenario}
          onChange={(event) => setScenario(event.target.value as DemoScenario)}
          disabled={changing}
          aria-label="Escenario demo activo"
        >
          {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </div>
      <span className="demo-catalog">{snapshot?.catalog_status ?? 'Catálogo conceptual no confirmado'}</span>
    </div>
  )
}
