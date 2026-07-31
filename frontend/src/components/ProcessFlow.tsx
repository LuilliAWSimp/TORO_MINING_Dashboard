import {
  Box,
  CircleDot,
  Droplets,
  Factory,
  Filter,
  Gauge,
  PackageCheck,
  Waves,
} from 'lucide-react'
import type { CatalogResponse, EquipmentState } from '../types/contracts'
import { StatusBadge } from './StatusBadge'

const areaIcons = {
  reception: Box,
  milling: CircleDot,
  beneficiation: Gauge,
  thickening: Filter,
  final_product: PackageCheck,
  water_tailings: Droplets,
  digital_services: Factory,
} as const

const mainAreaIds = ['reception', 'milling', 'beneficiation', 'thickening', 'final_product']

export function ProcessFlow({
  catalog,
  equipment,
  onSelect,
}: {
  catalog: CatalogResponse
  equipment: EquipmentState[]
  onSelect: (equipment: EquipmentState) => void
}) {
  const byId = new Map(equipment.map((item) => [item.id, item]))
  const mainAreas = catalog.areas.filter((area) => mainAreaIds.includes(area.id))
  const waterArea = catalog.areas.find((area) => area.id === 'water_tailings')

  return (
    <div className="process-flow" aria-label="Flujo conceptual de planta">
      <div className="flow-main">
        {mainAreas.map((area, index) => {
          const Icon = areaIcons[area.id as keyof typeof areaIcons] ?? Factory
          return (
            <div className="flow-step-wrap" key={area.id}>
              <section className="flow-step">
                <div className="flow-step-title">
                  <Icon size={18} aria-hidden="true" />
                  <span>{area.name}</span>
                </div>
                <div className="flow-equipment-list">
                  {area.equipment_ids.length ? area.equipment_ids.map((equipmentId) => {
                    const item = byId.get(equipmentId)
                    if (!item) return null
                    return (
                      <button key={item.id} className={`equipment-chip equipment-${item.status}`} onClick={() => onSelect(item)}>
                        <span>
                          <strong>{item.id}</strong>
                          <small>{item.equipment_type}</small>
                        </span>
                        <StatusBadge type={item.status} label="" />
                      </button>
                    )
                  }) : (
                    <div className="flow-placeholder">Sin inventario confirmado</div>
                  )}
                </div>
              </section>
              {index < mainAreas.length - 1 && <div className="flow-arrow" aria-hidden="true">→</div>}
            </div>
          )
        })}
      </div>
      {waterArea && (
        <div className="flow-water-loop">
          <div className="loop-label"><Waves size={17} /> Circuito conceptual de agua recuperada</div>
          <div className="loop-line" />
          <div className="loop-equipment">
            {waterArea.equipment_ids.map((equipmentId) => {
              const item = byId.get(equipmentId)
              if (!item) return null
              return (
                <button key={item.id} className={`equipment-chip equipment-${item.status}`} onClick={() => onSelect(item)}>
                  <span><strong>{item.id}</strong><small>{item.equipment_type}</small></span>
                  <StatusBadge type={item.status} label="" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
