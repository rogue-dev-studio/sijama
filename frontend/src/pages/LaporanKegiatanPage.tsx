/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:40:00
 */

import { useEffect, useState } from 'react'
import { laporanService, masterKategoriKegiatanService } from '../api/services'
import type { KategoriKegiatan, Kegiatan } from '../api/types'
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

const PREFIX = 'laporan_kegiatan'

function statusLabel(status: string) {
  if (status === 'planned') return 'Direncanakan'
  if (status === 'ongoing') return 'Berlangsung'
  if (status === 'completed') return 'Selesai'
  if (status === 'cancelled') return 'Dibatalkan'
  return status
}

function formatWaktu(item: Kegiatan): string {
  const parts: string[] = []
  if (item.jam_mulai) parts.push(item.jam_mulai.slice(0, 5))
  if (item.jam_selesai) parts.push(item.jam_selesai.slice(0, 5))
  if (parts.length === 0) return '—'
  return parts.join(' – ')
}

const COLUMNS: GatedColumn<Kegiatan>[] = [
  {
    key: 'judul',
    label: 'Judul',
    sortKey: 'judul',
    cell: (item) => item.judul,
    exportValue: (item) => item.judul,
  },
  {
    key: 'kategori',
    label: 'Kategori',
    sortKey: 'kategori_kegiatan_id',
    cell: (item) => item.kategori_kegiatan?.nama || item.jenis || '—',
    exportValue: (item) => item.kategori_kegiatan?.nama || item.jenis || '—',
  },
  {
    key: 'pemateri',
    label: 'Pemateri',
    sortKey: 'pemateri',
    cell: (item) => item.pemateri || item.pemateri_ref?.nama || '—',
    exportValue: (item) => item.pemateri || item.pemateri_ref?.nama || '—',
  },
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'jam_mulai',
    cell: (item) => formatWaktu(item),
    exportValue: (item) => formatWaktu(item),
  },
  {
    key: 'lokasi',
    label: 'Lokasi',
    sortKey: 'lokasi',
    cell: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
    exportValue: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
  },
  {
    key: 'tanggal',
    label: 'Tanggal',
    sortKey: 'tanggal',
    cell: (item) => new Date(item.tanggal).toLocaleDateString('id-ID'),
    exportValue: (item) => new Date(item.tanggal).toLocaleDateString('id-ID'),
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => statusLabel(item.status),
    exportValue: (item) => statusLabel(item.status),
  },
]

export function LaporanKegiatanPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [kategoriOptions, setKategoriOptions] = useState<KategoriKegiatan[]>([])
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)

  useEffect(() => {
    let active = true
    void masterKategoriKegiatanService.list({ active_only: true, per_page: 100 }).then((result) => {
      if (active) setKategoriOptions(result.items)
    })
    return () => {
      active = false
    }
  }, [])

  function clearExtraFilters() {
    const today = todayIsoDate()
    setStatusFilter('')
    setKategoriFilter('')
    setDateFrom(today)
    setDateTo(today)
  }

  const hasExtraFilters =
    statusFilter !== '' || kategoriFilter !== '' || !isDefaultDateRange(dateFrom, dateTo)

  const exportTitle = [
    'Laporan Kegiatan',
    dateFrom || dateTo ? `(${dateFrom || '…'} s/d ${dateTo || '…'})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <SimpleMasterListPage<Kegiatan>
      title="Laporan Kegiatan"
      description="Rekap agenda kegiatan per periode dan status."
      entityLabel="laporan kegiatan"
      basePath="/laporan/kegiatan"
      permissionPrefix={PREFIX}
      createLabel=""
      dokumenKey="laporan_kegiatan"
      searchPlaceholder="Cari judul kegiatan…"
      defaultSortBy="tanggal"
      defaultSortDir="desc"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      hideCreateButton
      showActionsColumn={false}
      itemLabel={(item) => item.judul}
      extraFilterParams={{
        status: statusFilter || undefined,
        kategori_kegiatan_id: kategoriFilter ? Number(kategoriFilter) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }}
      hasExtraFilters={hasExtraFilters}
      onClearExtraFilters={clearExtraFilters}
      filterPrimary={[
        ...dateRangeFilterFields({
          fromId: 'lap-kegiatan-from',
          toId: 'lap-kegiatan-to',
          dateFrom,
          dateTo,
          onDateFromChange: setDateFrom,
          onDateToChange: setDateTo,
        }),
        <div className="field" key="kategori">
          <label htmlFor="lap-kegiatan-kategori">Kategori</label>
          <SearchableSelect
            id="lap-kegiatan-kategori"
            value={kategoriFilter}
            onChange={setKategoriFilter}
            options={[
              { value: '', label: 'Semua' },
              ...kategoriOptions.map((item) => ({
                value: String(item.id),
                label: item.nama,
              })),
            ]}
          />
        </div>,
        <div className="field" key="status">
          <label htmlFor="lap-kegiatan-status">Status</label>
          <SearchableSelect
            id="lap-kegiatan-status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: 'planned', label: 'Direncanakan' },
              { value: 'ongoing', label: 'Berlangsung' },
              { value: 'completed', label: 'Selesai' },
              { value: 'cancelled', label: 'Dibatalkan' },
            ]}
          />
        </div>,
      ]}
      getExportPayload={(items, meta) => ({
        title: exportTitle,
        headers: ['No', ...COLUMNS.map((column) => column.label)],
        columnKeys: ['no', ...COLUMNS.map((column) => column.key)],
        rows: items.map((item, index) => [
          rowNumber(meta, index),
          ...COLUMNS.map((column) => column.exportValue(item)),
        ]),
      })}
      list={(params: MasterListParams) => laporanService.kegiatan(params)}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
    />
  )
}
