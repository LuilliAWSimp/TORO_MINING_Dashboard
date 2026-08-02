import { formatNumber } from '../utils/format'

export interface ChartSeriesDefinition {
  key: string
  label: string
  unit: string
  color: string
  type?: 'line' | 'area'
}

interface TooltipPayloadItem {
  dataKey?: string | number
  name?: string
  value?: unknown
  color?: string
  stroke?: string
  payload?: Record<string, unknown>
}

export function SharedChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  series,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  labelFormatter: (value: string) => string
  series: ChartSeriesDefinition[]
}) {
  if (!active || !payload?.length) return null

  const byKey = new Map(series.map((item) => [item.key, item]))
  const rows = payload.flatMap((item) => {
    const key = String(item.dataKey ?? '')
    const definition = byKey.get(key)
    const numericValue = Number(item.value)
    if (!definition || !Number.isFinite(numericValue)) return []
    return [{
      key,
      label: definition.label,
      unit: definition.unit,
      color: item.color ?? item.stroke ?? definition.color,
      value: numericValue,
    }]
  })

  if (!rows.length) return null

  return (
    <div className="chart-tooltip" role="status" aria-live="polite">
      <strong>{labelFormatter(String(label ?? ''))}</strong>
      {rows.map((item) => (
        <div key={item.key} className="tooltip-row">
          <span className="tooltip-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
          <span>{item.label}</span>
          <strong>{formatNumber(item.value, 1)}{item.unit ? ` ${item.unit}` : ''}</strong>
        </div>
      ))}
    </div>
  )
}
