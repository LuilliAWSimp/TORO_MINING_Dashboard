import {
  BellRing,
  CircleCheck,
  Info,
  CirclePause,
  CirclePlay,
  Database,
  OctagonAlert,
  TriangleAlert,
  WifiOff,
} from 'lucide-react'
import { STATUS_LABELS, type BadgeType } from '../utils/statusPresentation'

const icons = {
  running: CirclePlay,
  stopped: CirclePause,
  warning: TriangleAlert,
  alarm: BellRing,
  critical: OctagonAlert,
  offline: WifiOff,
  good: CircleCheck,
  info: Info,
  connected: CircleCheck,
  demo: Database,
  green: CircleCheck,
  yellow: TriangleAlert,
  red: BellRing,
} satisfies Record<BadgeType, typeof Info>

export function StatusBadge({ type, label }: { type: BadgeType; label?: string }) {
  const Icon = icons[type]
  return (
    <span className={`status-badge status-${type}`} data-status={type}>
      <Icon size={13} aria-hidden="true" />
      <span>{label ?? STATUS_LABELS[type]}</span>
    </span>
  )
}
