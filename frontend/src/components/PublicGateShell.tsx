/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 06:52:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 06:52:00
 */

import type { ReactNode } from 'react'
import type { AppPublicSettings } from '../api/types'
import { buildAuthGatePageStyle, buildMaintenancePageStyle } from '../lib/maintenanceTheme'

type PublicGateShellProps = {
  settings: AppPublicSettings
  mode?: 'auth' | 'maintenance'
  panelClassName?: string
  children: ReactNode
}

export function PublicGateShell({
  settings,
  mode = 'auth',
  panelClassName = 'public-gate-panel',
  children,
}: PublicGateShellProps) {
  const pageStyle = mode === 'maintenance' ? buildMaintenancePageStyle(settings) : buildAuthGatePageStyle(settings)

  return (
    <div className="public-gate-page" style={pageStyle}>
      <div className="public-gate-page__overlay" aria-hidden />
      <div className={panelClassName}>{children}</div>
    </div>
  )
}
