/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:52:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:46:40
 */

import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { appErrorLogService } from '../api/services'
import type { AppErrorLogRow, AppErrorLogStatus } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useConfirm } from '../components/ConfirmDialogProvider'
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

const PREFIX = 'app_error_log'

const STATUS_OPTIONS: Array<{ value: AppErrorLogStatus; label: string }> = [
  { value: 'baru', label: 'Baru' },
  { value: 'dalam_perbaikan', label: 'Dalam perbaikan' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'diabaikan', label: 'Diabaikan' },
]

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function truncate(value?: string | null, max = 80) {
  if (!value) return '—'
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function endpointLabel(item: AppErrorLogRow) {
  if (!item.request_method && !item.request_path) return '—'
  return `${item.request_method || ''} ${item.request_path || ''}`.trim()
}

function statusLabel(status?: string | null) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status || 'Baru'
}

export function AppErrorLogPage() {
  const { can } = useAuth()
  const { confirm } = useConfirm()
  const { notifySuccess, notifyError } = useToast()
  const canClear = can('app_error_log.clear')
  const canUpdate = can('app_error_log.update')

  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)
  const [levelFilter, setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [reloadNonce, setReloadNonce] = useState(0)
  const [clearing, setClearing] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AppErrorLogRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [statusNote, setStatusNote] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null)
      setDetailError(null)
      setStatusNote('')
      return
    }

    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)

    appErrorLogService
      .show(selectedId)
      .then((row) => {
        if (!cancelled) {
          setDetail(row)
          setStatusNote(row.status_note || '')
        }
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
    setStatusFilter('')
  }

  const hasExtraFilters =
    !isDefaultDateRange(dateFrom, dateTo) || levelFilter !== '' || statusFilter !== ''

  async function handleClearLogs() {
    const scopeParts = [
      dateFrom || dateTo ? `tanggal ${dateFrom || '…'} s/d ${dateTo || '…'}` : null,
      levelFilter ? `level ${levelFilter}` : null,
      statusFilter ? `status ${statusLabel(statusFilter)}` : null,
    ].filter(Boolean)
    const scopeText =
      scopeParts.length > 0
        ? `Log yang cocok dengan filter (${scopeParts.join(', ')}) akan dihapus.`
        : 'Semua log error aplikasi akan dihapus.'

    const ok = await confirm({
      title: 'Bersihkan log error',
      message: `${scopeText} Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Ya, bersihkan',
    })
    if (!ok) return

    setClearing(true)
    try {
      const result = await appErrorLogService.clear({
        level: levelFilter || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })
      notifySuccess(
        result.deleted > 0
          ? `Berhasil membersihkan ${result.deleted} log error.`
          : 'Tidak ada log yang dihapus.',
      )
      setSelectedId(null)
      setReloadNonce((n) => n + 1)
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : 'Gagal membersihkan log')
    } finally {
      setClearing(false)
    }
  }

  async function handleUpdateStatus(status: AppErrorLogStatus) {
    if (!detail || !canUpdate) return
    setSavingStatus(true)
    try {
      const updated = await appErrorLogService.updateStatus(detail.id, {
        status,
        status_note: statusNote.trim() || null,
      })
      setDetail(updated)
      setStatusNote(updated.status_note || '')
      notifySuccess('Status log diperbarui.')
      setReloadNonce((n) => n + 1)
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : 'Gagal mengubah status')
    } finally {
      setSavingStatus(false)
    }
  }

  const COLUMNS: GatedColumn<AppErrorLogRow>[] = [
    {
      key: 'waktu',
      label: 'Waktu',
      sortKey: 'occurred_at',
      cell: (item) => formatDateTime(item.occurred_at),
      exportValue: (item) => formatDateTime(item.occurred_at),
    },
    {
      key: 'level',
      label: 'Level',
      sortKey: 'level',
      cell: (item) => item.level,
      exportValue: (item) => item.level,
    },
    {
      key: 'status',
      label: 'Status',
      sortKey: 'status',
      cell: (item) => statusLabel(item.status),
      exportValue: (item) => statusLabel(item.status),
    },
    {
      key: 'exception',
      label: 'Exception',
      sortKey: 'exception_class',
      cell: (item) => truncate(item.exception_class?.split('\\').pop() || item.exception_class, 40),
      exportValue: (item) => item.exception_class,
    },
    {
      key: 'pesan',
      label: 'Pesan',
      sortable: false,
      cell: (item) => truncate(item.message, 72),
      exportValue: (item) => item.message,
    },
    {
      key: 'endpoint',
      label: 'Endpoint',
      sortKey: 'request_path',
      cell: (item) => truncate(endpointLabel(item), 48),
      exportValue: (item) => endpointLabel(item),
    },
    {
      key: 'user',
      label: 'Pengguna',
      sortable: false,
      cell: (item) => item.user_name || item.user_username || '—',
      exportValue: (item) => item.user_name || item.user_username || '—',
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
  ]

  return (
    <>
      <SimpleMasterListPage<AppErrorLogRow>
        title="Error Aplikasi"
        description="Jejak exception runtime untuk tracing bug (bukan kesalahan validasi input)."
        entityLabel="log error"
        basePath="/aplikasi/log/error"
        permissionPrefix={PREFIX}
        createLabel=""
        dokumenKey="app_error_log"
        searchPlaceholder="Cari pesan / exception / endpoint…"
        defaultSortBy="occurred_at"
        defaultSortDir="desc"
        columns={COLUMNS}
        showStatusFilter={false}
        showStatusColumn={false}
        hideCreateButton
        showActionsColumn={false}
        extraFilterParams={{
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          level: levelFilter || undefined,
          status: statusFilter || undefined,
          _reload: reloadNonce || undefined,
        }}
        hasExtraFilters={hasExtraFilters}
        onClearExtraFilters={clearExtraFilters}
        headerActions={
          canClear ? (
            <button
              type="button"
              className="btn btn--secondary btn--small"
              disabled={clearing}
              onClick={() => void handleClearLogs()}
            >
              {clearing ? 'Membersihkan…' : 'Bersihkan log'}
            </button>
          ) : null
        }
        filterPrimary={[
          ...dateRangeFilterFields({
            fromId: 'app-error-from',
            toId: 'app-error-to',
            dateFrom,
            dateTo,
            onDateFromChange: setDateFrom,
            onDateToChange: setDateTo,
          }),
          <div className="field" key="level">
            <label htmlFor="app-error-level">Level</label>
            <SearchableSelect
              id="app-error-level"
              value={levelFilter}
              onChange={setLevelFilter}
              options={[
                { value: '', label: 'Semua' },
                { value: 'error', label: 'Error' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </div>,
          <div className="field" key="status">
            <label htmlFor="app-error-status">Status</label>
            <SearchableSelect
              id="app-error-status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[{ value: '', label: 'Semua' }, ...STATUS_OPTIONS]}
            />
          </div>,
        ]}
        getExportPayload={(items, meta) => ({
          title: 'Log Error Aplikasi',
          headers: ['No', ...COLUMNS.filter((c) => c.key !== 'detail').map((c) => c.label)],
          columnKeys: ['no', ...COLUMNS.filter((c) => c.key !== 'detail').map((c) => c.key)],
          rows: items.map((item, index) => [
            rowNumber(meta, index),
            ...COLUMNS.filter((c) => c.key !== 'detail').map((column) => column.exportValue(item)),
          ]),
        })}
        list={(params: MasterListParams) => {
          const { _reload: _ignored, ...apiParams } = params
          return appErrorLogService.list(apiParams)
        }}
        remove={async () => Promise.resolve()}
        canDeleteItem={() => false}
      />

      {selectedId !== null && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setSelectedId(null)}>
          <div
            className="app-confirm__panel app-error-detail__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-error-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="app-error-detail__header">
              <h2 id="app-error-detail-title" className="app-confirm__title">
                Detail Error #{selectedId}
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
                    <strong>Waktu:</strong> {formatDateTime(detail.occurred_at)}
                  </p>
                  <p>
                    <strong>Level:</strong> {detail.level}
                  </p>
                  <p>
                    <strong>Status:</strong> {statusLabel(detail.status)}
                  </p>
                  <p>
                    <strong>Exception:</strong> {detail.exception_class}
                  </p>
                  <p>
                    <strong>Pesan:</strong> {detail.message}
                  </p>
                  <p>
                    <strong>File:</strong> {detail.file || '—'}
                    {detail.line ? `:${detail.line}` : ''}
                  </p>
                  <p>
                    <strong>Endpoint:</strong> {endpointLabel(detail)}
                  </p>
                  <p>
                    <strong>Pengguna:</strong> {detail.user_name || detail.user_username || '—'}
                  </p>
                  <p>
                    <strong>IP:</strong> {detail.ip_address || '—'}
                  </p>
                  {detail.status_updated_at ? (
                    <p>
                      <strong>Status diubah:</strong>{' '}
                      {formatDateTime(detail.status_updated_at)}
                      {detail.status_updated_by_name || detail.status_updated_by_username
                        ? ` oleh ${detail.status_updated_by_name || detail.status_updated_by_username}`
                        : ''}
                    </p>
                  ) : null}

                  {canUpdate ? (
                    <div className="field" style={{ marginTop: '0.75rem' }}>
                      <label htmlFor="app-error-status-note">Catatan status</label>
                      <textarea
                        id="app-error-status-note"
                        rows={2}
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Opsional"
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={
                              detail.status === option.value
                                ? 'btn btn--primary btn--small'
                                : 'btn btn--secondary btn--small'
                            }
                            disabled={savingStatus}
                            onClick={() => void handleUpdateStatus(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : detail.status_note ? (
                    <p>
                      <strong>Catatan status:</strong> {detail.status_note}
                    </p>
                  ) : null}

                  <div>
                    <strong>Stack trace</strong>
                    <pre className="app-error-detail__trace">{detail.stack_trace || '—'}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
