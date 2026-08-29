/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:42:08
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:53:00
 */

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { aplikasiKonfigService } from '../api/services'
import type { KonfigSystemInput } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useAppSettings } from '../auth/AppSettingsContext'
import { SearchableSelect } from '../components/SearchableSelect'
import { PasswordInput } from '../components/PasswordInput'
import { KonfigImageUpload } from '../components/KonfigImageUpload'
import { ThemeColorField } from '../components/ThemeColorField'
import { ThemePalettePicker } from '../components/ThemePalettePicker'
import { useToast } from '../components/ToastProvider'
import { KONFIG_ASSET_FIELD, type KonfigAssetKind } from '../lib/konfigAsset'
import {
  DEFAULT_BACKGROUND_STYLE,
  DEFAULT_BACKGROUND_REPEAT_SIZE,
  BACKGROUND_STYLE_OPTIONS,
  BACKGROUND_REPEAT_SIZE_OPTIONS,
  normalizeBackgroundStyle,
  normalizeBackgroundRepeatSize,
} from '../lib/backgroundStyle'
import {
  DEFAULT_THEME_COLORS,
  DEFAULT_THEME_FORM,
  matchThemePaletteId,
  type ThemePalette,
} from '../lib/themeDefaults'

type KonfigTab = 'identitas' | 'email' | 'integrasi' | 'branding' | 'tema' | 'operasional'

const TABS: Array<{ id: KonfigTab; label: string; permission: string }> = [
  { id: 'identitas', label: 'Identitas', permission: 'konfig.identitas.view' },
  { id: 'email', label: 'Email / SMS', permission: 'konfig.email.view' },
  { id: 'integrasi', label: 'Integrasi', permission: 'konfig.integrasi.view' },
  { id: 'branding', label: 'Branding', permission: 'konfig.branding.view' },
  { id: 'tema', label: 'Tema', permission: 'konfig.tema.view' },
  { id: 'operasional', label: 'Operasional', permission: 'konfig.operasional.view' },
]

const emptyForm: KonfigSystemInput = {
  app_nama: '',
  nama_instansi: '',
  alamat: '',
  telepon: '',
  email_kontak: '',
  timezone: 'Asia/Jakarta',
  locale: 'id',
  mail_protocol: 'smtp',
  smtp_hostname: '',
  smtp_username: '',
  smtp_password: '',
  smtp_port: 587,
  smtp_timeout: 30,
  smtp_encryption: 'tls',
  mail_from_address: '',
  mail_from_name: '',
  mail_reply_to: '',
  password_reset_email_enabled: true,
  password_reset_phone_enabled: false,
  sms_driver: 'log',
  sms_country_code: '62',
  fonnte_token: '',
  fonnte_endpoint: 'https://api.fonnte.com/send',
  telegram_enabled: false,
  telegram_bot_token: '',
  telegram_bot_username: '',
  telegram_default_chat_id: '',
  n8n_enabled: false,
  n8n_base_url: '',
  n8n_webhook_url: '',
  n8n_api_key: '',
  header: '',
  footer: '',
  website: '',
  footer_link: '',
  footer_detail: '',
  footer_detail_link: '',
  header_detail: '',
  path_logoheader: '',
  path_favicon: '',
  path_logofooter: '',
  path_background: '',
  background_style: DEFAULT_BACKGROUND_STYLE,
  background_repeat_size: DEFAULT_BACKGROUND_REPEAT_SIZE,
  color_bg: '',
  color_surface: '',
  color_ink: '',
  color_accent: '',
  color_accent_soft: '',
  color_muted: '',
  color_border: '',
  theme_color: '',
  maintenance_mode: false,
  maintenance_message: '',
  path_maintenance_background: '',
  maintenance_background_style: DEFAULT_BACKGROUND_STYLE,
  maintenance_background_repeat_size: DEFAULT_BACKGROUND_REPEAT_SIZE,
  additional_data: '',
  is_active: true,
}

