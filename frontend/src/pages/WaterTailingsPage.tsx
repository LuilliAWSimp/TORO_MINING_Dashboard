import { Droplets, Gauge, Radio, Waves } from 'lucide-react'
import { ChartPanel } from '../components/ChartPanel'
import { useDashboard } from '../components/DashboardContext'
import { EquipmentTable } from '../components/EquipmentTable'
import { KpiCard } from '../components/KpiCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import { formatNumber } from '../utils/format'

export function WaterTailingsPage() {
  const { snapshot, selectEquipment } = useDashboard()
  if (!snapshot) return null
  const waterEquipment = snapshot.equipment.filter((item) => item.area_id === 'water_tailings')
  const tank = waterEquipment.find((item) => item.id === 'WT-601')
  const tankLevel = tank?.measurements.find((item) => item.metric === 'level')?.value ?? 0
  const conductivity = tank?.measurements.find((item) => item.metric === 'conductivity')?.value ?? 0
  const returnFlow = waterEquipment.find((item) => item.id === 'P-602A')?.measurements.find((item) => item.metric === 'flow')?.value ?? 0

  return (
    <div className="page">
      <SectionHeader title="Agua y jales" subtitle="Circuito conceptual de agua recuperada; no incluye balances confirmados de jales." actions={<StatusBadge type="demo" />} />
      <div className="kpi-grid four-columns">
        <KpiCard label="Agua recirculada" value={`${formatNumber(snapshot.kpis.water_recirculation_pct)} %`} icon={Droplets} tone="good" detail="Porcentaje demo" />
        <KpiCard label="Nivel WT-601" value={`${formatNumber(tankLevel)} %`} icon={Waves} tone="info" detail="Tanque conceptual" />
        <KpiCard label="Flujo de retorno" value={`${formatNumber(returnFlow)} m³/h`} icon={Gauge} tone="info" detail="Bomba P-602A" />
        <KpiCard label="Conductividad" value={`${formatNumber(conductivity, 0)} µS/cm`} icon={Radio} tone="gold" detail="Lectura demo del tanque" />
      </div>
      <div className="chart-grid two-columns wide-left">
        <ChartPanel title="Recirculación de agua" subtitle="Porcentaje conceptual">
          <TimeSeriesChart data={snapshot.trends} series={[{ key: 'water_recirculation_pct', label: 'Recirculación', unit: '%', color: '#4EA47A', type: 'area' }]} height={310} domain={[70, 90]} />
        </ChartPanel>
        <ChartPanel title="Agua fresca" subtitle="Flujo de reposición demo">
          <TimeSeriesChart data={snapshot.trends} series={[{ key: 'fresh_water_m3h', label: 'Agua fresca', unit: 'm³/h', color: '#4E8AA8', type: 'area' }]} height={310} />
        </ChartPanel>
      </div>
      <section className="panel">
        <div className="panel-heading"><div><h3>Equipos del circuito</h3><p>Detalle compacto y acceso a tendencias.</p></div></div>
        <EquipmentTable equipment={waterEquipment} onSelect={selectEquipment} compact />
      </section>
    </div>
  )
}
