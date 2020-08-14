import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface PermissionRouteProps {
  permission: string
  children: ReactNode
}

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const { can, loading } = useAuth()

  if (loading) {
    return <div className="loading-state">Memuat sesi…</div>
  }

  if (!can(permission)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
