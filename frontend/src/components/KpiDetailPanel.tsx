import { Database, Info, X } from 'lucide-react'
import type { KpiDefinition } from '../types/contracts'
import { formatDateTime, formatKpiValue } from '../utils/format'
import { StatusBadge } from './StatusBadge'

export function KpiDetailPanel({ kpi, onClose }: { kpi: KpiDefinition | null; onClose: () => void }) {
  if (!kpi) return null
  return (
    <div className="kpi-detail-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="kpi-detail-panel" aria-label={`Detalle de ${kpi.name}`}>
        <div className="drawer-header">
          <div>
            <small>{kpi.id} · {kpi.domain}</small>
            <h2>{kpi.name}</h2>
            <p>Catálogo ejecutivo de datos demo</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar detalle"><X size={19} /></button>
        </div>
        <div className="kpi-detail-value">
          <span>Valor del escenario</span>
          <strong>{formatKpiValue(kpi.value, kpi.unit)}</strong>
          <StatusBadge type={kpi.status} />
        </div>
        <div className="kpi-threshold-grid">
          <div><span>Meta</span><strong>{formatKpiValue(kpi.target, kpi.unit)}</strong></div>
          <div><span>Límite amarillo</span><strong>{formatKpiValue(kpi.yellow_limit, kpi.unit)}</strong></div>
          <div><span>Límite rojo</span><strong>{formatKpiValue(kpi.red_limit, kpi.unit)}</strong></div>
          <div><span>Evaluación</span><strong>{kpi.evaluation_direction === 'higher_is_better' ? 'Mayor es mejor' : 'Menor es mejor'}</strong></div>
        </div>
        <section className="kpi-detail-section">
          <h3><Info size={16} /> Definición</h3>
          <p>{kpi.definition ?? 'Pendiente de definición'}</p>
          <dl>
            <div><dt>Fórmula / criterio</dt><dd>{kpi.formula ?? 'Pendiente de definición'}</dd></div>
            <div><dt>Uso gerencial</dt><dd>{kpi.management_use ?? 'Pendiente de definición'}</dd></div>
            <div><dt>Responsable</dt><dd>{kpi.responsible ?? 'Pendiente de definición'}</dd></div>
          </dl>
        </section>
        <section className="kpi-detail-section">
          <h3><Database size={16} /> Metadatos demo</h3>
          <dl>
            <div><dt>Fuente</dt><dd>{kpi.source}</dd></div>
            <div><dt>Frecuencia</dt><dd>{kpi.frequency ?? 'Pendiente de definición'}</dd></div>
            <div><dt>Última actualización</dt><dd>{formatDateTime(kpi.updated_at)}</dd></div>
          </dl>
        </section>
        <div className="drawer-note">La fuente es un metadato de referencia. No existe conexión activa con sistemas reales.</div>
      </aside>
    </div>
  )
}
