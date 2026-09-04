/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 13:41:46
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:41:46
 */

import { useState } from 'react'
import { auditLoginService } from '../api/services'
import type { AuditLoginRow } from '../api/types'
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

const PREFIX = 'audit_login'

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function eventLabel(event: string) {
  if (event === 'login') return 'Login'
  if (event === 'logout') return 'Logout'
  return event
}

function failureLabel(reason?: string | null) {
  if (!reason) return '—'
  switch (reason) {
    case 'invalid_credentials':
      return 'Kredensial tidak valid'
    case 'user_not_found':
      return 'Pengguna tidak ditemukan'
    case 'inactive':
      return 'Akun tidak aktif'
    case 'maintenance':
      return 'Maintenance'
    default:
      return reason
  }
}

const COLUMNS: GatedColumn<AuditLoginRow>[] = [
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'attempted_at',
    cell: (item) => formatDateTime(item.attempted_at),
    exportValue: (item) => formatDateTime(item.attempted_at),
  },
  {
    key: 'event',
    label: 'Event',
    sortKey: 'event',
    cell: (item) => eventLabel(item.event),
    exportValue: (item) => eventLabel(item.event),
  },
  {
    key: 'hasil',
    label: 'Hasil',
    sortKey: 'success',
    cell: (item) => (item.success ? 'Berhasil' : 'Gagal'),
    exportValue: (item) => (item.success ? 'Berhasil' : 'Gagal'),
  },
  {
    key: 'username',
    label: 'Username',
    sortKey: 'username',
    cell: (item) => item.username || '—',
    exportValue: (item) => item.username || '—',
  },
  {
    key: 'user',
    label: 'Pengguna',
    sortable: false,
    cell: (item) => item.user_name || item.user_username || '—',
    exportValue: (item) => item.user_name || item.user_username || '—',
  },
  {
    key: 'alasan',
    label: 'Alasan',
    sortable: false,
    cell: (item) => failureLabel(item.failure_reason),
    exportValue: (item) => failureLabel(item.failure_reason),
  },
  {
    key: 'ip',
    label: 'IP',
    sortKey: 'ip_address',
    cell: (item) => item.ip_address || '—',
    exportValue: (item) => item.ip_address || '—',
  },
  {
    key: 'perangkat',
    label: 'Perangkat',
    sortable: false,
    cell: (item) => item.device_key || '—',
    exportValue: (item) => item.device_key || '—',
  },
]

export function AuditLoginPage() {
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)
  const [eventFilter, setEventFilter] = useState('')
  const [successFilter, setSuccessFilter] = useState('')

  function clearExtraFilters() {
    const today = todayIsoDate()
    setDateFrom(today)
    setDateTo(today)
    setEventFilter('')
    setSuccessFilter('')
  }

  const hasExtraFilters =
    !isDefaultDateRange(dateFrom, dateTo) || eventFilter !== '' || successFilter !== ''

  const exportTitle = [
    'Audit Login',
    dateFrom || dateTo ? `(${dateFrom || '…'} s/d ${dateTo || '…'})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <SimpleMasterListPage<AuditLoginRow>
      title="Audit Login"
      description="Riwayat percobaan login, logout, dan kegagalan autentikasi."
      entityLabel="audit login"
      basePath="/aplikasi/audit/login"
      permissionPrefix={PREFIX}
      createLabel=""
      dokumenKey="audit_login"
      searchPlaceholder="Cari username / IP…"
      defaultSortBy="attempted_at"
      defaultSortDir="desc"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      hideCreateButton
      showActionsColumn={false}
      extraFilterParams={{
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        event: eventFilter || undefined,
        success: successFilter || undefined,
      }}
      hasExtraFilters={hasExtraFilters}
      onClearExtraFilters={clearExtraFilters}
      filterPrimary={[
        ...dateRangeFilterFields({
          fromId: 'audit-login-from',
          toId: 'audit-login-to',
          dateFrom,
          dateTo,
          onDateFromChange: setDateFrom,
          onDateToChange: setDateTo,
        }),
        <div className="field" key="event">
          <label htmlFor="audit-login-event">Event</label>
          <SearchableSelect
            id="audit-login-event"
            value={eventFilter}
            onChange={setEventFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: 'login', label: 'Login' },
              { value: 'logout', label: 'Logout' },
            ]}
          />
        </div>,
      ]}
      filterSecondary={
        <div className="field">
          <label htmlFor="audit-login-success">Hasil</label>
          <SearchableSelect
            id="audit-login-success"
            value={successFilter}
            onChange={setSuccessFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: '1', label: 'Berhasil' },
              { value: '0', label: 'Gagal' },
            ]}
          />
        </div>
      }
      filterSecondaryActive={successFilter !== ''}
      getExportPayload={(items, meta) => ({
        title: exportTitle,
        headers: ['No', ...COLUMNS.map((column) => column.label)],
        columnKeys: ['no', ...COLUMNS.map((column) => column.key)],
        rows: items.map((item, index) => [
          rowNumber(meta, index),
          ...COLUMNS.map((column) => column.exportValue(item)),
        ]),
      })}
      list={(params: MasterListParams) => auditLoginService.list(params)}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
    />
  )
}
