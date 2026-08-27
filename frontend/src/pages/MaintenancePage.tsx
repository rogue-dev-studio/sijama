/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:56:22
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
 */

import { BrandMark } from '../components/BrandMark'
import { useAppSettings } from '../auth/AppSettingsContext'
import { buildAppShellBrand } from '../lib/appBrand'

export function MaintenancePage() {
  const { settings } = useAppSettings()
  const { title, subtitle } = buildAppShellBrand(settings)
  const logo = settings.path_logoheader

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-panel__brand">
          <BrandMark size={56} src={logo} className="login-panel__brand-mark" />
          <h1>{title}</h1>
        </div>
        {subtitle && <p className="login-panel__subtitle">{subtitle}</p>}
        <div className="alert alert--error" role="status">
          {settings.maintenance_message || 'Aplikasi sedang dalam perawatan. Silakan coba lagi nanti.'}
        </div>
      </div>
    </div>
  )
}
