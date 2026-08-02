import {
  BellRing,
  BatteryCharging,
  Boxes,
  Droplets,
  Factory,
  Gauge,
  LayoutDashboard,
  Power,
  Scale,
  Zap,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ChartPanel } from '../components/ChartPanel'
import { useDashboard } from '../components/DashboardContext'
import { KpiCard } from '../components/KpiCard'
import { ProcessFlow } from '../components/ProcessFlow'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { StrategicComplianceGrid } from '../components/StrategicComplianceGrid'
import { SummaryCustomizer } from '../components/SummaryCustomizer'
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import { useSummaryLayout } from '../hooks/useSummaryLayout'
import type { KpiDefinition } from '../types/contracts'
import type { SummarySectionId } from '../utils/summaryLayout'
import { formatNumber, formatTime } from '../utils/format'
import { getOperationalStatePresentation } from '../utils/statusPresentation'

export function SummaryPage() {
  const { snapshot, catalog, selectEquipment } = useDashboard()
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const {
    layout,
    orderedSections,
    hiddenCount,
    toggleSection,
    moveSection,
    restoreDefault,
  } = useSummaryLayout()

  if (!snapshot || !catalog) return null
  const k = snapshot.kpis
  const equipmentTotal = snapshot.equipment.length
  const executiveKpis = new Map(snapshot.executive.kpis.map((item) => [item.id, item]))
  const strategicKpis = snapshot.executive.strategic_kpi_ids
    .map((id) => executiveKpis.get(id))
    .filter((item): item is KpiDefinition => Boolean(item))
  const operationalState = getOperationalStatePresentation(k)

  const sections: Record<SummarySectionId, ReactNode> = {
    kpis: (
      <section className="summary-section" aria-label="Indicadores principales">
        <div className="kpi-grid summary-kpis">
          <KpiCard label="Producción actual" value={`${formatNumber(k.production_current_tph)} t/h`} icon={Factory} detail="Ritmo demo del proceso" tone="gold" trend="up" />
          <KpiCard label="Acumulado del día" value={`${formatNumber(k.production_today_t)} t`} icon={Scale} detail={`${formatNumber(k.objective_progress_pct)} % de ${formatNumber(k.objective_tpd, 0)} t/d`} tone="gold" />
          <KpiCard label="Demanda eléctrica" value={`${formatNumber(k.power_kw)} kW`} icon={Zap} detail="Demanda instantánea demo" tone="info" />
          <KpiCard label="Energía acumulada" value={`${formatNumber(k.energy_today_kwh)} kWh`} icon={BatteryCharging} detail={`${formatNumber(k.specific_energy_kwh_t, 2)} kWh/t`} tone="info" />
          <KpiCard label="Agua recirculada" value={`${formatNumber(k.water_recirculation_pct)} %`} icon={Droplets} detail="Balance conceptual" tone="good" />
          <KpiCard label="Equipos operando" value={`${k.equipment_running} / ${equipmentTotal}`} icon={Power} detail={`${k.equipment_stopped} detenidos · ${k.equipment_offline} sin comunicación`} tone="good" />
          <KpiCard label="Condiciones anormales" value={`${k.equipment_warning + k.equipment_alarm}`} icon={Gauge} detail={`${k.equipment_warning} en precaución · ${k.equipment_alarm} en alerta`} tone="warning" />
          <KpiCard label="Alarmas activas" value={String(k.active_alarms)} icon={BellRing} detail="Incluye pérdida de comunicación" tone="critical" />
        </div>
        <div className="summary-strategic-compliance">
          <div className="summary-strategic-heading">
            <div>
              <h3>Cumplimiento estratégico</h3>
              <p>La meta equivale a 100 %. El valor y la unidad permanecen visibles; las tendencias históricas continúan más abajo.</p>
            </div>
            <StatusBadge type="demo" label="KPIs del escenario" />
          </div>
          <StrategicComplianceGrid kpis={strategicKpis} />
        </div>
      </section>
    ),
    process: (
      <section className="panel process-panel summary-section">
        <div className="panel-heading">
          <div>
            <h3>Flujo simplificado de planta</h3>
            <p>Selecciona cualquier equipo para consultar sus lecturas y tendencia demo.</p>
          </div>
          <StatusBadge type="demo" label="P&ID conceptual" />
        </div>
        <ProcessFlow catalog={catalog} equipment={snapshot.equipment} onSelect={selectEquipment} />
      </section>
    ),
    trends: (
      <section className="chart-grid three-columns summary-section" aria-label="Tendencias operativas">
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
      </section>
    ),
    status_alarms: (
      <section className="summary-bottom-grid summary-section" aria-label="Estado de equipos y alarmas relevantes">
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
          <div className="panel-heading"><div><h3>Alarmas relevantes</h3><p>Eventos activos de la simulación</p></div><BellRing size={19} /></div>
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
      </section>
    ),
  }

  return (
    <div className="page page-summary">
      <SectionHeader
        title="Resumen operativo"
        subtitle="Vista integrada del proceso conceptual, producción, energía y agua."
        actions={
          <div className="summary-header-actions">
            <button
              type="button"
              className="summary-customize-button"
              onClick={() => setCustomizerOpen(true)}
              aria-haspopup="dialog"
            >
              <LayoutDashboard size={15} />
              <span>Personalizar resumen</span>
              {hiddenCount > 0 && <strong>{hiddenCount} {hiddenCount === 1 ? 'oculta' : 'ocultas'}</strong>}
            </button>
            <div className="reading-status">
              <div className="operational-state-indicator">
                <StatusBadge type={operationalState.type} label="Estado operativo" />
                <span>{operationalState.cause}</span>
              </div>
              <span>Última lectura <strong>{formatTime(snapshot.last_reading_at, true)}</strong></span>
            </div>
          </div>
        }
      />

      {orderedSections.map((section) => (
        layout.hidden.includes(section.id) ? null : <div key={section.id} data-summary-section={section.id}>{sections[section.id]}</div>
      ))}

      <SummaryCustomizer
        open={customizerOpen}
        sections={orderedSections}
        layout={layout}
        hiddenCount={hiddenCount}
        onClose={() => setCustomizerOpen(false)}
        onToggle={toggleSection}
        onMove={moveSection}
        onRestore={restoreDefault}
      />
    </div>
  )
}
