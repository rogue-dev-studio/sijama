/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

import { Navigate } from 'react-router-dom'
import { MaintenancePage } from '../pages/MaintenancePage'
import { isSuperAdminUser } from '../lib/isSuperAdmin'
import { hasTrustedAdminDevice } from '../lib/trustedAdminDevice'
import { useAppSettings } from './AppSettingsContext'
import { useAuth } from './AuthContext'

export function MaintenanceRoute() {
  const { settings, loading: settingsLoading } = useAppSettings()
  const { user, loading: authLoading } = useAuth()

  if (settingsLoading || authLoading) {
    return <div className="loading-state">Memuat…</div>
  }

  if (!settings.maintenance_mode) {
    if (user && isSuperAdminUser(user)) {
      return <Navigate to="/" replace />
    }

    return <Navigate to="/login" replace />
  }

  if (user && isSuperAdminUser(user)) {
    return <Navigate to="/" replace />
  }

  const trusted =
    hasTrustedAdminDevice() || Boolean(settings.maintenance_login_allowed)

  if (!user && trusted) {
    return <Navigate to="/login" replace />
  }

  return <MaintenancePage />
}
