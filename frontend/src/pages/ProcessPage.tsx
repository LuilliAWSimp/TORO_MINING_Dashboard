import { useMemo, useState } from 'react'
import { EquipmentTable } from '../components/EquipmentTable'
import { useDashboard } from '../components/DashboardContext'
import { ProcessFlow } from '../components/ProcessFlow'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'

export function ProcessPage() {
  const { snapshot, catalog, selectEquipment } = useDashboard()
  const [areaId, setAreaId] = useState('all')
  const equipment = useMemo(() => {
    if (!snapshot) return []
    return areaId === 'all' ? snapshot.equipment : snapshot.equipment.filter((item) => item.area_id === areaId)
  }, [areaId, snapshot])
  if (!snapshot || !catalog) return null

  return (
    <div className="page">
      <SectionHeader
        title="Proceso"
        subtitle="Navegación por áreas y detalle de equipos representativos."
        actions={<StatusBadge type="demo" label="Inventario no confirmado" />}
      />
      <section className="panel process-panel">
        <div className="panel-heading"><div><h3>Flujo conceptual interactivo</h3><p>Arquitectura preparada para sustituir el proveedor de datos en el futuro.</p></div></div>
        <ProcessFlow catalog={catalog} equipment={snapshot.equipment} onSelect={selectEquipment} />
      </section>
      <section className="panel">
        <div className="panel-heading filter-heading">
          <div><h3>Equipos por área</h3><p>{equipment.length} elementos conceptuales</p></div>
          <div className="segmented-control area-filter">
            <button className={areaId === 'all' ? 'active' : ''} onClick={() => setAreaId('all')}>Todos</button>
            {catalog.areas.filter((area) => area.equipment_ids.length).map((area) => (
              <button key={area.id} className={areaId === area.id ? 'active' : ''} onClick={() => setAreaId(area.id)}>{area.name}</button>
            ))}
          </div>
        </div>
        <EquipmentTable equipment={equipment} onSelect={selectEquipment} />
      </section>
    </div>
  )
}
