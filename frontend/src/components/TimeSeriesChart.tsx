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
import { compactTime } from '../utils/format'
import { SharedChartTooltip, type ChartSeriesDefinition } from './SharedChartTooltip'

interface TimeSeriesChartProps {
  data: object[]
  series: ChartSeriesDefinition[]
  height?: number
  domain?: [number | 'auto', number | 'auto']
  showLegend?: boolean
  xKey?: string
  xFormatter?: (value: string) => string
}

export function TimeSeriesChart({
  data,
  series,
  height = 220,
  domain = ['auto', 'auto'],
  showLegend = true,
  xKey = 'timestamp',
  xFormatter = compactTime,
}: TimeSeriesChartProps) {
  const hasArea = series.some((item) => item.type === 'area')
  const Chart = hasArea ? AreaChart : LineChart
  const hasNumericData = data.some((row) => series.some((item) => Number.isFinite(Number((row as Record<string, unknown>)[item.key]))))

  if (!hasNumericData) {
    return <div className="chart-empty" style={{ height }}>Sin datos numéricos para la tendencia seleccionada.</div>
  }

  return (
    <div className="chart-wrap" style={{ height }} data-chart-interactive="true">
      {showLegend && (
        <div className="chart-legend" aria-hidden="true">
          {series.map((item) => (
            <span key={item.key}>
              <i style={{ backgroundColor: item.color }} />
              {item.label}{item.unit ? ` (${item.unit})` : ''}
            </span>
          ))}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={data} margin={{ top: showLegend ? 26 : 8, right: 12, left: -12, bottom: 0 }} accessibilityLayer>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickFormatter={xFormatter}
            tick={{ fill: 'var(--chart-axis-text)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={34}
          />
          <YAxis
            domain={domain}
            tick={{ fill: 'var(--chart-axis-text)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            content={<SharedChartTooltip labelFormatter={xFormatter} series={series} />}
            cursor={{ stroke: 'var(--chart-cursor)', strokeWidth: 1.25, strokeDasharray: '4 4' }}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 40, pointerEvents: 'none' }}
            isAnimationActive={false}
          />
          {series.map((item) => item.type === 'area' ? (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.14}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5, stroke: item.color, strokeWidth: 2, fill: 'var(--surface)' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ) : (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5, stroke: item.color, strokeWidth: 2, fill: 'var(--surface)' }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  )
}
