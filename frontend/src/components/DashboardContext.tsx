import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useDashboardData } from '../hooks/useDashboardData'
import type { DemoScenario, EquipmentState } from '../types/contracts'

const SCENARIO_KEY = 'toro-mining-demo-scenario'

function initialScenario(): DemoScenario {
  const stored = window.localStorage.getItem(SCENARIO_KEY)
  return stored === 'target' ? 'target' : 'startup'
}

interface DashboardContextValue extends ReturnType<typeof useDashboardData> {
  scenario: DemoScenario
  setScenario: (scenario: DemoScenario) => void
  selectedEquipment: EquipmentState | null
  selectEquipment: (equipment: EquipmentState | null) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenarioState] = useState<DemoScenario>(initialScenario)
  const data = useDashboardData(scenario, 12)
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentState | null>(null)

  const setScenario = useCallback((nextScenario: DemoScenario) => {
    window.localStorage.setItem(SCENARIO_KEY, nextScenario)
    setSelectedEquipment(null)
    setScenarioState(nextScenario)
  }, [])

  const value = useMemo(
    () => ({ ...data, scenario, setScenario, selectedEquipment, selectEquipment: setSelectedEquipment }),
    [data, scenario, setScenario, selectedEquipment],
  )
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const value = useContext(DashboardContext)
  if (!value) throw new Error('useDashboard debe utilizarse dentro de DashboardProvider')
  return value
}
