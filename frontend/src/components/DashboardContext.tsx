import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useDashboardData } from '../hooks/useDashboardData'
import type { EquipmentState } from '../types/contracts'

interface DashboardContextValue extends ReturnType<typeof useDashboardData> {
  selectedEquipment: EquipmentState | null
  selectEquipment: (equipment: EquipmentState | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const data = useDashboardData(12)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentState | null>(null)
  const value = useMemo(
    () => ({ ...data, selectedEquipment, selectEquipment: setSelectedEquipment }),
    [data, selectedEquipment],
  )
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const value = useContext(DashboardContext)
  if (!value) throw new Error('useDashboard debe utilizarse dentro de DashboardProvider')
  return value
}