export function AplikasiKonfigPage() {
  const { can } = useAuth()
  const { refreshSettings } = useAppSettings()
  const { notifySuccess } = useToast()
  const canUpdate = can('konfig.update')
  const visibleTabs = useMemo(() => TABS.filter((item) => can(item.permission)), [can])
  const tabsId = useId()
  const [tab, setTab] = useState<KonfigTab>('identitas')
  const [form, setForm] = useState<KonfigSystemInput>(emptyForm)
  const [passwordSet, setPasswordSet] = useState(false)
  const [fonnteTokenSet, setFonnteTokenSet] = useState(false)
  const [telegramTokenSet, setTelegramTokenSet] = useState(false)
  const [n8nApiKeySet, setN8nApiKeySet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAssets, setPendingAssets] = useState<Partial<Record<KonfigAssetKind, File>>>({})
  const [pendingAssetDeletes, setPendingAssetDeletes] = useState<Partial<Record<KonfigAssetKind, boolean>>>({})

  useEffect(() => {
    if (visibleTabs.length === 0) return
    if (!visibleTabs.some((item) => item.id === tab)) {
      setTab(visibleTabs[0].id)
    }
  }, [visibleTabs, tab])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const item = await aplikasiKonfigService.get()
        if (!active) return
        setPasswordSet(item.smtp_password_set)
        setFonnteTokenSet(item.fonnte_token_set)
        setTelegramTokenSet(item.telegram_bot_token_set)
        setN8nApiKeySet(item.n8n_api_key_set)
        setForm({
          app_nama: item.app_nama || '',
          nama_instansi: item.nama_instansi || '',
          alamat: item.alamat || '',
          telepon: item.telepon || '',
          email_kontak: item.email_kontak || '',
          timezone: item.timezone || 'Asia/Jakarta',
          locale: item.locale || 'id',
          mail_protocol: item.mail_protocol || 'smtp',
          smtp_hostname: item.smtp_hostname || '',
          smtp_username: item.smtp_username || '',
          smtp_password: '',
          smtp_port: item.smtp_port,
          smtp_timeout: item.smtp_timeout,
          smtp_encryption: item.smtp_encryption || '',
          mail_from_address: item.mail_from_address || '',
          mail_from_name: item.mail_from_name || '',
          mail_reply_to: item.mail_reply_to || '',
          password_reset_email_enabled: item.password_reset_email_enabled ?? true,
          password_reset_phone_enabled: item.password_reset_phone_enabled,
          sms_driver: item.sms_driver || 'log',
          sms_country_code: item.sms_country_code || '62',
          fonnte_token: '',
          fonnte_endpoint: item.fonnte_endpoint || 'https://api.fonnte.com/send',
          telegram_enabled: item.telegram_enabled,
          telegram_bot_token: '',
          telegram_bot_username: item.telegram_bot_username || '',
          telegram_default_chat_id: item.telegram_default_chat_id || '',
          n8n_enabled: item.n8n_enabled,
          n8n_base_url: item.n8n_base_url || '',
          n8n_webhook_url: item.n8n_webhook_url || '',
          n8n_api_key: '',
          header: item.header || '',
          footer: item.footer || '',
          website: item.website || '',
          footer_link: item.footer_link || '',
          footer_detail: item.footer_detail || '',
          footer_detail_link: item.footer_detail_link || '',
          header_detail: item.header_detail || '',
          path_logoheader: item.path_logoheader || '',
          path_favicon: item.path_favicon || '',
          path_logofooter: item.path_logofooter || '',
          path_background: item.path_background || '',
          background_style: normalizeBackgroundStyle(item.background_style),
          background_repeat_size: normalizeBackgroundRepeatSize(item.background_repeat_size),
          color_bg: item.color_bg || '',
          color_surface: item.color_surface || '',
          color_ink: item.color_ink || '',
          color_accent: item.color_accent || '',
          color_accent_soft: item.color_accent_soft || '',
          color_muted: item.color_muted || '',
          color_border: item.color_border || '',
          theme_color: item.theme_color || '',
          maintenance_mode: item.maintenance_mode,
          maintenance_message: item.maintenance_message || '',
          path_maintenance_background: item.path_maintenance_background || '',
          maintenance_background_style: normalizeBackgroundStyle(item.maintenance_background_style),
          maintenance_background_repeat_size: normalizeBackgroundRepeatSize(item.maintenance_background_repeat_size),
          additional_data: item.additional_data || '',
          is_active: item.is_active,
        })
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat konfigurasi')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  function setField<K extends keyof KonfigSystemInput>(key: K, value: KonfigSystemInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setPendingAsset(asset: KonfigAssetKind, file: File | null) {
    setPendingAssets((prev) => {
      const next = { ...prev }
      if (file) {
        next[asset] = file
      } else {
        delete next[asset]
      }
      return next
    })

    if (file) {
      setPendingAssetDeletes((prev) => {
        if (!prev[asset]) {
          return prev
        }
        const next = { ...prev }
        delete next[asset]
        return next
      })
    }
  }

  function setPendingAssetDelete(asset: KonfigAssetKind, marked: boolean) {
    setPendingAssetDeletes((prev) => {
      const next = { ...prev }
      if (marked) {
        next[asset] = true
      } else {
        delete next[asset]
      }
      return next
    })

    if (marked) {
      setPendingAsset(asset, null)
    }
  }

  function applyThemePalette(palette: ThemePalette) {
    setForm((prev) => ({
      ...prev,
      color_bg: palette.colors.color_bg,
      color_surface: palette.colors.color_surface,
      color_ink: palette.colors.color_ink,
      color_accent: palette.colors.color_accent,
      color_accent_soft: palette.colors.color_accent_soft,
      color_muted: palette.colors.color_muted,
      color_border: palette.colors.color_border,
      theme_color: palette.colors.theme_color,
    }))
    setError(null)
    notifySuccess(`Palet “${palette.name}” diterapkan. Klik Simpan semua untuk menyimpan.`)
  }

  function resetThemeToDefault() {
    setForm((prev) => ({
      ...prev,
      ...DEFAULT_THEME_FORM,
    }))

    setPendingAssets((prev) => {
      if (!prev.background) {
        return prev
      }
      const next = { ...prev }
      delete next.background
      return next
    })

    setPendingAssetDeletes((prev) => {
      const hadSavedBackground = Boolean(form.path_background?.trim())
      if (!hadSavedBackground) {
        if (!prev.background) {
          return prev
        }
        const next = { ...prev }
        delete next.background
        return next
      }
      return { ...prev, background: true }
    })

    setError(null)
    notifySuccess('Tema direset ke default. Klik Simpan semua untuk menerapkan.')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canUpdate) return
    setSubmitting(true)
    setError(null)

    const payload: KonfigSystemInput = {
      ...form,
      app_nama: form.app_nama?.trim() || null,
      nama_instansi: form.nama_instansi?.trim() || null,
      alamat: form.alamat?.trim() || null,
      telepon: form.telepon?.trim() || null,
      email_kontak: form.email_kontak?.trim() || null,
      timezone: form.timezone?.trim() || null,
      locale: form.locale?.trim() || null,
      mail_protocol: form.mail_protocol?.trim() || null,
      smtp_hostname: form.smtp_hostname?.trim() || null,
      smtp_username: form.smtp_username?.trim() || null,
      smtp_password: form.smtp_password?.trim() || null,
      smtp_encryption: form.smtp_encryption?.trim() || null,
      mail_from_address: form.mail_from_address?.trim() || null,
      mail_from_name: form.mail_from_name?.trim() || null,
      mail_reply_to: form.mail_reply_to?.trim() || null,
      password_reset_email_enabled: Boolean(form.password_reset_email_enabled),
      password_reset_phone_enabled: Boolean(form.password_reset_phone_enabled),
      sms_driver: form.sms_driver?.trim() || null,
      sms_country_code: form.sms_country_code?.trim() || null,
      fonnte_token: form.fonnte_token?.trim() || null,
      fonnte_endpoint: form.fonnte_endpoint?.trim() || null,
      telegram_enabled: Boolean(form.telegram_enabled),
      telegram_bot_token: form.telegram_bot_token?.trim() || null,
      telegram_bot_username: form.telegram_bot_username?.trim() || null,
      telegram_default_chat_id: form.telegram_default_chat_id?.trim() || null,
      n8n_enabled: Boolean(form.n8n_enabled),
      n8n_base_url: form.n8n_base_url?.trim() || null,
      n8n_webhook_url: form.n8n_webhook_url?.trim() || null,
      n8n_api_key: form.n8n_api_key?.trim() || null,
      header: form.header?.trim() || null,
      footer: form.footer?.trim() || null,
      website: form.website?.trim() || null,
      footer_link: form.footer_link?.trim() || null,
      footer_detail: form.footer_detail?.trim() || null,
      footer_detail_link: form.footer_detail_link?.trim() || null,
      header_detail: form.header_detail?.trim() || null,
      path_logoheader: form.path_logoheader?.trim() || null,
      path_favicon: form.path_favicon?.trim() || null,
      path_logofooter: form.path_logofooter?.trim() || null,
      path_background: form.path_background?.trim() || null,
      background_style: normalizeBackgroundStyle(form.background_style),
      background_repeat_size: normalizeBackgroundRepeatSize(form.background_repeat_size),
      color_bg: form.color_bg?.trim() || null,
      color_surface: form.color_surface?.trim() || null,
      color_ink: form.color_ink?.trim() || null,
      color_accent: form.color_accent?.trim() || null,
      color_accent_soft: form.color_accent_soft?.trim() || null,
      color_muted: form.color_muted?.trim() || null,
      color_border: form.color_border?.trim() || null,
      theme_color: form.theme_color?.trim() || null,
      maintenance_message: form.maintenance_message?.trim() || null,
      path_maintenance_background: form.path_maintenance_background?.trim() || null,
      maintenance_background_style: normalizeBackgroundStyle(form.maintenance_background_style),
      maintenance_background_repeat_size: normalizeBackgroundRepeatSize(form.maintenance_background_repeat_size),
      additional_data: form.additional_data?.trim() || null,
    }

    try {
      for (const [asset, marked] of Object.entries(pendingAssetDeletes) as Array<[KonfigAssetKind, boolean]>) {
        if (!marked) {
          continue
        }

        const saved = await aplikasiKonfigService.deleteAsset(asset)
        const field = KONFIG_ASSET_FIELD[asset]
        payload[field] = saved[field] ?? null
      }

      for (const [asset, file] of Object.entries(pendingAssets) as Array<[KonfigAssetKind, File]>) {
        const saved = await aplikasiKonfigService.uploadAsset(asset, file)
        const field = KONFIG_ASSET_FIELD[asset]
        payload[field] = saved[field] ?? payload[field]
      }

      const saved = await aplikasiKonfigService.update(payload)
      setPasswordSet(saved.smtp_password_set)
      setFonnteTokenSet(saved.fonnte_token_set)
      setTelegramTokenSet(saved.telegram_bot_token_set)
      setN8nApiKeySet(saved.n8n_api_key_set)
      setField('smtp_password', '')
      setField('fonnte_token', '')
      setField('telegram_bot_token', '')
      setField('n8n_api_key', '')
      setForm((prev) => ({
        ...prev,
        path_logoheader: saved.path_logoheader ?? '',
        path_favicon: saved.path_favicon ?? '',
        path_logofooter: saved.path_logofooter ?? '',
        path_background: saved.path_background ?? '',
        background_style: normalizeBackgroundStyle(saved.background_style),
        background_repeat_size: normalizeBackgroundRepeatSize(saved.background_repeat_size),
        color_bg: saved.color_bg ?? '',
        color_surface: saved.color_surface ?? '',
        color_ink: saved.color_ink ?? '',
        color_accent: saved.color_accent ?? '',
        color_accent_soft: saved.color_accent_soft ?? '',
        color_muted: saved.color_muted ?? '',
        color_border: saved.color_border ?? '',
        theme_color: saved.theme_color ?? '',
        path_maintenance_background: saved.path_maintenance_background ?? '',
        maintenance_background_style: normalizeBackgroundStyle(saved.maintenance_background_style),
        maintenance_background_repeat_size: normalizeBackgroundRepeatSize(saved.maintenance_background_repeat_size),
      }))
      setPendingAssets({})
      setPendingAssetDeletes({})
      await refreshSettings()
      notifySuccess('Konfigurasi sistem berhasil disimpan.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan konfigurasi')
    } finally {
      setSubmitting(false)
    }
  }

  const hasBackgroundAsset =
    Boolean(pendingAssets.background) ||
    (Boolean(form.path_background?.trim()) && !pendingAssetDeletes.background)

  const hasMaintenanceBackgroundAsset =
    Boolean(pendingAssets['maintenance-background']) ||
    (Boolean(form.path_maintenance_background?.trim()) && !pendingAssetDeletes['maintenance-background'])

  const selectedPaletteId = matchThemePaletteId({
    color_bg: form.color_bg,
    color_surface: form.color_surface,
    color_ink: form.color_ink,
    color_accent: form.color_accent,
    color_accent_soft: form.color_accent_soft,
    color_muted: form.color_muted,
    color_border: form.color_border,
    theme_color: form.theme_color,
  })

  if (loading) {
    return <div className="loading-state">Memuat konfigurasi…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>Konfigurasi Sistem</h1>
        <p>Satu setelan global aplikasi — hanya Super Admin yang dapat mengakses.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel konfig-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="konfig-tabs" role="tablist" aria-label="Kategori konfigurasi">
          {visibleTabs.map((item) => {
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${tabsId}-${item.id}`}
                className={`konfig-tabs__tab${selected ? ' is-active' : ''}`}
                aria-selected={selected}
                aria-controls={`${tabsId}-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setTab(item.id)
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        {visibleTabs.length === 0 ? (
          <div className="empty-state">Tidak ada tab konfigurasi yang diizinkan untuk akun ini.</div>
        ) : (
        <fieldset disabled={!canUpdate} className="konfig-form__fieldset">
          <div
            role="tabpanel"
            id={`${tabsId}-panel-identitas`}
            aria-labelledby={`${tabsId}-identitas`}
            hidden={tab !== 'identitas' || !can('konfig.identitas.view')}
          >
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="app_nama">Nama aplikasi</label>
                <input id="app_nama" value={form.app_nama || ''} onChange={(e) => setField('app_nama', e.target.value)} />
                <p className="field-hint">Ditampilkan di tab browser.</p>
              </div>
              <div className="field">
                <label htmlFor="nama_instansi">Nama instansi</label>
                <input
                  id="nama_instansi"
                  value={form.nama_instansi || ''}
                  onChange={(e) => setField('nama_instansi', e.target.value)}
                />
                <p className="field-hint">Ditampilkan di tab browser (setelah nama aplikasi).</p>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="alamat">Alamat</label>
                <textarea
                  id="alamat"
                  rows={2}
                  value={form.alamat || ''}
                  onChange={(e) => setField('alamat', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="telepon">Telepon</label>
                <input id="telepon" value={form.telepon || ''} onChange={(e) => setField('telepon', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="email_kontak">Email kontak</label>
                <input
                  id="email_kontak"
                  type="email"
                  value={form.email_kontak || ''}
                  onChange={(e) => setField('email_kontak', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="timezone">Timezone</label>
                <input id="timezone" value={form.timezone || ''} onChange={(e) => setField('timezone', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="locale">Locale</label>
                <input id="locale" value={form.locale || ''} onChange={(e) => setField('locale', e.target.value)} />
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${tabsId}-panel-email`}
            aria-labelledby={`${tabsId}-email`}
            hidden={tab !== 'email' || !can('konfig.email.view')}
          >
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="mail_protocol">Protocol</label>
                <SearchableSelect
                  id="mail_protocol"
                  value={form.mail_protocol || 'smtp'}
                  onChange={(next) => setField('mail_protocol', next)}
                  options={[
                    { value: 'smtp', label: 'SMTP' },
                    { value: 'log', label: 'Log (dev)' },
                    { value: 'sendmail', label: 'Sendmail' },
                    { value: 'array', label: 'Array (test)' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="smtp_hostname">SMTP hostname</label>
                <input
                  id="smtp_hostname"
                  value={form.smtp_hostname || ''}
                  onChange={(e) => setField('smtp_hostname', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="smtp_port">SMTP port</label>
                <input
                  id="smtp_port"
                  type="number"
                  value={form.smtp_port ?? ''}
                  onChange={(e) => setField('smtp_port', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="smtp_timeout">SMTP timeout</label>
                <input
                  id="smtp_timeout"
                  type="number"
                  value={form.smtp_timeout ?? ''}
                  onChange={(e) => setField('smtp_timeout', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="smtp_encryption">Encryption</label>
                <SearchableSelect
                  id="smtp_encryption"
                  value={form.smtp_encryption || ''}
                  onChange={(next) => setField('smtp_encryption', next)}
                  options={[
                    { value: '', label: '— Tidak ada —' },
                    { value: 'tls', label: 'TLS' },
                    { value: 'ssl', label: 'SSL' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="smtp_username">SMTP username</label>
                <input
                  id="smtp_username"
                  value={form.smtp_username || ''}
                  onChange={(e) => setField('smtp_username', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="smtp_password">SMTP password</label>
                <PasswordInput
                  id="smtp_password"
                  autoComplete="new-password"
                  placeholder={passwordSet ? 'Kosongkan jika tidak diubah' : ''}
                  value={form.smtp_password || ''}
                  onChange={(e) => setField('smtp_password', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="mail_from_address">From address</label>
                <input
                  id="mail_from_address"
                  type="email"
                  value={form.mail_from_address || ''}
                  onChange={(e) => setField('mail_from_address', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="mail_from_name">From name</label>
                <input
                  id="mail_from_name"
                  value={form.mail_from_name || ''}
                  onChange={(e) => setField('mail_from_name', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="mail_reply_to">Reply-to</label>
                <input
                  id="mail_reply_to"
                  type="email"
                  value={form.mail_reply_to || ''}
                  onChange={(e) => setField('mail_reply_to', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="password_reset_email_enabled">Reset via email</label>
                <SearchableSelect
                  id="password_reset_email_enabled"
                  value={form.password_reset_email_enabled ? '1' : '0'}
                  onChange={(next) => setField('password_reset_email_enabled', next === '1')}
                  options={[
                    { value: '1', label: 'Aktif' },
                    { value: '0', label: 'Maintenance (nonaktif)' },
                  ]}
                />
              </div>
            </div>

            <h3 className="form-section-title" style={{ marginTop: '1.5rem' }}>
              SMS / Reset via nomor HP
            </h3>
            <p className="field-hint" style={{ marginBottom: '1rem' }}>
              Saat dinonaktifkan, lupa password hanya menerima email. Driver{' '}
              <code>log</code> menulis OTP ke log backend (dev); <code>fonnte</code> kirim
              lewat gateway Fonnte.
            </p>
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="password_reset_phone_enabled">Reset via HP</label>
                <SearchableSelect
                  id="password_reset_phone_enabled"
                  value={form.password_reset_phone_enabled ? '1' : '0'}
                  onChange={(next) => setField('password_reset_phone_enabled', next === '1')}
                  options={[
                    { value: '0', label: 'Maintenance (nonaktif)' },
                    { value: '1', label: 'Aktif' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="sms_driver">SMS driver</label>
                <SearchableSelect
                  id="sms_driver"
                  value={form.sms_driver || 'log'}
                  onChange={(next) => setField('sms_driver', next)}
                  options={[
                    { value: 'log', label: 'Log (dev)' },
                    { value: 'fonnte', label: 'Fonnte' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="sms_country_code">Kode negara</label>
                <input
                  id="sms_country_code"
                  value={form.sms_country_code || ''}
                  onChange={(e) => setField('sms_country_code', e.target.value)}
                  placeholder="62"
                />
              </div>
              <div className="field">
                <label htmlFor="fonnte_endpoint">Fonnte endpoint</label>
                <input
                  id="fonnte_endpoint"
                  value={form.fonnte_endpoint || ''}
                  onChange={(e) => setField('fonnte_endpoint', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="fonnte_token">Fonnte token</label>
                <PasswordInput
                  id="fonnte_token"
                  autoComplete="new-password"
                  placeholder={fonnteTokenSet ? 'Kosongkan jika tidak diubah' : ''}
                  value={form.fonnte_token || ''}
                  onChange={(e) => setField('fonnte_token', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${tabsId}-panel-integrasi`}
            aria-labelledby={`${tabsId}-integrasi`}
            hidden={tab !== 'integrasi' || !can('konfig.integrasi.view')}
          >
            <h3 className="form-section-title form-section-title--first">Telegram Bot</h3>
            <p className="field-hint" style={{ marginBottom: '1rem' }}>
              Token dari @BotFather. Chat ID dipakai untuk notifikasi default (opsional).
            </p>
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="telegram_enabled">Status Telegram</label>
                <SearchableSelect
                  id="telegram_enabled"
                  value={form.telegram_enabled ? '1' : '0'}
                  onChange={(next) => setField('telegram_enabled', next === '1')}
                  options={[
                    { value: '0', label: 'Nonaktif' },
                    { value: '1', label: 'Aktif' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="telegram_bot_username">Bot username</label>
                <input
                  id="telegram_bot_username"
                  value={form.telegram_bot_username || ''}
                  onChange={(e) => setField('telegram_bot_username', e.target.value)}
                  placeholder="@nama_bot"
                />
              </div>
              <div className="field">
                <label htmlFor="telegram_bot_token">Bot token</label>
                <PasswordInput
                  id="telegram_bot_token"
                  autoComplete="new-password"
                  placeholder={telegramTokenSet ? 'Kosongkan jika tidak diubah' : ''}
                  value={form.telegram_bot_token || ''}
                  onChange={(e) => setField('telegram_bot_token', e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="telegram_default_chat_id">Default chat ID</label>
                <input
                  id="telegram_default_chat_id"
                  value={form.telegram_default_chat_id || ''}
                  onChange={(e) => setField('telegram_default_chat_id', e.target.value)}
                  placeholder="Contoh: 123456789"
                />
              </div>
            </div>

            <h3 className="form-section-title" style={{ marginTop: '1.5rem' }}>
              n8n
            </h3>
            <p className="field-hint" style={{ marginBottom: '1rem' }}>
              Base URL instance n8n dan webhook workflow. API key opsional untuk autentikasi.
            </p>
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="n8n_enabled">Status n8n</label>
                <SearchableSelect
                  id="n8n_enabled"
                  value={form.n8n_enabled ? '1' : '0'}
                  onChange={(next) => setField('n8n_enabled', next === '1')}
                  options={[
                    { value: '0', label: 'Nonaktif' },
                    { value: '1', label: 'Aktif' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="n8n_base_url">Base URL</label>
                <input
                  id="n8n_base_url"
                  value={form.n8n_base_url || ''}
                  onChange={(e) => setField('n8n_base_url', e.target.value)}
                  placeholder="https://n8n.domain.com"
                />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="n8n_webhook_url">Webhook URL</label>
                <input
                  id="n8n_webhook_url"
                  value={form.n8n_webhook_url || ''}
                  onChange={(e) => setField('n8n_webhook_url', e.target.value)}
                  placeholder="https://n8n.domain.com/webhook/..."
                />
              </div>
              <div className="field">
                <label htmlFor="n8n_api_key">API key</label>
                <PasswordInput
                  id="n8n_api_key"
                  autoComplete="new-password"
                  placeholder={n8nApiKeySet ? 'Kosongkan jika tidak diubah' : ''}
                  value={form.n8n_api_key || ''}
                  onChange={(e) => setField('n8n_api_key', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${tabsId}-panel-branding`}
            aria-labelledby={`${tabsId}-branding`}
            hidden={tab !== 'branding' || !can('konfig.branding.view')}
          >
            <div className="form-grid form-grid--2">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="header">Header</label>
                <textarea
                  id="header"
                  rows={2}
                  value={form.header || ''}
                  onChange={(e) => setField('header', e.target.value)}
                />
                <p className="field-hint">Judul utama di sidebar dan header aplikasi.</p>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="header_detail">Header detail</label>
                <textarea
                  id="header_detail"
                  rows={2}
                  value={form.header_detail || ''}
                  onChange={(e) => setField('header_detail', e.target.value)}
                />
                <p className="field-hint">Keterangan di bawah judul sidebar/header aplikasi.</p>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <h3 className="form-section-title">Footer developer</h3>
              </div>
              <div className="field">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="url"
                  value={form.website || ''}
                  onChange={(e) => setField('website', e.target.value)}
                  placeholder="https://github.com/rogue-dev-studio"
                />
                <p className="field-hint">Link untuk teks developer pada baris &quot;Dikembangkan oleh …&quot;.</p>
              </div>
              <div className="field">
                <label htmlFor="footer">Footer</label>
                <input
                  id="footer"
                  value={form.footer || ''}
                  onChange={(e) => setField('footer', e.target.value)}
                  placeholder="Rogue Development"
                />
                <p className="field-hint">Nama developer yang ditampilkan (mis. Rogue Development).</p>
              </div>
              <div className="field">
                <label htmlFor="footer_link">Footer link</label>
                <input
                  id="footer_link"
                  type="url"
                  value={form.footer_link || ''}
                  onChange={(e) => setField('footer_link', e.target.value)}
                  placeholder="https://github.com/rogue-dev-studio"
                />
                <p className="field-hint">Link cadangan jika website kosong.</p>
              </div>
              <div className="field">
                <label htmlFor="footer_detail">Footer detail</label>
                <input
                  id="footer_detail"
                  value={form.footer_detail || ''}
                  onChange={(e) => setField('footer_detail', e.target.value)}
                  placeholder="Rogue Dev Studio · @rogue-dev-studio"
                />
                <p className="field-hint">Baris meta di bawah footer developer.</p>
              </div>
              <div className="field">
                <label htmlFor="footer_detail_link">Footer detail link</label>
                <input
                  id="footer_detail_link"
                  type="url"
                  value={form.footer_detail_link || ''}
                  onChange={(e) => setField('footer_detail_link', e.target.value)}
                  placeholder="https://github.com/rogue-dev-studio"
                />
                <p className="field-hint">Link untuk bagian setelah &quot; · &quot; (mis. @rogue-dev-studio).</p>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <h3 className="form-section-title">Logo &amp; aset</h3>
              </div>
              <KonfigImageUpload
                label="Logo header"
                asset="logo-header"
                savedPath={form.path_logoheader}
                pendingFile={pendingAssets['logo-header']}
                markedForDelete={Boolean(pendingAssetDeletes['logo-header'])}
                disabled={!canUpdate}
                hint="Logo sidebar dan header aplikasi. Disimpan saat klik Simpan semua."
                onFileSelected={(file) => setPendingAsset('logo-header', file)}
                onMarkDelete={() => setPendingAssetDelete('logo-header', true)}
                onCancelDelete={() => setPendingAssetDelete('logo-header', false)}
              />
              <KonfigImageUpload
                label="Favicon"
                asset="favicon"
                savedPath={form.path_favicon}
                pendingFile={pendingAssets.favicon}
                markedForDelete={Boolean(pendingAssetDeletes.favicon)}
                disabled={!canUpdate}
                hint="Ikon tab browser. Disimpan saat klik Simpan semua."
                onFileSelected={(file) => setPendingAsset('favicon', file)}
                onMarkDelete={() => setPendingAssetDelete('favicon', true)}
                onCancelDelete={() => setPendingAssetDelete('favicon', false)}
              />
              <KonfigImageUpload
                label="Logo footer"
                asset="logo-footer"
                savedPath={form.path_logofooter}
                pendingFile={pendingAssets['logo-footer']}
                markedForDelete={Boolean(pendingAssetDeletes['logo-footer'])}
                disabled={!canUpdate}
                hint="Hanya di footer bawah halaman (bukan sidebar/header). Disimpan saat klik Simpan semua."
                onFileSelected={(file) => setPendingAsset('logo-footer', file)}
                onMarkDelete={() => setPendingAssetDelete('logo-footer', true)}
                onCancelDelete={() => setPendingAssetDelete('logo-footer', false)}
              />
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${tabsId}-panel-tema`}
            aria-labelledby={`${tabsId}-tema`}
            hidden={tab !== 'tema' || !can('konfig.tema.view')}
          >
            <div className="form-grid form-grid--2">
              <div className="konfig-theme-toolbar" style={{ gridColumn: '1 / -1' }}>
                <div>
                  <h3 className="form-section-title konfig-theme-toolbar__title">Tema aplikasi</h3>
                  <p className="field-hint">
                    Reset mengembalikan warna bawaan SIJAMA, menghapus background upload, dan style cover.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={!canUpdate || submitting}
                  onClick={resetThemeToDefault}
                >
                  Reset ke default
                </button>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <KonfigImageUpload
                  label="Background"
                  asset="background"
                  savedPath={form.path_background}
                  pendingFile={pendingAssets.background}
                  markedForDelete={Boolean(pendingAssetDeletes.background)}
                  disabled={!canUpdate}
                  hint="Gambar latar aplikasi (login & halaman utama). Disimpan saat klik Simpan semua."
                  onFileSelected={(file) => setPendingAsset('background', file)}
                  onMarkDelete={() => setPendingAssetDelete('background', true)}
                  onCancelDelete={() => setPendingAssetDelete('background', false)}
                />
              </div>
              <div className="field">
                <label htmlFor="background_style">Style background</label>
                <select
                  id="background_style"
                  value={form.background_style ?? DEFAULT_BACKGROUND_STYLE}
                  disabled={!canUpdate || !hasBackgroundAsset}
                  onChange={(event) => setField('background_style', event.target.value)}
                >
                  {BACKGROUND_STYLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="field-hint">
                  Hanya berlaku jika ada gambar background diunggah. Tanpa upload, aplikasi memakai pola
                  titik bawaan SIJAMA.
                </p>
              </div>
              {(form.background_style ?? DEFAULT_BACKGROUND_STYLE) === 'repeat' && (
                <div className="field">
                  <label htmlFor="background_repeat_size">Ukuran tile repeat</label>
                  <select
                    id="background_repeat_size"
                    value={form.background_repeat_size ?? DEFAULT_BACKGROUND_REPEAT_SIZE}
                    disabled={!canUpdate || !hasBackgroundAsset}
                    onChange={(event) => setField('background_repeat_size', event.target.value)}
                  >
                    {BACKGROUND_REPEAT_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="field-hint">
                    Untuk foto besar, coba 48–128px. Untuk pola kecil seperti `bg-pattern.svg`, 24–32px
                    atau Asli biasanya pas.
                  </p>
                </div>
              )}
              <ThemePalettePicker
                selectedId={selectedPaletteId}
                disabled={!canUpdate || submitting}
                onSelect={applyThemePalette}
              />
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <h3 className="form-section-title">Warna tema</h3>
                <p className="field-hint">
                  Kosongkan per warna, pilih palet di atas, atau gunakan Reset ke default.
                </p>
              </div>
              <ThemeColorField
                id="color_bg"
                label="Warna latar"
                fallback={DEFAULT_THEME_COLORS.color_bg}
                value={form.color_bg}
                disabled={!canUpdate}
                onChange={(value) => setField('color_bg', value || '')}
              />
              <ThemeColorField
                id="color_surface"
                label="Warna permukaan"
                fallback={DEFAULT_THEME_COLORS.color_surface}
                value={form.color_surface}
                disabled={!canUpdate}
                onChange={(value) => setField('color_surface', value || '')}
              />
              <ThemeColorField
                id="color_ink"
                label="Warna teks"
                fallback={DEFAULT_THEME_COLORS.color_ink}
                value={form.color_ink}
                disabled={!canUpdate}
                onChange={(value) => setField('color_ink', value || '')}
              />
              <ThemeColorField
                id="color_accent"
                label="Warna aksen"
                fallback={DEFAULT_THEME_COLORS.color_accent}
                value={form.color_accent}
                disabled={!canUpdate}
                onChange={(value) => setField('color_accent', value || '')}
              />
              <ThemeColorField
                id="color_accent_soft"
                label="Warna aksen lembut"
                fallback={DEFAULT_THEME_COLORS.color_accent_soft}
                value={form.color_accent_soft}
                disabled={!canUpdate}
                onChange={(value) => setField('color_accent_soft', value || '')}
              />
              <ThemeColorField
                id="color_muted"
                label="Warna teks sekunder"
                fallback={DEFAULT_THEME_COLORS.color_muted}
                value={form.color_muted}
                disabled={!canUpdate}
                onChange={(value) => setField('color_muted', value || '')}
              />
              <ThemeColorField
                id="color_border"
                label="Warna border"
                fallback={DEFAULT_THEME_COLORS.color_border}
                value={form.color_border}
                disabled={!canUpdate}
                onChange={(value) => setField('color_border', value || '')}
              />
              <ThemeColorField
                id="theme_color"
                label="Theme color (browser)"
                hint="Warna bilah status / UI browser mobile."
                fallback={DEFAULT_THEME_COLORS.theme_color}
                value={form.theme_color}
                disabled={!canUpdate}
                onChange={(value) => setField('theme_color', value || '')}
              />
            </div>
          </div>

          <div
            role="tabpanel"
            id={`${tabsId}-panel-operasional`}
            aria-labelledby={`${tabsId}-operasional`}
            hidden={tab !== 'operasional' || !can('konfig.operasional.view')}
          >
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="maintenance_mode">Maintenance mode</label>
                <SearchableSelect
                  id="maintenance_mode"
                  value={form.maintenance_mode ? '1' : '0'}
                  onChange={(next) => setField('maintenance_mode', next === '1')}
                  options={[
                    { value: '0', label: 'Tidak' },
                    { value: '1', label: 'Ya' },
                  ]}
                />
              </div>
              <div className="field">
                <label htmlFor="is_active">Status</label>
                <SearchableSelect
                  id="is_active"
                  value={form.is_active ? '1' : '0'}
                  onChange={(next) => setField('is_active', next === '1')}
                  options={[
                    { value: '1', label: 'Aktif' },
                    { value: '0', label: 'Nonaktif' },
                  ]}
                />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="maintenance_message">Pesan maintenance</label>
                <textarea
                  id="maintenance_message"
                  rows={2}
                  value={form.maintenance_message || ''}
                  onChange={(e) => setField('maintenance_message', e.target.value)}
                />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <KonfigImageUpload
                  label="Background halaman maintenance"
                  hint="Khusus tampilan /maintenance. Kosongkan untuk memakai background tema umum."
                  asset="maintenance-background"
                  savedPath={form.path_maintenance_background}
                  pendingFile={pendingAssets['maintenance-background']}
                  markedForDelete={pendingAssetDeletes['maintenance-background']}
                  disabled={!canUpdate}
                  onFileSelected={(file) => setPendingAsset('maintenance-background', file)}
                  onMarkDelete={() => setPendingAssetDelete('maintenance-background', true)}
                  onCancelDelete={() => setPendingAssetDelete('maintenance-background', false)}
                />
              </div>
              <div className="field">
                <label htmlFor="maintenance_background_style">Style background maintenance</label>
                <select
                  id="maintenance_background_style"
                  value={form.maintenance_background_style ?? DEFAULT_BACKGROUND_STYLE}
                  disabled={!canUpdate || !hasMaintenanceBackgroundAsset}
                  onChange={(event) => setField('maintenance_background_style', event.target.value)}
                >
                  {BACKGROUND_STYLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {(form.maintenance_background_style ?? DEFAULT_BACKGROUND_STYLE) === 'repeat' && (
                <div className="field">
                  <label htmlFor="maintenance_background_repeat_size">Ukuran tile repeat</label>
                  <select
                    id="maintenance_background_repeat_size"
                    value={form.maintenance_background_repeat_size ?? DEFAULT_BACKGROUND_REPEAT_SIZE}
                    disabled={!canUpdate || !hasMaintenanceBackgroundAsset}
                    onChange={(event) => setField('maintenance_background_repeat_size', event.target.value)}
                  >
                    {BACKGROUND_REPEAT_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="additional_data">Additional data</label>
                <textarea
                  id="additional_data"
                  rows={3}
                  value={form.additional_data || ''}
                  onChange={(e) => setField('additional_data', e.target.value)}
                />
              </div>
            </div>
          </div>
        </fieldset>
        )}

        {canUpdate && visibleTabs.length > 0 && (
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan semua'}
            </button>
          </div>
        )}
      </form>
    </>
  )
}
