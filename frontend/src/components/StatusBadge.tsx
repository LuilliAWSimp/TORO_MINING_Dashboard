import {
  AlertCircle,
  AlertTriangle,
  CircleOff,
  CirclePause,
  CirclePlay,
  Info,
  Radio,
  ShieldCheck,
} from 'lucide-react'
import type { AlarmEvent, DataQuality, EquipmentStatus, RagStatus } from '../types/contracts'

type BadgeType = EquipmentStatus | DataQuality | AlarmEvent['severity'] | RagStatus | 'connected' | 'demo'

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
  green: 'Verde',
  yellow: 'Amarillo',
  red: 'Rojo',
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
  green: ShieldCheck,
  yellow: AlertTriangle,
  red: AlertCircle,
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
