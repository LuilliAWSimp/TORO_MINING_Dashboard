import { Moon, RefreshCw, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Theme } from '../hooks/useTheme'
import type { DashboardSnapshot } from '../types/contracts'
import { formatDateTime, formatTime } from '../utils/format'
import { StatusBadge } from './StatusBadge'

export function Header({
  snapshot,
  theme,
  toggleTheme,
  refreshing,
  refresh,
}: {
  snapshot: DashboardSnapshot | null
  theme: Theme
  toggleTheme: () => void
  refreshing: boolean
  refresh: () => Promise<void>
}) {
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img src="toro-mining-logo.png" alt="TORO MINING" />
        <div className="mine-label">
          <strong>Mina San Bernardo</strong>
          <span>Supervisión operativa local</span>
        </div>
      </div>
      <div className="topbar-status">
        <div className="header-item shift-item">
          <span className="header-label">Turno demo</span>
          <strong>{snapshot?.shift ?? 'Cargando turno'}</strong>
        </div>
        <div className="header-item clock-item">
          <span className="header-label">Hora local</span>
          <strong>{formatTime(clock.toISOString(), true)}</strong>
          <small>{formatDateTime(clock.toISOString(), false, true)}</small>
        </div>
        <StatusBadge type={snapshot ? 'connected' : 'offline'} label={snapshot ? 'API local' : 'Sin API'} />
        <button className="icon-button" onClick={() => void refresh()} aria-label="Actualizar datos" title="Actualizar datos">
          <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
        </button>
        <button className="icon-button" onClick={toggleTheme} aria-label="Cambiar tema" title="Cambiar tema">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
