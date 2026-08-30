/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:35:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { AppSettingsProvider } from './auth/AppSettingsContext'
import { AuthProvider } from './auth/AuthContext'
import { ColorSchemeProvider } from './auth/ColorSchemeContext'
import { MaintenancePublicGate } from './auth/MaintenancePublicGate'
import { MaintenanceRoute } from './auth/MaintenanceRoute'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ToastProvider } from './components/ToastProvider'
import { ConfirmDialogProvider } from './components/ConfirmDialogProvider'
import { APP_SHELL_ROUTES, renderAppRoutes } from './appRoutes'
import { AppShell } from './layout/AppShell'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

export default function App() {
  return (
    <AppSettingsProvider>
      <ColorSchemeProvider>
        <AuthProvider>
          <ConfirmDialogProvider>
            <ToastProvider>
            <Routes>
              <Route path="/maintenance" element={<MaintenanceRoute />} />
              <Route
                path="/login"
                element={
                  <MaintenancePublicGate>
                    <LoginPage />
                  </MaintenancePublicGate>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <MaintenancePublicGate>
                    <ForgotPasswordPage />
                  </MaintenancePublicGate>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <MaintenancePublicGate>
                    <ResetPasswordPage />
                  </MaintenancePublicGate>
                }
              />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>{renderAppRoutes(APP_SHELL_ROUTES)}</Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </ToastProvider>
          </ConfirmDialogProvider>
        </AuthProvider>
      </ColorSchemeProvider>
    </AppSettingsProvider>
  )
}
