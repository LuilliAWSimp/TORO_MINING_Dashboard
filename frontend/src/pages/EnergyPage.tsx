import { BatteryCharging, Gauge, Power, Zap } from 'lucide-react'
import { ChartPanel } from '../components/ChartPanel'
import { useDashboard } from '../components/DashboardContext'
import { KpiCard } from '../components/KpiCard'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TimeSeriesChart } from '../components/TimeSeriesChart'
import { formatNumber } from '../utils/format'

export function EnergyPage() {
  const { snapshot } = useDashboard()
  if (!snapshot) return null
  const k = snapshot.kpis
  const energyEquipment = snapshot.equipment.filter((item) => ['CR-104', 'ML-201', 'P-201A', 'P-201B', 'FP-402', 'P-602A', 'P-602B'].includes(item.id))

  return (
    <div className="page">
      <SectionHeader title="Energía" subtitle="Demanda y consumo específico calculados con datos demo coherentes." actions={<StatusBadge type="demo" />} />
      <div className="kpi-grid four-columns">
        <KpiCard label="Demanda actual" value={`${formatNumber(k.power_kw)} kW`} icon={Zap} tone="info" detail="Actualización cada 5 s" />
        <KpiCard label="Energía del día" value={`${formatNumber(k.energy_today_kwh)} kWh`} icon={BatteryCharging} tone="info" detail="Acumulado demo" />
        <KpiCard label="Consumo específico" value={`${formatNumber(k.specific_energy_kwh_t, 2)} kWh/t`} icon={Gauge} tone="gold" detail="Energía / producción" />
        <KpiCard label="Cargas principales" value={String(energyEquipment.filter((item) => item.status === 'running').length)} icon={Power} tone="good" detail={`${energyEquipment.length} equipos representativos`} />
      </div>
      <div className="chart-grid two-columns wide-left">
        <ChartPanel title="Demanda eléctrica" subtitle="Perfil demo de 12 horas">
          <TimeSeriesChart data={snapshot.trends} series={[{ key: 'power_kw', label: 'Potencia', unit: 'kW', color: '#4E8AA8', type: 'area' }]} height={310} />
        </ChartPanel>
        <ChartPanel title="Energía acumulada" subtitle="Acumulado del día">
          <TimeSeriesChart data={snapshot.trends} series={[{ key: 'energy_cumulative_kwh', label: 'Energía', unit: 'kWh', color: '#BE9D56', type: 'area' }]} height={310} />
        </ChartPanel>
      </div>
      <section className="panel">
        <div className="panel-heading"><div><h3>Cargas conceptuales</h3><p>Estado compacto de los equipos con mayor impacto esperado.</p></div></div>
        <div className="equipment-card-grid">
          {energyEquipment.map((item) => (
            <article key={item.id} className="equipment-summary-card">
              <div><strong>{item.name}</strong><span>{item.equipment_type}</span></div>
              <StatusBadge type={item.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
