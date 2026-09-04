/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:30:00
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { authService } from '../api/services'
import { useAppSettings } from '../auth/AppSettingsContext'
import { buildAppShellBrand } from '../lib/appBrand'
import { BrandMark } from '../components/BrandMark'
import { DeveloperFooter } from '../components/DeveloperFooter'
import { MenuIcon } from '../components/MenuIcon'
import { PublicGateShell } from '../components/PublicGateShell'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { settings } = useAppSettings()
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const emailResetEnabled = settings.password_reset_email_enabled !== false
  const phoneResetEnabled = Boolean(settings.password_reset_phone_enabled)
  const anyResetEnabled = emailResetEnabled || phoneResetEnabled
  const { title: brandName, subtitle: brandSubtitle } = buildAppShellBrand(settings)
  const subtitle = brandSubtitle || 'Reset password akun Anda'
  const logo = settings.path_logoheader

  const fieldLabel = emailResetEnabled && phoneResetEnabled
    ? 'Email / No. HP terdaftar'
    : phoneResetEnabled
      ? 'No. HP terdaftar'
      : 'Email terdaftar'

  const fieldHint = emailResetEnabled && phoneResetEnabled
    ? 'Gunakan email atau nomor HP yang terdaftar di profil jamaah akun Anda.'
    : phoneResetEnabled
      ? 'Gunakan nomor HP yang terdaftar di profil jamaah akun Anda.'
      : 'Gunakan email yang terdaftar di profil jamaah akun Anda.'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const result = await authService.forgotPassword({ identifier: identifier.trim() })
      if (result.channel === 'phone') {
        if (!phoneResetEnabled) {
          setError('Reset via nomor HP sedang dalam maintenance.')
          return
        }
        navigate(
          `/reset-password?channel=phone&identifier=${encodeURIComponent(identifier.trim())}`,
          { state: { masked: result.masked_destination, expires: result.expires_in_minutes } },
        )
        return
      }
      if (result.channel === 'email') {
        if (!emailResetEnabled) {
          setError('Reset via email sedang dalam maintenance.')
          return
        }
        navigate('/login', {
          state: {
            resetMessage: `Tautan reset password telah dikirim ke ${result.masked_destination}. Periksa email Anda.`,
          },
        })
        return
      }
      navigate('/login', {
        state: {
          resetMessage: emailResetEnabled && phoneResetEnabled
            ? 'Jika email atau nomor HP terdaftar, instruksi reset password akan dikirim.'
            : phoneResetEnabled
              ? 'Jika nomor HP terdaftar, kode OTP akan dikirim.'
              : 'Jika email terdaftar, tautan reset password akan dikirim.',
        },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Permintaan reset password gagal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicGateShell settings={settings}>
        <div className="login-panel__brand">
          <BrandMark size={56} src={logo} className="login-panel__brand-mark" alt={brandName} />
          <h1>{brandName}</h1>
        </div>
        <p className="login-panel__subtitle">{subtitle}</p>

        {error && <div className="alert alert--error">{error}</div>}
        {!anyResetEnabled && (
          <div className="alert alert--info">
            Reset password sedang dalam maintenance. Hubungi admin.
          </div>
        )}
        {anyResetEnabled && !emailResetEnabled && (
          <div className="alert alert--info">
            Reset via email sedang dalam maintenance.
            {phoneResetEnabled ? ' Gunakan nomor HP terdaftar.' : ''}
          </div>
        )}
        {anyResetEnabled && !phoneResetEnabled && emailResetEnabled && (
          <div className="alert alert--info">
            Reset via nomor HP sedang dalam maintenance. Gunakan email terdaftar.
          </div>
        )}

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="identifier">{fieldLabel}</label>
              <div className="field-control">
                <span className="field-control__icon" aria-hidden>
                  <MenuIcon name="user" size={16} />
                </span>
                <input
                  id="identifier"
                  type={emailResetEnabled && !phoneResetEnabled ? 'email' : 'text'}
                  autoComplete={emailResetEnabled && !phoneResetEnabled ? 'email' : 'username'}
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={
                    emailResetEnabled && phoneResetEnabled
                      ? 'Contoh: email@domain.com atau 0821...'
                      : phoneResetEnabled
                        ? 'Contoh: 0821...'
                        : 'Contoh: email@domain.com'
                  }
                  required
                  disabled={!anyResetEnabled}
                />
              </div>
              <p className="field-hint">{fieldHint}</p>
            </div>
          </div>
          <div className="form-actions form-actions--stack">
            <button type="submit" className="btn btn--primary" disabled={submitting || !anyResetEnabled}>
              {submitting ? 'Memproses…' : 'Kirim instruksi reset'}
            </button>
            <Link to="/login" className="login-link">
              Kembali ke login
            </Link>
          </div>
        </form>

        <DeveloperFooter />
    </PublicGateShell>
  )
}
