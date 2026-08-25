import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError, clearToken, getToken, setToken } from '../api/client'
import { authService } from '../api/services'
import type { AuthPayload, MenuNode, User } from '../api/types'

interface AuthContextValue {
  user: User | null
  permissions: string[]
  menus: MenuNode[]
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  can: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function applyAuthPayload(
  payload: AuthPayload,
  setUser: (user: User | null) => void,
  setPermissions: (permissions: string[]) => void,
  setMenus: (menus: MenuNode[]) => void,
) {
  setUser(payload.user)
  setPermissions(payload.permissions)
  setMenus(payload.menus)
}

function clearAuth(
  setUser: (user: User | null) => void,
  setPermissions: (permissions: string[]) => void,
  setMenus: (menus: MenuNode[]) => void,
) {
  setUser(null)
  setPermissions([])
  setMenus([])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [menus, setMenus] = useState<MenuNode[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!getToken()) {
        if (active) setLoading(false)
        return
      }

      try {
        const me = await authService.me()
        if (active) applyAuthPayload(me, setUser, setPermissions, setMenus)
      } catch {
        clearToken()
        if (active) clearAuth(setUser, setPermissions, setMenus)
      } finally {
        if (active) setLoading(false)
      }
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const result = await authService.login(username, password)
    setToken(result.token)
    applyAuthPayload(result, setUser, setPermissions, setMenus)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error
      }
    } finally {
      clearToken()
      clearAuth(setUser, setPermissions, setMenus)
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!getToken()) return
    const me = await authService.me()
    applyAuthPayload(me, setUser, setPermissions, setMenus)
  }, [])

  const can = useCallback(
    (permission: string) => {
      if (user?.dapukan?.slug === 'superadmin') return true
      return permissions.includes(permission)
    },
    [permissions, user],
  )

  const value = useMemo(
    () => ({ user, permissions, menus, loading, login, logout, refresh, can }),
    [user, permissions, menus, loading, login, logout, refresh, can],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
