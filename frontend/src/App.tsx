/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:35:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { AppSettingsProvider } from './auth/AppSettingsContext'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { APP_SHELL_ROUTES, renderAppRoutes } from './appRoutes'
import { AppShell } from './layout/AppShell'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>{renderAppRoutes(APP_SHELL_ROUTES)}</Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </AppSettingsProvider>
  )
}
