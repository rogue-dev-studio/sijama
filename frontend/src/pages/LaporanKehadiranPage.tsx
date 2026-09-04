/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:40:00
 */

import { useState } from 'react'
import { laporanService } from '../api/services'
import type { LaporanKehadiranRow } from '../api/types'
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

const PREFIX = 'laporan_kehadiran'

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function methodLabel(method: string) {
  return method === 'face' ? 'Wajah' : method === 'manual' ? 'Manual' : method
}

function typeLabel(type?: string | null) {
  if (type === 'pengajian') return 'Pengajian'
  if (type === 'kegiatan') return 'Kegiatan'
  return type || '—'
}

const COLUMNS: GatedColumn<LaporanKehadiranRow>[] = [
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'recorded_at',
    cell: (item) => formatDateTime(item.recorded_at),
    exportValue: (item) => formatDateTime(item.recorded_at),
  },
  {
    key: 'nama',
    label: 'Nama',
    sortable: false,
    cell: (item) => item.jamaah_nama || `Jamaah #${item.jamaah_id}`,
    exportValue: (item) => item.jamaah_nama || `Jamaah #${item.jamaah_id}`,
  },
  {
    key: 'wilayah_fung_kelompok',
    label: 'Kelompok',
    sortable: false,
    cell: (item) => item.kelompok_nama || '—',
    exportValue: (item) => item.kelompok_nama || '—',
  },
  {
    key: 'sesi',
    label: 'Sesi',
    sortable: false,
    cell: (item) => item.session_title || '—',
    exportValue: (item) => item.session_title || '—',
  },
  {
    key: 'jenis',
    label: 'Jenis',
    sortable: false,
    cell: (item) => typeLabel(item.session_type),
    exportValue: (item) => typeLabel(item.session_type),
  },
  {
    key: 'metode',
    label: 'Metode',
    sortKey: 'method',
    cell: (item) => methodLabel(item.method),
    exportValue: (item) => methodLabel(item.method),
  },
]

export function LaporanKehadiranPage() {
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)
  const [typeFilter, setTypeFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  function clearExtraFilters() {
    const today = todayIsoDate()
    setDateFrom(today)
    setDateTo(today)
    setTypeFilter('')
    setMethodFilter('')
  }

  const hasExtraFilters =
    !isDefaultDateRange(dateFrom, dateTo) || typeFilter !== '' || methodFilter !== ''

  const exportTitle = [
    'Laporan Kehadiran',
    dateFrom || dateTo ? `(${dateFrom || '…'} s/d ${dateTo || '…'})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <SimpleMasterListPage<LaporanKehadiranRow>
      title="Laporan Kehadiran"
      description="Rekap absensi jamaah per periode, jenis sesi, dan metode."
      entityLabel="laporan kehadiran"
      basePath="/laporan/kehadiran"
      permissionPrefix={PREFIX}
      createLabel=""
      dokumenKey="laporan_kehadiran"
      searchPlaceholder="Cari nama jamaah…"
      defaultSortBy="recorded_at"
      defaultSortDir="desc"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      hideCreateButton
      showActionsColumn={false}
      extraFilterParams={{
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        type: typeFilter || undefined,
        method: methodFilter || undefined,
      }}
      hasExtraFilters={hasExtraFilters}
      onClearExtraFilters={clearExtraFilters}
      filterPrimary={[
        ...dateRangeFilterFields({
          fromId: 'lap-hadir-from',
          toId: 'lap-hadir-to',
          dateFrom,
          dateTo,
          onDateFromChange: setDateFrom,
          onDateToChange: setDateTo,
        }),
        <div className="field" key="type">
          <label htmlFor="lap-hadir-type">Jenis sesi</label>
          <SearchableSelect
            id="lap-hadir-type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: 'pengajian', label: 'Pengajian' },
              { value: 'kegiatan', label: 'Kegiatan' },
            ]}
          />
        </div>,
      ]}
      filterSecondary={
        <div className="field">
          <label htmlFor="lap-hadir-method">Metode</label>
          <SearchableSelect
            id="lap-hadir-method"
            value={methodFilter}
            onChange={setMethodFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: 'face', label: 'Wajah' },
              { value: 'manual', label: 'Manual' },
            ]}
          />
        </div>
      }
      filterSecondaryActive={methodFilter !== ''}
      getExportPayload={(items, meta) => ({
        title: exportTitle,
        headers: ['No', ...COLUMNS.map((column) => column.label)],
        columnKeys: ['no', ...COLUMNS.map((column) => column.key)],
        rows: items.map((item, index) => [
          rowNumber(meta, index),
          ...COLUMNS.map((column) => column.exportValue(item)),
        ]),
      })}
      list={(params: MasterListParams) => laporanService.kehadiran(params)}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
    />
  )
}
