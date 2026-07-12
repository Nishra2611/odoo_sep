import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { DataProvider } from '@/context/DataContext'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FleetListPage } from '@/pages/fleet/FleetListPage'
import { DriversListPage } from '@/pages/drivers/DriversListPage'
import { TripsKanbanPage } from '@/pages/trips/TripsKanbanPage'
import { MaintenancePage } from '@/pages/maintenance/MaintenancePage'
import { SafetyPage } from '@/pages/safety/SafetyPage'
import { FuelExpensesPage } from '@/pages/finance/FuelExpensesPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/fleet" element={<FleetListPage />} />
                  <Route path="/drivers" element={<DriversListPage />} />
                  <Route path="/trips" element={<TripsKanbanPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/safety" element={<SafetyPage />} />
                  <Route path="/finance" element={<FuelExpensesPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
