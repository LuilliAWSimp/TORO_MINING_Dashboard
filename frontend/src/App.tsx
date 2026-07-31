import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DashboardProvider } from './components/DashboardContext'
import { AlarmsPage } from './pages/AlarmsPage'
import { EnergyPage } from './pages/EnergyPage'
import { ProcessPage } from './pages/ProcessPage'
import { ProductionPage } from './pages/ProductionPage'
import { ReportsPage } from './pages/ReportsPage'
import { SummaryPage } from './pages/SummaryPage'
import { WaterTailingsPage } from './pages/WaterTailingsPage'

export default function App() {
  return (
    <DashboardProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SummaryPage />} />
          <Route path="proceso" element={<ProcessPage />} />
          <Route path="energia" element={<EnergyPage />} />
          <Route path="produccion" element={<ProductionPage />} />
          <Route path="agua-jales" element={<WaterTailingsPage />} />
          <Route path="alarmas" element={<AlarmsPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DashboardProvider>
  )
}
