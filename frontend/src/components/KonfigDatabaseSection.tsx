/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:20:00
 */

import { useState } from 'react'
import { ApiError } from '../api/client'
import { aplikasiKonfigService } from '../api/services'
import type { KonfigSystemInput } from '../api/types'
import { IntegrationValidityField } from './IntegrationValidityField'
import { SearchableSelect } from './SearchableSelect'
import { useToast } from './ToastProvider'
import { DB_DRIVER_OPTIONS, formatOccurredAt } from '../lib/integrationMeta'

type Props = {
  form: KonfigSystemInput
  setField: <K extends keyof KonfigSystemInput>(key: K, value: KonfigSystemInput[K]) => void
  canUpdate: boolean
  dbLastCheckedAt: string | null
  dbLastCheckStatus: string | null
  dbLastCheckMessage: string | null
  onDbCheckMeta: (meta: {
    at: string | null
    status: string | null
    message: string | null
  }) => void
}

export function KonfigDatabaseSection({
  form,
  setField,
  canUpdate,
  dbLastCheckedAt,
  dbLastCheckStatus,
  dbLastCheckMessage,
  onDbCheckMeta,
}: Props) {
  const { pushToast } = useToast()
  const [checking, setChecking] = useState(false)

  async function handleCheck() {
    setChecking(true)
    try {
      const result = await aplikasiKonfigService.checkIntegration('database')
      onDbCheckMeta({
        at: new Date().toISOString(),
        status: result.status,
        message: result.message,
      })
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
      setChecking(false)
    }
  }

  return (
    <>
      <h3 className="form-section-title form-section-title--first">Konfigurasi database</h3>
      <p className="field-hint field-hint--block">
        Metadata koneksi (driver, host, plan, masa berlaku). Kredensial tetap di environment aplikasi —
        tidak disimpan di sini.
      </p>
      <div className="form-grid form-grid--2">
        <div className="field">
          <label htmlFor="db_enabled">Status catatan DB</label>
          <SearchableSelect
            id="db_enabled"
            value={form.db_enabled ? '1' : '0'}
            onChange={(next) => setField('db_enabled', next === '1')}
            options={[
              { value: '0', label: 'Nonaktif / tidak dipakai' },
              { value: '1', label: 'Aktif' },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="db_driver">Driver</label>
          <SearchableSelect
            id="db_driver"
            value={form.db_driver || 'pgsql'}
            onChange={(next) => setField('db_driver', next)}
            options={DB_DRIVER_OPTIONS}
          />
        </div>
        <IntegrationValidityField
          id="db_valid_until"
          value={form.db_valid_until || ''}
          onChange={(next) => setField('db_valid_until', next || null)}
          disabled={!canUpdate}
        />
        <div className="field">
          <label htmlFor="db_project">Label / project</label>
          <input
            id="db_project"
            value={form.db_project || ''}
            onChange={(e) => setField('db_project', e.target.value)}
            placeholder="Nama project / label layanan"
          />
        </div>
        <div className="field">
          <label htmlFor="db_service_name">Service name</label>
          <input
            id="db_service_name"
            value={form.db_service_name || ''}
            onChange={(e) => setField('db_service_name', e.target.value)}
            placeholder="Opsional"
          />
        </div>
        <div className="field">
          <label htmlFor="db_plan">Plan / paket</label>
          <input
            id="db_plan"
            value={form.db_plan || ''}
            onChange={(e) => setField('db_plan', e.target.value)}
            placeholder="Free / Startup / Dedicated / …"
          />
        </div>
        <div className="field">
          <label htmlFor="db_region">Region</label>
          <input
            id="db_region"
            value={form.db_region || ''}
            onChange={(e) => setField('db_region', e.target.value)}
            placeholder="Opsional"
          />
        </div>
        <div className="field">
          <label htmlFor="db_host">Host</label>
          <input
            id="db_host"
            value={form.db_host || ''}
            onChange={(e) => setField('db_host', e.target.value)}
            placeholder="db.example.com"
          />
        </div>
        <div className="field">
          <label htmlFor="db_port">Port</label>
          <input
            id="db_port"
            type="number"
            value={form.db_port ?? ''}
            onChange={(e) =>
              setField('db_port', e.target.value === '' ? null : Number(e.target.value))
            }
            placeholder="5432"
          />
        </div>
        <div className="field">
          <label htmlFor="db_database">Nama database</label>
          <input
            id="db_database"
            value={form.db_database || ''}
            onChange={(e) => setField('db_database', e.target.value)}
            placeholder="sijama"
          />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="db_notes">Catatan</label>
          <textarea
            id="db_notes"
            rows={2}
            value={form.db_notes || ''}
            onChange={(e) => setField('db_notes', e.target.value)}
            placeholder="Mis. masa trial, reminder perpanjang, vendor, dll."
          />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={!canUpdate || checking}
            onClick={() => void handleCheck()}
          >
            {checking ? 'Mengecek…' : 'Cek koneksi database aktif'}
          </button>
          <p className="field-hint">
            Cek terakhir:{' '}
            {dbLastCheckedAt
              ? `${formatOccurredAt(dbLastCheckedAt)} · ${dbLastCheckStatus || '—'} · ${
                  dbLastCheckMessage || ''
                }`
              : 'Belum pernah dicek'}
          </p>
          <p className="field-hint">
            Riwayat lengkap ada di menu Aplikasi → Log → Log Database.
          </p>
        </div>
      </div>
    </>
  )
}
