import { AlertTriangle, BellRing, Clock3, RadioTower } from 'lucide-react'
import { useDashboard } from '../components/DashboardContext'
import { KpiCard } from '../components/KpiCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { formatDateTime } from '../utils/format'

export function AlarmsPage() {
  const { snapshot, selectEquipment } = useDashboard()
  if (!snapshot) return null
  const warningCount = snapshot.alarms.filter((item) => item.severity === 'warning').length
  const criticalCount = snapshot.alarms.filter((item) => item.severity === 'critical').length
  const offlineCount = snapshot.alarms.filter((item) => item.severity === 'offline').length

  return (
    <div className="page">
      <SectionHeader title="Alarmas" subtitle="Eventos activos de la simulación local. No existe reconocimiento ni escritura a PLC/SCADA." actions={<StatusBadge type="demo" />} />
      <div className="kpi-grid four-columns">
        <KpiCard label="Alarmas activas" value={String(snapshot.alarms.length)} icon={BellRing} tone="critical" detail="Eventos demo" />
        <KpiCard label="Críticas" value={String(criticalCount)} icon={AlertTriangle} tone="critical" detail="Atención prioritaria" />
        <KpiCard label="Advertencias" value={String(warningCount)} icon={Clock3} tone="warning" detail="Condición preventiva" />
        <KpiCard label="Sin comunicación" value={String(offlineCount)} icon={RadioTower} tone="info" detail="Pérdida simulada" />
      </div>
      <section className="panel alarms-panel">
        <div className="panel-heading"><div><h3>Eventos relevantes</h3><p>Selecciona una fila para abrir el detalle del equipo.</p></div></div>
        <div className="alarm-table-list">
          {snapshot.alarms.map((alarm) => (
            <button key={alarm.id} onClick={() => {
              const equipment = snapshot.equipment.find((item) => item.id === alarm.equipment_id)
              if (equipment) selectEquipment(equipment)
            }}>
              <div className={`alarm-severity-line severity-${alarm.severity}`} />
              <StatusBadge type={alarm.severity} />
              <div className="alarm-main"><strong>{alarm.title}</strong><span>{alarm.message}</span></div>
              <div className="alarm-equipment"><strong>{alarm.equipment_name}</strong><span>{alarm.equipment_id}</span></div>
              <time>{formatDateTime(alarm.active_since)}</time>
            </button>
          ))}
        </div>
      </section>
      <section className="panel note-panel">
        <strong>Seguridad de integración</strong>
        <p>Esta primera versión solo lee su proveedor local demo. No contiene comandos, setpoints, acuses ni rutas de escritura hacia sistemas de control.</p>
      </section>
    </div>
  )
}
