import {
  AlertTriangle,
  BatteryCharging,
  Boxes,
  Droplets,
  Factory,
  Gauge,
  Power,
  Scale,
  Zap,
} from 'lucide-react'
import { ChartPanel } from '../components/ChartPanel'
import { useDashboard } from '../components/DashboardContext'
import { KpiCard } from '../components/KpiCard'
import { ProcessFlow } from '../components/ProcessFlow'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import { formatNumber, formatTime } from '../utils/format'

export function SummaryPage() {
  const { snapshot, catalog, selectEquipment } = useDashboard()
  if (!snapshot || !catalog) return null
  const k = snapshot.kpis
  const equipmentTotal = snapshot.equipment.length

  return (
    <div className="page page-summary">
      <SectionHeader
        title="Resumen operativo"
        subtitle="Vista integrada del proceso conceptual, producción, energía y agua."
        actions={
          <div className="reading-status">
            <StatusBadge type={snapshot.overall_quality} label="Calidad general" />
            <span>Última lectura <strong>{formatTime(snapshot.last_reading_at, true)}</strong></span>
          </div>
        }
      />

      <div className="kpi-grid summary-kpis">
        <KpiCard label="Producción actual" value={`${formatNumber(k.production_current_tph)} t/h`} icon={Factory} detail="Ritmo demo del proceso" tone="gold" trend="up" />
        <KpiCard label="Acumulado del día" value={`${formatNumber(k.production_today_t)} t`} icon={Scale} detail={`${formatNumber(k.objective_progress_pct)} % de ${formatNumber(k.objective_tpd, 0)} t/d`} tone="gold" />
        <KpiCard label="Demanda eléctrica" value={`${formatNumber(k.power_kw)} kW`} icon={Zap} detail="Demanda instantánea demo" tone="info" />
        <KpiCard label="Energía acumulada" value={`${formatNumber(k.energy_today_kwh)} kWh`} icon={BatteryCharging} detail={`${formatNumber(k.specific_energy_kwh_t, 2)} kWh/t`} tone="info" />
        <KpiCard label="Agua recirculada" value={`${formatNumber(k.water_recirculation_pct)} %`} icon={Droplets} detail="Balance conceptual" tone="good" />
        <KpiCard label="Equipos operando" value={`${k.equipment_running} / ${equipmentTotal}`} icon={Power} detail={`${k.equipment_stopped} detenidos · ${k.equipment_offline} sin comunicación`} tone="good" />
        <KpiCard label="Condiciones anormales" value={`${k.equipment_warning + k.equipment_alarm}`} icon={Gauge} detail={`${k.equipment_warning} advertencia · ${k.equipment_alarm} alarma`} tone="warning" />
        <KpiCard label="Alarmas activas" value={String(k.active_alarms)} icon={AlertTriangle} detail="Incluye pérdida de comunicación" tone="critical" />
      </div>

      <section className="panel process-panel">
        <div className="panel-heading">
          <div>
            <h3>Flujo simplificado de planta</h3>
            <p>Selecciona cualquier equipo para consultar sus lecturas y tendencia demo.</p>
          </div>
          <StatusBadge type="demo" label="P&ID conceptual" />
        </div>
        <ProcessFlow catalog={catalog} equipment={snapshot.equipment} onSelect={selectEquipment} />
      </section>

      <div className="chart-grid three-columns">
        <ChartPanel title="Producción" subtitle="Últimas 12 horas">
          <TimeSeriesChart
            data={snapshot.trends}
            series={[{ key: 'production_tph', label: 'Producción', unit: 't/h', color: '#C9A227', type: 'area' }]}
            height={220}
          />
        </ChartPanel>
        <ChartPanel title="Energía" subtitle="Demanda eléctrica">
          <TimeSeriesChart
            data={snapshot.trends}
            series={[{ key: 'power_kw', label: 'Potencia', unit: 'kW', color: '#4E8AA8', type: 'area' }]}
            height={220}
          />
        </ChartPanel>
        <ChartPanel title="Agua" subtitle="Recirculación conceptual">
          <TimeSeriesChart
            data={snapshot.trends}
            series={[{ key: 'water_recirculation_pct', label: 'Recirculación', unit: '%', color: '#4EA47A', type: 'area' }]}
            height={220}
            domain={[70, 90]}
          />
        </ChartPanel>
      </div>

      <div className="summary-bottom-grid">
        <section className="panel compact-status-panel">
          <div className="panel-heading"><div><h3>Estado de equipos</h3><p>Distribución actual</p></div><Boxes size={19} /></div>
          <div className="status-matrix">
            <div><StatusBadge type="running" /><strong>{k.equipment_running}</strong></div>
            <div><StatusBadge type="stopped" /><strong>{k.equipment_stopped}</strong></div>
            <div><StatusBadge type="warning" /><strong>{k.equipment_warning}</strong></div>
            <div><StatusBadge type="alarm" /><strong>{k.equipment_alarm}</strong></div>
            <div><StatusBadge type="offline" /><strong>{k.equipment_offline}</strong></div>
          </div>
        </section>
        <section className="panel alarm-preview-panel">
          <div className="panel-heading"><div><h3>Alarmas relevantes</h3><p>Eventos activos de la simulación</p></div><AlertTriangle size={19} /></div>
          <div className="alarm-preview-list">
            {snapshot.alarms.map((alarm) => (
              <button key={alarm.id} onClick={() => {
                const equipment = snapshot.equipment.find((item) => item.id === alarm.equipment_id)
                if (equipment) selectEquipment(equipment)
              }}>
                <StatusBadge type={alarm.severity} />
                <span><strong>{alarm.title}</strong><small>{alarm.equipment_name}</small></span>
                <time>{formatTime(alarm.active_since)}</time>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
