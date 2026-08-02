import type { AlarmEvent, DataQuality, EquipmentStatus, KPISet, RagStatus } from '../types/contracts'

export type BadgeType = EquipmentStatus | DataQuality | AlarmEvent['severity'] | RagStatus | 'connected' | 'demo'

export const STATUS_LABELS: Record<BadgeType, string> = {
  running: 'Operando',
  stopped: 'Detenido',
  warning: 'Precaución',
  alarm: 'Alerta',
  critical: 'Crítico',
  offline: 'Sin comunicación',
  good: 'Estable',
  info: 'Información',
  connected: 'Conectado',
  demo: 'Datos demo',
  green: 'En objetivo',
  yellow: 'Precaución',
  red: 'Alerta',
}

function equipmentCountLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function getOperationalStatePresentation(kpis: KPISet): { type: BadgeType; cause: string } {
  if (kpis.equipment_offline > 0) {
    return {
      type: 'offline',
      cause: equipmentCountLabel(kpis.equipment_offline, 'equipo sin comunicación', 'equipos sin comunicación'),
    }
  }
  if (kpis.equipment_alarm > 0) {
    return {
      type: 'alarm',
      cause: equipmentCountLabel(kpis.equipment_alarm, 'equipo en alarma', 'equipos en alarma'),
    }
  }
  if (kpis.equipment_warning > 0) {
    return {
      type: 'warning',
      cause: equipmentCountLabel(kpis.equipment_warning, 'equipo en precaución', 'equipos en precaución'),
    }
  }
  return { type: 'good', cause: 'Operación estable' }
}
