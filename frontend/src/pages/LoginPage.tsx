/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:29:10
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 14:00:00
 */

import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAppSettings } from '../auth/AppSettingsContext'
import { buildAppShellBrand } from '../lib/appBrand'
import { useAuth } from '../auth/AuthContext'
import { isSuperAdminUser } from '../lib/isSuperAdmin'
import { BrandMark } from '../components/BrandMark'
import { DeveloperFooter } from '../components/DeveloperFooter'
import { MenuIcon } from '../components/MenuIcon'
import { PasswordInput } from '../components/PasswordInput'
import { readRememberMe, writeRememberMe } from '../lib/loginRememberMe'

const showDemoHint = import.meta.env.DEV === true

export function LoginPage() {
  const { user, login } = useAuth()
  const { settings } = useAppSettings()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(readRememberMe)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo =
    (location.state as { from?: string; resetMessage?: string } | null)?.from || '/'
  const resetMessage =
    (location.state as { from?: string; resetMessage?: string } | null)?.resetMessage ?? null

  if (user) {
    if (settings.maintenance_mode && !isSuperAdminUser(user)) {
      return <Navigate to="/maintenance" replace />
    }

    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      writeRememberMe(rememberMe)
      await login(username, password, rememberMe)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login gagal')
    } finally {
      setSubmitting(false)
    }
  }

  const { title: brandName, subtitle: brandSubtitle } = buildAppShellBrand(settings)
  const subtitle = brandSubtitle || 'Masuk ke sistem informasi jamaah'
  const logo = settings.path_logoheader

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-panel__brand">
          <BrandMark size={56} src={logo} className="login-panel__brand-mark" alt={brandName} />
          <h1>{brandName}</h1>
        </div>
        <p className="login-panel__subtitle">{subtitle}</p>

        {resetMessage && <div className="alert alert--success">{resetMessage}</div>}

        {error && <div className="alert alert--error">{error}</div>}

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="username">Username / Email / No. HP</label>
              <div className="field-control">
                <span className="field-control__icon" aria-hidden>
                  <MenuIcon name="user" size={16} />
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                leadingIcon
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="login-options form-grid__full">
              <label
                className="login-options__remember"
                title={
                  rememberMe
                    ? 'Durasi sesi mengikuti pengaturan di Profil → Sesi login.'
                    : 'Sesi berakhir saat semua tab aplikasi ditutup.'
                }
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={submitting}
                />
                <span>Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="login-options__forgot">
                Lupa password?
              </Link>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Memproses…' : 'Masuk'}
            </button>
          </div>
        </form>

        {showDemoHint && (
          <p className="login-hint">
            Dev only — seed lokal (password: password): admin, admin.pusat, admin.daerah,
            admin.desa, operator, 4s.daerah, petugas, jamaah, pnkb.daerah
          </p>
        )}
        <DeveloperFooter />
      </div>
    </div>
  )
}
