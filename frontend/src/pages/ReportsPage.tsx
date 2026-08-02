import { CalendarDays, Download, FileText, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDashboard } from '../components/DashboardContext'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { api } from '../services/api'

export function ReportsPage() {
  const { snapshot, scenario } = useDashboard()
  const [period, setPeriod] = useState<'current_shift' | 'day' | 'custom'>('current_shift')
  const [shift, setShift] = useState<'current' | '1' | '2' | '3'>('current')
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [start, setStart] = useState(`${today}T00:00`)
  const [end, setEnd] = useState(`${today}T23:59`)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  if (!snapshot) return null

  const downloadReport = async () => {
    const params = new URLSearchParams({ period, shift, scenario })
    if (period === 'custom') {
      params.set('start', new Date(start).toISOString())
      params.set('end', new Date(end).toISOString())
    }
    setDownloading(true)
    setDownloadError(null)
    try {
      const response = await fetch(api.reportUrl(params))
      if (!response.ok) throw new Error(await response.text())
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = response.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/)?.[1] ?? 'reporte_operativo.pdf'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (reason) {
      setDownloadError(reason instanceof Error ? reason.message : 'No fue posible generar el PDF.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="page reports-page">
      <SectionHeader title="Reportes" subtitle="Generación local del único reporte incluido en el MVP." actions={<StatusBadge type="demo" />} />
      <div className="report-layout">
        <section className="panel report-builder">
          <div className="panel-heading"><div><h3>Reporte Operativo</h3><p>PDF blanco del escenario activo: {snapshot.scenario.label}.</p></div><FileText size={22} /></div>
          <div className="form-grid">
            <label>
              <span>Periodo</span>
              <select value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}>
                <option value="current_shift">Turno actual</option>
                <option value="day">Día operativo</option>
                <option value="custom">Personalizado</option>
              </select>
            </label>
            <label>
              <span>Turno</span>
              <select value={shift} onChange={(event) => setShift(event.target.value as typeof shift)} disabled={period === 'day'}>
                <option value="current">Actual ({snapshot.shift})</option>
                <option value="1">Turno 1</option>
                <option value="2">Turno 2</option>
                <option value="3">Turno 3</option>
              </select>
            </label>
            {period === 'custom' && (
              <>
                <label><span>Desde</span><input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} /></label>
                <label><span>Hasta</span><input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
              </>
            )}
          </div>
          <button className="primary-button report-download" onClick={() => void downloadReport()} disabled={downloading || (period === 'custom' && (!start || !end || start >= end))}>
            <Download size={18} />
            {downloading ? 'Generando PDF…' : 'Generar y descargar PDF'}
          </button>
          {downloadError && <div className="form-error">{downloadError}</div>}
        </section>
        <section className="panel report-contents">
          <div className="panel-heading"><div><h3>Contenido incluido</h3><p>Sin exportaciones o botones adicionales.</p></div><ShieldCheck size={22} /></div>
          <ul className="check-list">
            <li><CalendarDays size={17} /><span>Periodo, turno y fecha de generación.</span></li>
            <li><FileText size={17} /><span>Logo TORO MINING, Mina San Bernardo e indicador DATOS DEMO.</span></li>
            <li><FileText size={17} /><span>KPIs operativos, siete KPIs estratégicos con RAG y gráficas de producción, energía y agua.</span></li>
            <li><FileText size={17} /><span>Resumen de equipos, alarmas, actualización y páginas numeradas.</span></li>
          </ul>
          <div className="report-note"><strong>Directorio escribible</strong><span>Windows: %LOCALAPPDATA%\ToroMining\reports</span></div>
        </section>
      </div>
    </div>
  )
}
