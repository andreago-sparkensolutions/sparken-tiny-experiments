import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ExperimentsProvider from './context/ExperimentsProvider'
import AppShell from './layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import ExperimentDetailPage from './pages/ExperimentDetailPage'
import ExperimentsListPage from './pages/ExperimentsListPage'
import TargetsDetailPage from './pages/TargetsDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <ExperimentsProvider>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="targets" element={<TargetsDetailPage />} />
            <Route path="experiments" element={<ExperimentsListPage />} />
            <Route path="experiment/:id" element={<ExperimentDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ExperimentsProvider>
    </BrowserRouter>
  )
}
