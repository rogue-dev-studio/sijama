/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSettings } from './AppSettingsContext'
import { useAuth } from './AuthContext'
import { isSuperAdminUser } from '../lib/isSuperAdmin'
import { hasTrustedAdminDevice } from '../lib/trustedAdminDevice'

function canAccessLoginDuringMaintenance(maintenanceLoginAllowed: boolean): boolean {
  return hasTrustedAdminDevice() || maintenanceLoginAllowed
}

export function useMaintenancePublicRedirect() {
  const { settings, loading: settingsLoading } = useAppSettings()
  const { user, loading: authLoading } = useAuth()

  if (settingsLoading || authLoading) {
    return { loading: true as const, redirect: false as const }
  }

  if (user) {
    if (settings.maintenance_mode && !isSuperAdminUser(user)) {
      return { loading: false as const, redirect: true as const, to: '/maintenance' as const }
    }

    return { loading: false as const, redirect: false as const, user }
  }

  if (settings.maintenance_mode && !canAccessLoginDuringMaintenance(settings.maintenance_login_allowed)) {
    return { loading: false as const, redirect: true as const, to: '/maintenance' as const }
  }

  return { loading: false as const, redirect: false as const }
}

export function MaintenancePublicGate({ children }: { children: ReactNode }) {
  const state = useMaintenancePublicRedirect()

  if (state.loading) {
    return <div className="loading-state">Memuat…</div>
  }

  if (state.redirect) {
    return <Navigate to={state.to} replace />
  }

  return children
}
