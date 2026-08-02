import { ArrowDownRight, ArrowUpRight, Flag, Info, Minus, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ChartPanel } from '../components/ChartPanel'
import { useDashboard } from '../components/DashboardContext'
import { ExecutiveKpiCard } from '../components/ExecutiveKpiCard'
import { KpiDetailPanel } from '../components/KpiDetailPanel'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import type { KpiDefinition } from '../types/contracts'
import { formatDateTime, formatKpiValue, formatNumber, formatShortDate } from '../utils/format'

const trendIcons = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }

export function ExecutivePage() {
  const { snapshot } = useDashboard()
  const [selectedKpi, setSelectedKpi] = useState<KpiDefinition | null>(null)

  const data = useMemo(() => snapshot?.executive.trends.map((item) => ({ ...item })) ?? [], [snapshot])
  if (!snapshot) return null

  const executive = snapshot.executive
  const byId = new Map(executive.kpis.map((item) => [item.id, item]))
  const strategic = executive.strategic_kpi_ids.map((id) => byId.get(id)).filter((item): item is KpiDefinition => Boolean(item))
  const control = executive.control

  return (
    <div className="page executive-page">
      <SectionHeader
        title="Ejecutivo"
        subtitle="Vista gerencial de escenarios demo; las fuentes mostradas son metadatos y no conexiones activas."
        actions={<StatusBadge type="demo" label={snapshot.scenario.label} />}
      />

      <section className="panel executive-rag-panel">
        <div className="panel-heading">
          <div><h3>Estado general RAG</h3><p>Calculado desde valores, metas y umbrales; no replica estados escritos manualmente.</p></div>
          <ShieldCheck size={21} />
        </div>
        <div className="general-rag-grid">
          {executive.general_rag.map((item) => (
            <div key={item.id} className={`general-rag-item rag-surface-${item.status}`}>
              <span>{item.label}</span>
              <StatusBadge type={item.status} />
            </div>
          ))}
        </div>
      </section>

      <section className="executive-strategic-section">
        <div className="panel-heading standalone-heading">
          <div><h3>KPIs estratégicos</h3><p>Selecciona un indicador para consultar fuente, meta, umbrales, frecuencia y definición.</p></div>
        </div>
        <div className="executive-kpi-grid">
          {strategic.map((kpi) => <ExecutiveKpiCard key={kpi.id} kpi={kpi} onSelect={setSelectedKpi} />)}
        </div>
      </section>

      <div className="executive-overview-grid">
        <section className="panel executive-area-panel">
          <div className="panel-heading"><div><h3>Desempeño por área</h3><p>Indicador principal del escenario activo.</p></div></div>
          <div className="executive-area-table">
            {executive.area_performance.map((row) => {
              const kpi = byId.get(row.kpi_id)
              if (!kpi) return null
              const TrendIcon = trendIcons[row.trend]
              return (
                <button type="button" key={`${row.area}-${row.kpi_id}`} onClick={() => setSelectedKpi(kpi)}>
                  <span className="area-name">{row.area}</span>
                  <span className="area-kpi"><strong>{kpi.name}</strong><small>{row.observation ?? 'Dato demo del escenario'}</small></span>
                  <span className="area-value">{formatKpiValue(kpi.value, kpi.unit)}</span>
                  <span className="area-target">Meta {formatKpiValue(kpi.target, kpi.unit)}</span>
                  <StatusBadge type={kpi.status} />
                  <TrendIcon size={16} aria-label={row.trend} />
                </button>
              )
            })}
          </div>
        </section>

        <section className="panel executive-control-panel">
          <div className="panel-heading"><div><h3>Control semanal</h3><p>Desempeño operativo demo.</p></div></div>
          <div className="control-metric-grid">
            <div><span>Plan completado</span><strong>{formatNumber(control.plan_completed_pct, 0)} %</strong></div>
            <div><span>Real completado</span><strong>{formatNumber(control.actual_completed_pct, 0)} %</strong></div>
            <div><span>SPI operativo</span><strong>{formatNumber(control.spi, 2)}</strong></div>
            <div><span>CPI operativo</span><strong>{formatNumber(control.cpi, 2)}</strong></div>
            <div><span>Issues abiertos</span><strong>{control.issues_open}</strong></div>
            <div><span>Contingencia</span><strong>{formatNumber(control.contingency_consumed_pct, 0)} %</strong></div>
            <div><span>OPEX plan</span><strong>{formatNumber(control.budget_opex_month_usd_m, 2)} M USD</strong></div>
            <div><span>OPEX real</span><strong>{formatNumber(control.actual_opex_month_usd_m, 2)} M USD</strong></div>
          </div>
        </section>
      </div>

      <section className="executive-trends-section">
        <div className="panel-heading standalone-heading"><div><h3>Tendencias · 12 semanas</h3><p>Escalas separadas para evitar comparaciones engañosas.</p></div></div>
        <div className="executive-small-multiples">
          <ChartPanel title="Producción diaria" subtitle="t/día">
            <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'production_tpd', label: 'Producción', unit: 't/d', color: '#C9A227', type: 'area' }]} height={210} />
          </ChartPanel>
          <ChartPanel title="Disponibilidad" subtitle="% de planta">
            <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'availability_pct', label: 'Disponibilidad', unit: '%', color: '#4E8AA8', type: 'line' }]} height={210} />
          </ChartPanel>
          <ChartPanel title="Recuperación Au" subtitle="Valor exclusivamente demo">
            <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'recovery_au_pct', label: 'Recuperación', unit: '%', color: '#4EA47A', type: 'line' }]} height={210} />
          </ChartPanel>
          <ChartPanel title="Agua fresca" subtitle="m³/t">
            <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'fresh_water_m3_t', label: 'Agua fresca', unit: 'm³/t', color: '#4E8AA8', type: 'area' }]} height={210} />
          </ChartPanel>
          <ChartPanel title="Energía específica" subtitle="kWh/t">
            <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'energy_kwh_t', label: 'Energía', unit: 'kWh/t', color: '#C9A227', type: 'area' }]} height={210} />
          </ChartPanel>
          <ChartPanel title="MTBF" subtitle="Horas entre fallas">
            <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'mtbf_h', label: 'MTBF', unit: 'h', color: '#7F8C8D', type: 'line' }]} height={210} />
          </ChartPanel>
        </div>
      </section>

      <div className="executive-control-charts">
        <ChartPanel title="Plan acumulado vs real" subtitle="Toneladas acumuladas">
          <TimeSeriesChart
            data={data}
            xKey="week"
            xFormatter={formatShortDate}
            series={[
              { key: 'plan_cumulative_t', label: 'Plan', unit: 't', color: '#4E8AA8', type: 'line' },
              { key: 'actual_cumulative_t', label: 'Real', unit: 't', color: '#C9A227', type: 'line' },
            ]}
            height={260}
          />
        </ChartPanel>
        <ChartPanel title="SPI / CPI operativo" subtitle="Índices separados del volumen">
          <TimeSeriesChart
            data={data}
            xKey="week"
            xFormatter={formatShortDate}
            domain={[0.8, 1.08]}
            series={[
              { key: 'spi', label: 'SPI', unit: '', color: '#4E8AA8', type: 'line' },
              { key: 'cpi', label: 'CPI', unit: '', color: '#C9A227', type: 'line' },
            ]}
            height={260}
          />
        </ChartPanel>
        <ChartPanel title="Burn-down de issues" subtitle="Issues abiertos">
          <TimeSeriesChart data={data} xKey="week" xFormatter={formatShortDate} series={[{ key: 'open_issues', label: 'Issues', unit: '#', color: '#B7791F', type: 'area' }]} height={260} />
        </ChartPanel>
      </div>

      <section className="panel executive-kpi-catalog-panel">
        <div className="panel-heading">
          <div><h3>Catálogo KPI · {executive.kpis.length}</h3><p>{executive.source_notice}</p></div>
          <Info size={20} />
        </div>
        <div className="kpi-catalog-scroll">
          <table className="kpi-catalog-table">
            <thead><tr><th>ID</th><th>Dominio</th><th>Indicador</th><th>Valor</th><th>Meta</th><th>RAG</th><th>Fuente demo</th><th>Frecuencia</th></tr></thead>
            <tbody>
              {executive.kpis.map((kpi) => (
                <tr key={kpi.id} onClick={() => setSelectedKpi(kpi)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && setSelectedKpi(kpi)}>
                  <td>{kpi.id}</td><td>{kpi.domain}</td><td><strong>{kpi.name}</strong></td>
                  <td>{formatKpiValue(kpi.value, kpi.unit)}</td><td>{formatKpiValue(kpi.target, kpi.unit)}</td>
                  <td><StatusBadge type={kpi.status} /></td><td>{kpi.source}</td><td>{kpi.frequency ?? 'Pendiente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="executive-lists-grid">
        <section className="panel">
          <div className="panel-heading"><div><h3>Riesgos principales</h3><p>RAG calculado con probabilidad e impacto demo.</p></div><Flag size={20} /></div>
          <div className="executive-risk-list">
            {executive.risks.map((risk) => (
              <div key={risk.id}>
                <StatusBadge type={risk.status} />
                <span><strong>{risk.title}</strong><small>{risk.probability} · {risk.impact} · {risk.action}</small></span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading"><div><h3>Próximos hitos</h3><p>Fechas legibles del escenario demo.</p></div></div>
          <div className="executive-milestone-list">
            {executive.milestones.map((milestone) => (
              <div key={milestone.id}>
                <time>{formatDateTime(milestone.date, false, true)}</time>
                <span><strong>{milestone.title}</strong><small>{milestone.state} · {milestone.criterion}</small></span>
                <StatusBadge type={milestone.status} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel executive-achievements">
        <div className="panel-heading"><div><h3>Logros del mes</h3><p>Resultados de simulación; no representan desempeño real.</p></div></div>
        <div>{executive.achievements.map((item) => <span key={item}><ShieldCheck size={16} />{item}</span>)}</div>
      </section>

      <KpiDetailPanel kpi={selectedKpi} onClose={() => setSelectedKpi(null)} />
    </div>
  )
}
