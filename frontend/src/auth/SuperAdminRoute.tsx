import { type ReactNode, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import type { MenuNode } from '../api/types'
import { useAuth } from './AuthContext'
import { isSuperAdminUser } from '../lib/isSuperAdmin'

interface SuperAdminRouteProps {
  children: ReactNode
}

function firstAccessiblePath(nodes: MenuNode[]): string | null {
  for (const node of nodes) {
    if (node.path) return node.path
    const nested = firstAccessiblePath(node.children ?? [])
    if (nested) return nested
  }
  return null
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user, loading, menus } = useAuth()

  const fallbackPath = useMemo(
    () => firstAccessiblePath(menus) ?? '/profil',
    [menus],
  )

  if (loading) {
    return <div className="loading-state">Memuat sesi…</div>
  }

  if (!isSuperAdminUser(user)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
