/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:51:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:20:00
 */

import { useState } from 'react'
import { ApiError } from '../api/client'
import { aplikasiKonfigService } from '../api/services'
import type { KonfigSystemInput } from '../api/types'
import { IntegrationValidityField } from './IntegrationValidityField'
import { PasswordInput } from './PasswordInput'
import { SearchableSelect } from './SearchableSelect'
import { useToast } from './ToastProvider'

type Props = {
  form: KonfigSystemInput
  setField: <K extends keyof KonfigSystemInput>(key: K, value: KonfigSystemInput[K]) => void
  canUpdate: boolean
  telegramTokenSet: boolean
  n8nApiKeySet: boolean
  apiCoIdKeySet: boolean
  lastHolidaySyncAt: string | null
  lastHolidaySyncCount: number | null
  syncingHolidays: boolean
  submitting: boolean
  onSyncHariLibur: () => void
}

export function KonfigIntegrasiSection({
  form,
  setField,
  canUpdate,
  telegramTokenSet,
  n8nApiKeySet,
  apiCoIdKeySet,
  lastHolidaySyncAt,
  lastHolidaySyncCount,
  syncingHolidays,
  submitting,
  onSyncHariLibur,
}: Props) {
  const { pushToast } = useToast()
  const [checkingProvider, setCheckingProvider] = useState<string | null>(null)

  async function handleCheck(provider: string) {
    setCheckingProvider(provider)
    try {
      const result = await aplikasiKonfigService.checkIntegration(provider)
      pushToast({
        tone: result.ok ? 'success' : 'error',
        title: result.ok ? 'Koneksi OK' : 'Gangguan koneksi',
        detail: result.message,
      })
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Cek koneksi gagal',
        detail: err instanceof ApiError ? err.message : 'Tidak diketahui',
      })
    } finally {
      setCheckingProvider(null)
    }
  }

  return (
    <>
      <h3 className="form-section-title form-section-title--first">Telegram Bot</h3>
      <p className="field-hint field-hint--block">
        Token dari @BotFather. Chat ID dipakai untuk notifikasi default (opsional). Riwayat log di
        Aplikasi → Log → Log Telegram.
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
        <IntegrationValidityField
          id="telegram_valid_until"
          value={form.telegram_valid_until || ''}
          onChange={(next) => setField('telegram_valid_until', next || null)}
          disabled={!canUpdate}
        />
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
        <div className="field">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!canUpdate || checkingProvider === 'telegram'}
            onClick={() => void handleCheck('telegram')}
          >
            {checkingProvider === 'telegram' ? 'Mengecek…' : 'Cek koneksi Telegram'}
          </button>
        </div>
      </div>

      <h3 className="form-section-title form-section-title--after-block">n8n</h3>
      <p className="field-hint field-hint--block">
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
        <IntegrationValidityField
          id="n8n_valid_until"
          value={form.n8n_valid_until || ''}
          onChange={(next) => setField('n8n_valid_until', next || null)}
          disabled={!canUpdate}
        />
        <div className="field">
          <label htmlFor="n8n_base_url">Base URL</label>
          <input
            id="n8n_base_url"
            value={form.n8n_base_url || ''}
            onChange={(e) => setField('n8n_base_url', e.target.value)}
            placeholder="https://n8n.domain.com"
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
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!canUpdate || checkingProvider === 'n8n'}
            onClick={() => void handleCheck('n8n')}
          >
            {checkingProvider === 'n8n' ? 'Mengecek…' : 'Cek koneksi n8n'}
          </button>
        </div>
      </div>

      <h3 className="form-section-title form-section-title--after-block">api.co.id — Hari libur</h3>
      <p className="field-hint field-hint--block">
        Sinkron otomatis hari libur nasional &amp; cuti bersama. Isi masa berlaku API key dari dashboard
        api.co.id.
      </p>
      <div className="form-grid form-grid--2">
        <div className="field">
          <label htmlFor="api_co_id_holiday_enabled">Status sinkron</label>
          <SearchableSelect
            id="api_co_id_holiday_enabled"
            value={form.api_co_id_holiday_enabled ? '1' : '0'}
            onChange={(next) => setField('api_co_id_holiday_enabled', next === '1')}
            options={[
              { value: '0', label: 'Nonaktif' },
              { value: '1', label: 'Aktif' },
            ]}
          />
        </div>
        <IntegrationValidityField
          id="api_co_id_valid_until"
          value={form.api_co_id_valid_until || ''}
          onChange={(next) => setField('api_co_id_valid_until', next || null)}
          disabled={!canUpdate}
        />
        <div className="field">
          <label htmlFor="api_co_id_holiday_base_url">Base URL</label>
          <input
            id="api_co_id_holiday_base_url"
            value={form.api_co_id_holiday_base_url || ''}
            onChange={(e) => setField('api_co_id_holiday_base_url', e.target.value)}
            placeholder="https://use.api.co.id/holidays/indonesia"
          />
        </div>
        <div className="field">
          <label htmlFor="api_co_id_api_key">API key</label>
          <PasswordInput
            id="api_co_id_api_key"
            autoComplete="new-password"
            placeholder={apiCoIdKeySet ? 'Kosongkan jika tidak diubah' : ''}
            value={form.api_co_id_api_key || ''}
            onChange={(e) => setField('api_co_id_api_key', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Sinkron terakhir</label>
          <p className="field-hint field-hint--block">
            {lastHolidaySyncAt
              ? `${new Date(lastHolidaySyncAt).toLocaleString('id-ID')} · ${lastHolidaySyncCount ?? 0} entri`
              : 'Belum pernah disinkronkan'}
          </p>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <div className="inline-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={!canUpdate || submitting || syncingHolidays || !form.api_co_id_holiday_enabled}
              onClick={onSyncHariLibur}
            >
              {syncingHolidays ? 'Menyinkronkan…' : 'Sync hari libur sekarang'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={!canUpdate || checkingProvider === 'api_co_id'}
              onClick={() => void handleCheck('api_co_id')}
            >
              {checkingProvider === 'api_co_id' ? 'Mengecek…' : 'Cek endpoint'}
            </button>
          </div>
        </div>
      </div>

      <h3 className="form-section-title form-section-title--after-block">Masa berlaku SMTP &amp; Fonnte</h3>
      <p className="field-hint field-hint--block">
        Detail SMTP/Fonnte ada di tab Email. Di sini hanya masa berlaku layanan pihak ketiga. Log di
        menu Aplikasi → Log.
      </p>
      <div className="form-grid form-grid--2">
        <IntegrationValidityField
          id="smtp_valid_until"
          label="Masa berlaku SMTP / mail provider"
          value={form.smtp_valid_until || ''}
          onChange={(next) => setField('smtp_valid_until', next || null)}
          disabled={!canUpdate}
        />
        <IntegrationValidityField
          id="fonnte_valid_until"
          label="Masa berlaku Fonnte"
          value={form.fonnte_valid_until || ''}
          onChange={(next) => setField('fonnte_valid_until', next || null)}
          disabled={!canUpdate}
        />
        <div className="field">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!canUpdate || checkingProvider === 'smtp'}
            onClick={() => void handleCheck('smtp')}
          >
            {checkingProvider === 'smtp' ? 'Mengecek…' : 'Cek host SMTP'}
          </button>
        </div>
        <div className="field">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!canUpdate || checkingProvider === 'fonnte'}
            onClick={() => void handleCheck('fonnte')}
          >
            {checkingProvider === 'fonnte' ? 'Mengecek…' : 'Cek endpoint Fonnte'}
          </button>
        </div>
      </div>
    </>
  )
}
