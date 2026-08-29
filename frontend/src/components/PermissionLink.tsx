/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 17:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:40:00
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PermissionLinkProps = {
  to: string
  enabled: boolean
  className?: string
  children: ReactNode
}

/** Link when enabled; otherwise a non-navigating disabled-looking control. */
export function PermissionLink({ to, enabled, className = '', children }: PermissionLinkProps) {
  if (enabled) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <span className={`${className} is-disabled`.trim()} aria-disabled="true">
      {children}
    </span>
  )
}
