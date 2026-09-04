/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:20:00
 */

import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { aplikasiKonfigService } from '../api/services'
import type { IntegrationLogRow } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { rowNumber } from '../components/Pagination'
import {
  dateRangeFilterFields,
  isDefaultDateRange,
  todayIsoDate,
} from '../lib/dateRangeFilters'
import {
  INTEGRATION_EVENT_TYPES,
  formatOccurredAt,
  type IntegrationProvider,
} from '../lib/integrationMeta'

type Props = {
  provider: IntegrationProvider
  title: string
  description: string
  permissionPrefix: string
  basePath: string
}

function truncate(value?: string | null, max = 80) {
  if (!value) return '—'
  return value.length > max ? `${value.slice(0, max)}…` : value
}

export function IntegrationLogPage({
  provider,
  title,
  description,
  permissionPrefix,
  basePath,
}: Props) {
  const { can } = useAuth()
  const { pushToast } = useToast()
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)
  const [levelFilter, setLevelFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<IntegrationLogRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [listKey, setListKey] = useState(0)
  const [checking, setChecking] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteEvent, setNoteEvent] = useState('maintenance')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteMessage, setNoteMessage] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  const canCheck = can(`${permissionPrefix}.check`) || can('konfig.update')
  const canNote = can(`${permissionPrefix}.note`) || can('konfig.update')

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null)
      setDetailError(null)
      return
    }

    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)

    aplikasiKonfigService
      .showIntegrationLog(selectedId)
      .then((row) => {
        if (!cancelled) setDetail(row)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDetail(null)
          setDetailError(error instanceof Error ? error.message : 'Gagal memuat detail log.')
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedId])

  function clearExtraFilters() {
    const today = todayIsoDate()
    setDateFrom(today)
    setDateTo(today)
    setLevelFilter('')
    setEventFilter('')
  }

  const hasExtraFilters =
    !isDefaultDateRange(dateFrom, dateTo) || levelFilter !== '' || eventFilter !== ''

  const columns: GatedColumn<IntegrationLogRow>[] = useMemo(
    () => [
      {
        key: 'waktu',
        label: 'Waktu',
        sortKey: 'occurred_at',
        cell: (item) => formatOccurredAt(item.occurred_at),
        exportValue: (item) => formatOccurredAt(item.occurred_at),
      },
      {
        key: 'level',
        label: 'Level',
        sortKey: 'level',
        cell: (item) => item.level,
        exportValue: (item) => item.level,
      },
      {
        key: 'event',
        label: 'Event',
        sortKey: 'event_type',
        cell: (item) => item.event_type,
        exportValue: (item) => item.event_type,
      },
      {
        key: 'judul',
        label: 'Judul',
        sortKey: 'title',
        cell: (item) => truncate(item.title, 48),
        exportValue: (item) => item.title,
      },
      {
        key: 'pesan',
        label: 'Pesan',
        sortable: false,
        cell: (item) => truncate(item.message, 72),
        exportValue: (item) => item.message,
      },
      {
        key: 'aktor',
        label: 'Aktor',
        sortable: false,
        cell: (item) => item.creator?.name || item.creator?.username || 'Sistem',
        exportValue: (item) => item.creator?.name || item.creator?.username || 'Sistem',
      },
      {
        key: 'detail',
        label: 'Detail',
        sortable: false,
        cell: (item) => (
          <button type="button" className="btn btn--secondary btn--small" onClick={() => setSelectedId(item.id)}>
            Lihat
          </button>
        ),
        exportValue: () => '',
      },
    ],
    [],
  )

  async function handleCheck() {
    setChecking(true)
    try {
      const result = await aplikasiKonfigService.checkIntegration(provider)
      pushToast({
        tone: result.ok ? 'success' : 'error',
        title: result.ok ? 'Koneksi OK' : 'Gangguan koneksi',
        detail: result.message,
      })
      setListKey((value) => value + 1)
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

  async function handleSaveNote() {
    if (!noteTitle.trim() || !noteMessage.trim()) {
      pushToast({ tone: 'error', title: 'Validasi', message: 'Judul dan pesan wajib diisi' })
      return
    }
    setNoteSaving(true)
    try {
      await aplikasiKonfigService.createIntegrationLog({
        provider,
        level: noteEvent === 'maintenance' ? 'warning' : 'error',
        event_type: noteEvent,
        title: noteTitle.trim(),
        message: noteMessage.trim(),
      })
      setNoteTitle('')
      setNoteMessage('')
      setNoteOpen(false)
      pushToast({ tone: 'success', title: 'Log dicatat' })
      setListKey((value) => value + 1)
    } catch (err) {
      pushToast({
        tone: 'error',
        title: 'Gagal menyimpan log',
        detail: err instanceof ApiError ? err.message : 'Tidak diketahui',
      })
    } finally {
      setNoteSaving(false)
    }
  }

  return (
    <>
      <SimpleMasterListPage<IntegrationLogRow>
        key={listKey}
        title={title}
        description={description}
        entityLabel="log"
        basePath={basePath}
        permissionPrefix={permissionPrefix}
        createLabel=""
        dokumenKey={permissionPrefix}
        searchPlaceholder="Cari judul / pesan…"
        defaultSortBy="occurred_at"
        defaultSortDir="desc"
        columns={columns}
        showStatusFilter={false}
        showStatusColumn={false}
        hideCreateButton
        showActionsColumn={false}
        extraFilterParams={{
          provider,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          level: levelFilter || undefined,
          event_type: eventFilter || undefined,
        }}
        hasExtraFilters={hasExtraFilters}
        onClearExtraFilters={clearExtraFilters}
        headerActions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {canCheck && (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                disabled={checking}
                onClick={() => void handleCheck()}
              >
                {checking ? 'Mengecek…' : 'Cek koneksi'}
              </button>
            )}
            {canNote && (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => setNoteOpen(true)}
              >
                Catat log
              </button>
            )}
          </div>
        }
        filterPrimary={[
          ...dateRangeFilterFields({
            fromId: `${provider}-log-from`,
            toId: `${provider}-log-to`,
            dateFrom,
            dateTo,
            onDateFromChange: setDateFrom,
            onDateToChange: setDateTo,
          }),
          <div className="field" key="level">
            <label htmlFor={`${provider}-log-level`}>Level</label>
            <SearchableSelect
              id={`${provider}-log-level`}
              value={levelFilter}
              onChange={setLevelFilter}
              options={[
                { value: '', label: 'Semua' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </div>,
        ]}
        filterSecondary={
          <div className="field" key="event">
            <label htmlFor={`${provider}-log-event`}>Event</label>
            <SearchableSelect
              id={`${provider}-log-event`}
              value={eventFilter}
              onChange={setEventFilter}
              options={[{ value: '', label: 'Semua' }, ...INTEGRATION_EVENT_TYPES]}
            />
          </div>
        }
        filterSecondaryActive={eventFilter !== ''}
        getExportPayload={(items, meta) => ({
          title,
          headers: ['No', ...columns.filter((c) => c.key !== 'detail').map((c) => c.label)],
          columnKeys: ['no', ...columns.filter((c) => c.key !== 'detail').map((c) => c.key)],
          rows: items.map((item, index) => [
            rowNumber(meta, index),
            ...columns.filter((c) => c.key !== 'detail').map((column) => column.exportValue(item)),
          ]),
        })}
        list={(params: MasterListParams) =>
          aplikasiKonfigService.listIntegrationLogs({
            ...params,
            provider,
          })
        }
        remove={async () => Promise.resolve()}
        canDeleteItem={() => false}
      />

      {selectedId !== null && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setSelectedId(null)}>
          <div
            className="app-confirm__panel app-error-detail__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${provider}-log-detail-title`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="app-error-detail__header">
              <h2 id={`${provider}-log-detail-title`} className="app-confirm__title">
                Detail Log #{selectedId}
              </h2>
              <button type="button" className="btn btn--secondary btn--small" onClick={() => setSelectedId(null)}>
                Tutup
              </button>
            </div>
            <div className="app-error-detail__body">
              {detailLoading && <p>Memuat…</p>}
              {detailError && <p className="form-error">{detailError}</p>}
              {detail && !detailLoading && (
                <div className="app-error-detail__fields">
                  <p>
                    <strong>Waktu:</strong> {formatOccurredAt(detail.occurred_at)}
                  </p>
                  <p>
                    <strong>Level:</strong> {detail.level}
                  </p>
                  <p>
                    <strong>Event:</strong> {detail.event_type}
                  </p>
                  <p>
                    <strong>Judul:</strong> {detail.title}
                  </p>
                  <p>
                    <strong>Pesan:</strong> {detail.message}
                  </p>
                  <p>
                    <strong>Aktor:</strong> {detail.creator?.name || detail.creator?.username || 'Sistem'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {noteOpen && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setNoteOpen(false)}>
          <div
            className="app-confirm__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${provider}-note-title`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id={`${provider}-note-title`} className="app-confirm__title">
              Catat log {title}
            </h2>
            <div className="form-grid form-grid--1" style={{ marginTop: '0.75rem' }}>
              <div className="field">
                <label htmlFor={`${provider}-note-event`}>Jenis</label>
                <SearchableSelect
                  id={`${provider}-note-event`}
                  value={noteEvent}
                  onChange={setNoteEvent}
                  options={INTEGRATION_EVENT_TYPES}
                />
              </div>
              <div className="field">
                <label htmlFor={`${provider}-note-title-input`}>Judul</label>
                <input
                  id={`${provider}-note-title-input`}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Mis. Maintenance terjadwal"
                />
              </div>
              <div className="field">
                <label htmlFor={`${provider}-note-message`}>Pesan</label>
                <textarea
                  id={`${provider}-note-message`}
                  rows={3}
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="Detail gangguan / jadwal / dampak"
                />
              </div>
            </div>
            <div className="app-confirm__actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn--secondary" onClick={() => setNoteOpen(false)}>
                Batal
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={noteSaving}
                onClick={() => void handleSaveNote()}
              >
                {noteSaving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
