/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:10:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:10:53
 */

import { useEffect, useState } from 'react'
import { auditActivityService } from '../api/services'
import type { AuditActivityRow } from '../api/types'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { SearchableSelect } from '../components/SearchableSelect'
import { rowNumber } from '../components/Pagination'
import {
  dateRangeFilterFields,
  isDefaultDateRange,
  todayIsoDate,
} from '../lib/dateRangeFilters'

type AuditModule = 'access' | 'konfig' | 'jamaah'

type Props = {
  module: AuditModule
  title: string
  description: string
  permissionPrefix: string
  basePath: string
  dokumenKey: string
  actionOptions: { value: string; label: string }[]
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function truncate(value?: string | null, max = 90) {
  if (!value) return '—'
  return value.length > max ? `${value.slice(0, max)}…` : value
}

export function AuditActivityPage({
  module,
  title,
  description,
  permissionPrefix,
  basePath,
  dokumenKey,
  actionOptions,
}: Props) {
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)
  const [actionFilter, setActionFilter] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AuditActivityRow | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null)
      setDetailError(null)
      return
    }

    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)

    auditActivityService
      .show(module, selectedId)
      .then((row) => {
        if (!cancelled) setDetail(row)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setDetail(null)
          setDetailError(error instanceof Error ? error.message : 'Gagal memuat detail audit.')
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [module, selectedId])

  function clearExtraFilters() {
    const today = todayIsoDate()
    setDateFrom(today)
    setDateTo(today)
    setActionFilter('')
  }

  const hasExtraFilters = !isDefaultDateRange(dateFrom, dateTo) || actionFilter !== ''

  const COLUMNS: GatedColumn<AuditActivityRow>[] = [
    {
      key: 'waktu',
      label: 'Waktu',
      sortKey: 'occurred_at',
      cell: (item) => formatDateTime(item.occurred_at),
      exportValue: (item) => formatDateTime(item.occurred_at),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      sortKey: 'action',
      cell: (item) => item.action,
      exportValue: (item) => item.action,
    },
    {
      key: 'entitas',
      label: 'Entitas',
      sortKey: 'entity_label',
      cell: (item) => item.entity_label || `${item.entity_type}${item.entity_id ? ` #${item.entity_id}` : ''}`,
      exportValue: (item) =>
        item.entity_label || `${item.entity_type}${item.entity_id ? ` #${item.entity_id}` : ''}`,
    },
    {
      key: 'ringkasan',
      label: 'Ringkasan',
      sortable: false,
      cell: (item) => truncate(item.summary),
      exportValue: (item) => item.summary,
    },
    {
      key: 'aktor',
      label: 'Aktor',
      sortKey: 'actor_username',
      cell: (item) => item.actor_name || item.actor_username || '—',
      exportValue: (item) => item.actor_name || item.actor_username || '—',
    },
    {
      key: 'detail',
      label: 'Detail',
      sortable: false,
      cell: (item) => (
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => setSelectedId(item.id)}
        >
          Lihat
        </button>
      ),
      exportValue: () => '',
    },
  ]

  return (
    <>
      <SimpleMasterListPage<AuditActivityRow>
        title={title}
        description={description}
        entityLabel="audit"
        basePath={basePath}
        permissionPrefix={permissionPrefix}
        createLabel=""
        dokumenKey={dokumenKey}
        searchPlaceholder="Cari ringkasan / aktor / entitas…"
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
          action: actionFilter || undefined,
        }}
        hasExtraFilters={hasExtraFilters}
        onClearExtraFilters={clearExtraFilters}
        filterPrimary={[
          ...dateRangeFilterFields({
            fromId: `${module}-audit-from`,
            toId: `${module}-audit-to`,
            dateFrom,
            dateTo,
            onDateFromChange: setDateFrom,
            onDateToChange: setDateTo,
          }),
          <div className="field" key="action">
            <label htmlFor={`${module}-audit-action`}>Aksi</label>
            <SearchableSelect
              id={`${module}-audit-action`}
              value={actionFilter}
              onChange={setActionFilter}
              options={[{ value: '', label: 'Semua' }, ...actionOptions]}
            />
          </div>,
        ]}
        getExportPayload={(items, meta) => ({
          title,
          headers: ['No', ...COLUMNS.filter((c) => c.key !== 'detail').map((c) => c.label)],
          columnKeys: ['no', ...COLUMNS.filter((c) => c.key !== 'detail').map((c) => c.key)],
          rows: items.map((item, index) => [
            rowNumber(meta, index),
            ...COLUMNS.filter((c) => c.key !== 'detail').map((column) => column.exportValue(item)),
          ]),
        })}
        list={(params: MasterListParams) => auditActivityService.list(module, params)}
        remove={async () => Promise.resolve()}
        canDeleteItem={() => false}
      />

      {selectedId !== null && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setSelectedId(null)}>
          <div
            className="app-confirm__panel app-error-detail__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${module}-audit-detail-title`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="app-error-detail__header">
              <h2 id={`${module}-audit-detail-title`} className="app-confirm__title">
                Detail Audit #{selectedId}
              </h2>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => setSelectedId(null)}
              >
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
                    <strong>Aksi:</strong> {detail.action}
                  </p>
                  <p>
                    <strong>Entitas:</strong>{' '}
                    {detail.entity_label ||
                      `${detail.entity_type}${detail.entity_id ? ` #${detail.entity_id}` : ''}`}
                  </p>
                  <p>
                    <strong>Aktor:</strong> {detail.actor_name || detail.actor_username || '—'}
                  </p>
                  <p>
                    <strong>IP:</strong> {detail.ip_address || '—'}
                  </p>
                  <p>
                    <strong>Ringkasan:</strong> {detail.summary}
                  </p>
                  <div>
                    <strong>Meta</strong>
                    <pre className="app-error-detail__trace">
                      {detail.meta ? JSON.stringify(detail.meta, null, 2) : '—'}
                    </pre>
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

export function AuditAksesPage() {
  return (
    <AuditActivityPage
      module="access"
      title="Audit Akses"
      description="Jejak matriks hak akses, pengguna, dan perubahan password."
      permissionPrefix="audit_access"
      basePath="/aplikasi/audit/akses"
      dokumenKey="audit_access"
      actionOptions={[
        { value: 'matriks_sync', label: 'Matriks sync' },
        { value: 'user_create', label: 'User create' },
        { value: 'user_update', label: 'User update' },
        { value: 'user_update_password', label: 'User password' },
        { value: 'user_deactivate', label: 'User deactivate' },
        { value: 'password_change_self', label: 'Password sendiri' },
      ]}
    />
  )
}

export function AuditKonfigPage() {
  return (
    <AuditActivityPage
      module="konfig"
      title="Audit Konfigurasi"
      description="Jejak perubahan konfigurasi sistem, dokumen, aset, dan sinkron hari libur."
      permissionPrefix="audit_konfig"
      basePath="/aplikasi/audit/konfig"
      dokumenKey="audit_konfig"
      actionOptions={[
        { value: 'konfig_system_update', label: 'Sistem update' },
        { value: 'konfig_system_upload_asset', label: 'Sistem upload aset' },
        { value: 'konfig_system_delete_asset', label: 'Sistem hapus aset' },
        { value: 'konfig_dokumen_create', label: 'Dokumen create' },
        { value: 'konfig_dokumen_update', label: 'Dokumen update' },
        { value: 'konfig_dokumen_upload_asset', label: 'Dokumen upload aset' },
        { value: 'konfig_dokumen_delete_asset', label: 'Dokumen hapus aset' },
        { value: 'hari_libur_sync', label: 'Sync hari libur' },
      ]}
    />
  )
}

export function AuditJamaahPage() {
  return (
    <AuditActivityPage
      module="jamaah"
      title="Audit Jamaah"
      description="Jejak ubah/hapus data jamaah serta enroll/reset wajah (tanpa menyimpan descriptor)."
      permissionPrefix="audit_jamaah"
      basePath="/aplikasi/audit/jamaah"
      dokumenKey="audit_jamaah"
      actionOptions={[
        { value: 'jamaah_create', label: 'Create' },
        { value: 'jamaah_update', label: 'Update' },
        { value: 'jamaah_delete', label: 'Delete' },
        { value: 'face_enroll', label: 'Face enroll' },
        { value: 'face_reset', label: 'Face reset' },
      ]}
    />
  )
}
