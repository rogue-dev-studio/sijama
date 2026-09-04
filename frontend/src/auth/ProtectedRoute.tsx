/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSettings } from './AppSettingsContext'
import { useAuth } from './AuthContext'
import { isSuperAdminUser } from '../lib/isSuperAdmin'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const { settings } = useAppSettings()
  const location = useLocation()

  if (loading) {
    return <div className="loading-state">Memuat sesi…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (settings.maintenance_mode && !isSuperAdminUser(user)) {
    return <Navigate to="/maintenance" replace />
  }

  return <Outlet />
}
