/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { DeveloperFooter } from '../components/DeveloperFooter'
import { MenuIcon } from '../components/MenuIcon'
import { useAppSettings } from '../auth/AppSettingsContext'
import { useAuth } from '../auth/AuthContext'
import { buildAppShellBrand } from '../lib/appBrand'
import { isSuperAdminUser } from '../lib/isSuperAdmin'
import { PublicGateShell } from '../components/PublicGateShell'

export function MaintenancePage() {
  const { settings } = useAppSettings()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { title, subtitle } = buildAppShellBrand(settings)
  const logo = settings.path_logoheader
  const showLogout = Boolean(user && !isSuperAdminUser(user))

  async function handleLogout() {
    await logout()
    navigate('/maintenance', { replace: true })
  }

  return (
    <PublicGateShell settings={settings} mode="maintenance">
        <div className="maintenance-panel__brand">
          <BrandMark size={64} src={logo} className="maintenance-panel__brand-mark" alt={title} />
          <h1>{title}</h1>
        </div>
        {subtitle && <p className="maintenance-panel__subtitle">{subtitle}</p>}
        <div className="maintenance-panel__status" role="status">
          <span className="maintenance-panel__status-icon" aria-hidden>
            <MenuIcon name="settings" size={20} />
          </span>
          <p>{settings.maintenance_message || 'Aplikasi sedang dalam perawatan. Silakan coba lagi nanti.'}</p>
        </div>
        {showLogout && (
          <div className="maintenance-panel__actions">
            <button type="button" className="btn btn--ghost" onClick={() => void handleLogout()}>
              Keluar
            </button>
          </div>
        )}
        <DeveloperFooter />
    </PublicGateShell>
  )
}
