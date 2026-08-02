import { Activity, Clock3, Database, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { EquipmentDetailResponse, EquipmentState } from '../types/contracts'
import { formatDateTime } from '../utils/format'
import { StatusBadge } from './StatusBadge'
import { TimeSeriesChart } from './TimeSeriesChart'

const chartColors = ['#C9A227', '#4E8AA8', '#4EA47A']

export function EquipmentDetailDrawer({ equipment, onClose }: { equipment: EquipmentState | null; onClose: () => void }) {
  const [detail, setDetail] = useState<EquipmentDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!equipment) {
      setDetail(null)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    api.getEquipment(equipment.id, controller.signal)
      .then(setDetail)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [equipment])

  const chartData = useMemo(() => {
    if (!detail) return []
    return detail.history.map((row) => ({ ...row }))
  }, [detail])

  if (!equipment) return null
  const current = detail?.equipment ?? equipment
  const series = current.measurements.slice(0, 3).map((item, index) => ({
    key: item.sensor_id,
    label: item.name,
    unit: item.unit,
    color: chartColors[index],
    type: index === 0 ? 'area' as const : 'line' as const,
  }))

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="equipment-drawer" aria-label={`Detalle de ${current.name}`}>
        <div className="drawer-header">
          <div>
            <small>Detalle de equipo conceptual</small>
            <h2>{current.name}</h2>
            <p>{current.equipment_type}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar detalle"><X size={19} /></button>
        </div>
        <div className="drawer-status-row">
          <StatusBadge type={current.status} />
          <StatusBadge type="demo" />
        </div>
        <p className="drawer-description">{current.description}</p>
        <div className="drawer-meta-grid">
          <div><Clock3 size={16} /><span><small>Última actualización</small><strong>{formatDateTime(current.last_update)}</strong></span></div>
          <div><Database size={16} /><span><small>Fuente</small><strong>DemoDataProvider</strong></span></div>
        </div>
        <section className="drawer-section">
          <h3><Activity size={17} /> Lecturas actuales</h3>
          <div className="measurement-grid">
            {current.measurements.map((item) => (
              <div key={item.sensor_id} className="measurement-item">
                <span>{item.name}</span>
                <strong>{item.value == null ? 'N/D' : item.value.toLocaleString('es-MX')} <small>{item.value == null ? '' : item.unit}</small></strong>
                <StatusBadge type={item.quality} />
              </div>
            ))}
          </div>
        </section>
        <section className="drawer-section">
          <h3>Tendencia demo · 6 horas</h3>
          {loading ? <div className="drawer-loading">Cargando tendencia…</div> : (
            <TimeSeriesChart data={chartData} series={series} height={260} showLegend />
          )}
        </section>
        <div className="drawer-note">Catálogo conceptual no confirmado. No usar para operación real.</div>
      </aside>
    </div>
  )
}
