/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:30:00
 */

import { useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { authService } from '../api/services'
import { useAppSettings } from '../auth/AppSettingsContext'
import { buildAppShellBrand } from '../lib/appBrand'
import { BrandMark } from '../components/BrandMark'
import { DeveloperFooter } from '../components/DeveloperFooter'
import { PasswordInput } from '../components/PasswordInput'
import { PublicGateShell } from '../components/PublicGateShell'

type ResetLocationState = {
  masked?: string
  expires?: number
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { settings } = useAppSettings()

  const channel = searchParams.get('channel') === 'phone' ? 'phone' : 'email'
  const identifier = searchParams.get('identifier') ?? ''
  const token = searchParams.get('token') ?? ''
  const state = (location.state as ResetLocationState | null) ?? {}
  const phoneResetEnabled = Boolean(settings.password_reset_phone_enabled)
  const emailResetEnabled = settings.password_reset_email_enabled !== false

  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const { title: brandName } = buildAppShellBrand(settings)
  const logo = settings.path_logoheader

  const hint = useMemo(() => {
    if (channel === 'phone') {
      const masked = state.masked ?? 'nomor HP terdaftar'
      const expires = state.expires ?? 15
      return `Masukkan kode OTP 6 digit yang dikirim ke ${masked}. Berlaku ${expires} menit.`
    }
    return 'Buat password baru untuk akun Anda.'
  }, [channel, state.expires, state.masked])

  if (channel === 'phone' && !phoneResetEnabled) {
    return (
      <PublicGateShell settings={settings}>
        <div className="login-panel__brand">
            <BrandMark size={56} src={logo} className="login-panel__brand-mark" alt={brandName} />
            <h1>{brandName}</h1>
          </div>
          <p className="login-panel__subtitle">Reset via nomor HP</p>
          <div className="alert alert--info">
            Reset password via nomor HP sedang dalam maintenance.
            {emailResetEnabled ? ' Gunakan email terdaftar untuk sementara.' : ' Hubungi admin.'}
          </div>
          <div className="form-actions form-actions--stack">
            {emailResetEnabled && (
              <Link to="/forgot-password" className="btn btn--primary">
                Reset via email
              </Link>
            )}
            <Link to="/login" className="login-link">
              Kembali ke login
            </Link>
          </div>
          <DeveloperFooter />
    </PublicGateShell>
    )
  }

  if (channel === 'email' && !emailResetEnabled) {
    return (
      <PublicGateShell settings={settings}>
        <div className="login-panel__brand">
            <BrandMark size={56} src={logo} className="login-panel__brand-mark" alt={brandName} />
            <h1>{brandName}</h1>
          </div>
          <p className="login-panel__subtitle">Reset via email</p>
          <div className="alert alert--info">
            Reset password via email sedang dalam maintenance.
            {phoneResetEnabled ? ' Gunakan nomor HP terdaftar untuk sementara.' : ' Hubungi admin.'}
          </div>
          <div className="form-actions form-actions--stack">
            {phoneResetEnabled && (
              <Link to="/forgot-password" className="btn btn--primary">
                Reset via nomor HP
              </Link>
            )}
            <Link to="/login" className="login-link">
              Kembali ke login
            </Link>
          </div>
          <DeveloperFooter />
    </PublicGateShell>
    )
  }

  if (!identifier || (channel === 'email' && !token)) {
    return <Navigate to="/forgot-password" replace />
  }

  async function handleResendOtp() {
    setError(null)
    setInfo(null)
    setResending(true)

    try {
      const result = await authService.forgotPassword({ identifier })
      if (result.channel === 'phone') {
        setInfo(`Kode OTP baru dikirim ke ${result.masked_destination}.`)
        setOtp('')
        return
      }
      setError('Permintaan OTP tidak dapat diproses. Coba lagi dari halaman lupa password.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim ulang OTP')
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await authService.resetPassword({
        identifier,
        password,
        password_confirmation: passwordConfirmation,
        token: channel === 'email' ? token : undefined,
        otp: channel === 'phone' ? otp : undefined,
      })
      navigate('/login', {
        state: { resetMessage: 'Password berhasil diperbarui. Silakan login.' },
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset password gagal')
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
        <p className="login-panel__subtitle">Buat password baru</p>
        <p className="field-hint">{hint}</p>

        {error && <div className="alert alert--error">{error}</div>}
        {info && <div className="alert alert--info">{info}</div>}

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid">
            {channel === 'phone' && (
              <div className="field">
                <label htmlFor="otp">Kode OTP</label>
                <input
                  id="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
                <button
                  type="button"
                  className="login-link login-link--inline"
                  disabled={resending || submitting}
                  onClick={() => void handleResendOtp()}
                >
                  {resending ? 'Mengirim ulang…' : 'Kirim ulang OTP'}
                </button>
              </div>
            )}
            <div className="field">
              <label htmlFor="password">Password baru</label>
              <PasswordInput
                id="password"
                leadingIcon
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password_confirmation">Konfirmasi password baru</label>
              <PasswordInput
                id="password_confirmation"
                leadingIcon
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="form-actions form-actions--stack">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan password baru'}
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
