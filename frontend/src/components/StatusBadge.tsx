import {
  AlertCircle,
  AlertTriangle,
  CircleOff,
  CirclePause,
  CirclePlay,
  Info,
  Radio,
} from 'lucide-react'
import type { AlarmEvent, DataQuality, EquipmentStatus } from '../types/contracts'

type BadgeType = EquipmentStatus | DataQuality | AlarmEvent['severity'] | 'connected' | 'demo'

const labels: Record<BadgeType, string> = {
  running: 'Operando',
  stopped: 'Detenido',
  warning: 'Advertencia',
  alarm: 'Alarma',
  critical: 'Crítico',
  offline: 'Sin comunicación',
  good: 'Normal',
  info: 'Información',
  connected: 'Conectado',
  demo: 'Datos demo',
}

const icons = {
  running: CirclePlay,
  stopped: CirclePause,
  warning: AlertTriangle,
  alarm: AlertCircle,
  critical: AlertCircle,
  offline: CircleOff,
  good: Radio,
  info: Info,
  connected: Radio,
  demo: Info,
} satisfies Record<BadgeType, typeof Info>

export function StatusBadge({ type, label }: { type: BadgeType; label?: string }) {
  const Icon = icons[type]
  return (
    <span className={`status-badge status-${type}`}>
      <Icon size={13} aria-hidden="true" />
      <span>{label ?? labels[type]}</span>
    </span>
  )
}
