import { Outlet } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useDashboard } from './DashboardContext'
import { DemoStrip } from './DemoStrip'
import { EquipmentDetailDrawer } from './EquipmentDetailDrawer'
import { Header } from './Header'
import { LoadingState } from './LoadingState'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { theme, toggleTheme } = useTheme()
  const { snapshot, loading, error, refreshing, refresh, scenario, setScenario, scenarioChanging, selectedEquipment, selectEquipment } = useDashboard()

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-column">
        <Header
          snapshot={snapshot}
          theme={theme}
          toggleTheme={toggleTheme}
          refreshing={refreshing}
          refresh={refresh}
        />
        <DemoStrip snapshot={snapshot} scenario={scenario} setScenario={setScenario} changing={scenarioChanging} />
        <main className="app-content">
          {loading && !snapshot ? <LoadingState error={error} /> : <Outlet />}
        </main>
      </div>
      <EquipmentDetailDrawer equipment={selectedEquipment} scenario={scenario} onClose={() => selectEquipment(null)} />
    </div>
  )
}
