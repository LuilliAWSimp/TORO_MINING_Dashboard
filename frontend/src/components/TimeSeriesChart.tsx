import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { compactTime, formatNumber } from '../utils/format'

interface Series {
  key: string
  label: string
  unit: string
  color: string
  type?: 'line' | 'area'
}

interface TimeSeriesChartProps {
  data: object[]
  series: Series[]
  height?: number
  domain?: [number | 'auto', number | 'auto']
  showLegend?: boolean
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <strong>{typeof label === 'string' ? compactTime(label) : label}</strong>
      {payload.map((item: any) => (
        <div key={item.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ backgroundColor: item.color }} />
          <span>{item.name}</span>
          <strong>{formatNumber(Number(item.value), item.dataKey.includes('pct') ? 1 : 1)} {item.payload?.[`${item.dataKey}_unit`] ?? ''}</strong>
        </div>
      ))}
    </div>
  )
}

export function TimeSeriesChart({ data, series, height = 220, domain = ['auto', 'auto'], showLegend = true }: TimeSeriesChartProps) {
  const hasArea = series.some((item) => item.type === 'area')
  const Chart = hasArea ? AreaChart : LineChart
  return (
    <div className="chart-wrap" style={{ height }}>
      {showLegend && (
        <div className="chart-legend">
          {series.map((item) => (
            <span key={item.key}>
              <i style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: showLegend ? 26 : 8, right: 10, left: -14, bottom: 0 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={compactTime}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={34}
          />
          <YAxis
            domain={domain}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '4 4' }} />
          {series.map((item) => item.type === 'area' ? (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={`${item.label} (${item.unit})`}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.14}
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={`${item.label} (${item.unit})`}
              stroke={item.color}
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
