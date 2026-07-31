import { ChevronRight } from 'lucide-react'
import type { EquipmentState } from '../types/contracts'
import { formatTime } from '../utils/format'
import { StatusBadge } from './StatusBadge'

export function EquipmentTable({
  equipment,
  onSelect,
  compact = false,
}: {
  equipment: EquipmentState[]
  onSelect: (equipment: EquipmentState) => void
  compact?: boolean
}) {
  return (
    <div className="table-scroll">
      <table className={`data-table${compact ? ' compact' : ''}`}>
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Lectura principal</th>
            <th>Última lectura</th>
            <th aria-label="Detalle" />
          </tr>
        </thead>
        <tbody>
          {equipment.map((item) => {
            const measurement = item.measurements[0]
            return (
              <tr key={item.id} onClick={() => onSelect(item)} tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect(item)}>
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.id}</small>
                </td>
                <td>{item.equipment_type}</td>
                <td><StatusBadge type={item.status} /></td>
                <td>
                  {measurement?.value == null ? 'N/D' : `${measurement.value.toLocaleString('es-MX')} ${measurement.unit}`}
                  {measurement && <small>{measurement.name}</small>}
                </td>
                <td>{formatTime(item.last_update, true)}</td>
                <td><ChevronRight size={17} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
