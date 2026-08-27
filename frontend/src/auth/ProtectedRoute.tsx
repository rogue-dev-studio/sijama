/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSettings } from './AppSettingsContext'
import { useAuth } from './AuthContext'
import { MaintenancePage } from '../pages/MaintenancePage'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const { settings, loading: settingsLoading } = useAppSettings()
  const location = useLocation()

  if (loading || settingsLoading) {
    return <div className="loading-state">Memuat sesi…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const isSuperAdmin = user.dapukan?.slug === 'superadmin'
  if (settings.maintenance_mode && !isSuperAdmin) {
    return <MaintenancePage />
  }

  return <Outlet />
}
