import { Factory, Flag, Gauge, Scale } from 'lucide-react'
import { ChartPanel } from '../components/ChartPanel'
import { useDashboard } from '../components/DashboardContext'
import { KpiCard } from '../components/KpiCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import { formatNumber } from '../utils/format'

export function ProductionPage() {
  const { snapshot } = useDashboard()
  if (!snapshot) return null
  const k = snapshot.kpis
  const projected = k.production_today_t + k.production_current_tph * Math.max(0, 24 - new Date(snapshot.generated_at).getHours())

  return (
    <div className="page">
      <SectionHeader title="Producción" subtitle="Indicadores de tonelaje demo sin recuperación metalúrgica ni ley de mineral." actions={<StatusBadge type="demo" />} />
      <div className="kpi-grid four-columns">
        <KpiCard label="Ritmo actual" value={`${formatNumber(k.production_current_tph)} t/h`} icon={Factory} tone="gold" detail="Alimentación conceptual" />
        <KpiCard label="Acumulado" value={`${formatNumber(k.production_today_t)} t`} icon={Scale} tone="gold" detail="Desde 00:00" />
        <KpiCard label="Avance objetivo" value={`${formatNumber(k.objective_progress_pct)} %`} icon={Flag} tone="good" detail={`Objetivo del escenario: ${formatNumber(k.objective_tpd, 0)} t/d`} />
        <KpiCard label="Proyección simple" value={`${formatNumber(projected)} t`} icon={Gauge} tone="info" detail="No es pronóstico operativo" />
      </div>
      <section className="panel objective-panel">
        <div className="objective-copy">
          <span>Avance diario</span>
          <strong>{formatNumber(k.production_today_t)} / {formatNumber(k.objective_tpd, 0)} t</strong>
          <small>{snapshot.scenario.id === 'startup' ? 'Meta futura conceptual: 1,000 t/d al mes 36.' : 'Escenario objetivo conceptual del mes 36.'}</small>
        </div>
        <div className="objective-progress" aria-label={`${k.objective_progress_pct}%`}>
          <div style={{ width: `${Math.min(100, k.objective_progress_pct)}%` }} />
          <i style={{ left: `${Math.min(100, k.objective_tpd / 1000 * 100)}%` }}><span>{formatNumber(k.objective_tpd, 0)} t/d</span></i>
        </div>
      </section>
      <div className="chart-grid two-columns">
        <ChartPanel title="Producción instantánea" subtitle="Toneladas por hora">
          <TimeSeriesChart data={snapshot.trends} series={[{ key: 'production_tph', label: 'Producción', unit: 't/h', color: '#C9A227', type: 'area' }]} height={320} />
        </ChartPanel>
        <ChartPanel title="Acumulado del día" subtitle="Trayectoria demo">
          <TimeSeriesChart data={snapshot.trends} series={[{ key: 'production_cumulative_t', label: 'Acumulado', unit: 't', color: '#8A6D1F', type: 'area' }]} height={320} />
        </ChartPanel>
      </div>
      <section className="panel note-panel">
        <strong>Alcance de esta vista</strong>
        <p>No se presentan recuperación Au-Ag, ley de cabeza, ley de concentrado ni balance metalúrgico porque esas mediciones no están confirmadas.</p>
      </section>
    </div>
  )
}
