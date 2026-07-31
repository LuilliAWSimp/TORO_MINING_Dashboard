import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  detail?: string
  tone?: 'default' | 'gold' | 'good' | 'warning' | 'critical' | 'info'
  trend?: 'up' | 'down' | 'flat'
}

export function KpiCard({ label, value, icon: Icon, detail, tone = 'default', trend }: KpiCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <div className="kpi-heading">
        <span>{label}</span>
        <Icon size={17} aria-hidden="true" />
      </div>
      <div className="kpi-value">{value}</div>
      {detail && (
        <div className="kpi-detail">
          {trend && <TrendIcon size={13} aria-hidden="true" />}
          <span>{detail}</span>
        </div>
      )}
    </article>
  )
}
