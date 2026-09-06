/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:40:00
 */

import { useEffect, useState } from 'react'
import { kegiatanService, masterKategoriKegiatanService } from '../api/services'
import type { KategoriKegiatan, Kegiatan } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { SearchableSelect } from '../components/SearchableSelect'
import { PermissionLink } from '../components/PermissionLink'
import { listButtonAccess } from '../lib/listUiAccess'
import {
  addDaysIsoDate,
  dateRangeFilterFields,
  isDefaultUpcomingDateRange,
  todayIsoDate,
} from '../lib/dateRangeFilters'

const PREFIX = 'kegiatan'
const DEFAULT_RANGE_DAYS = 90

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
    key: 'materi',
    label: 'Materi',
    sortable: false,
    cell: (item) => item.materi_list?.map((m) => m.nama).join(', ') || '—',
    exportValue: (item) => item.materi_list?.map((m) => m.nama).join(', ') || '—',
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
    cell: (item) => item.status,
    exportValue: (item) => item.status,
  },
]

export function KegiatanPage() {
  const { can } = useAuth()
  const [statusFilter, setStatusFilter] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [kategoriOptions, setKategoriOptions] = useState<KategoriKegiatan[]>([])
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(() => addDaysIsoDate(DEFAULT_RANGE_DAYS))

  const createAccess = listButtonAccess(can, PREFIX, 'create')

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
    setStatusFilter('')
    setKategoriFilter('')
    setDateFrom(todayIsoDate())
    setDateTo(addDaysIsoDate(DEFAULT_RANGE_DAYS))
  }

  const hasExtraFilters =
    statusFilter !== '' ||
    kategoriFilter !== '' ||
    !isDefaultUpcomingDateRange(dateFrom, dateTo, DEFAULT_RANGE_DAYS)

  return (
    <SimpleMasterListPage<Kegiatan>
      title="Kegiatan"
      description="Agenda kegiatan jamaah dan masjid. Default menampilkan 90 hari ke depan (termasuk hasil jadwal rutin)."
      entityLabel="kegiatan"
      basePath="/kegiatan"
      permissionPrefix={PREFIX}
      createLabel="Tambah kegiatan"
      dokumenKey="kegiatan"
      searchPlaceholder="Cari judul atau jenis…"
      defaultSortBy="tanggal"
      defaultSortDir="desc"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
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
          fromId: 'filter_date_from',
          toId: 'filter_date_to',
          dateFrom,
          dateTo,
          onDateFromChange: setDateFrom,
          onDateToChange: setDateTo,
        }),
        <div className="field" key="kategori">
          <label htmlFor="filter_kategori">Kategori</label>
          <SearchableSelect
            id="filter_kategori"
            value={kategoriFilter}
            onChange={setKategoriFilter}
            placeholder="Semua"
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
          <label htmlFor="filter_status">Status</label>
          <SearchableSelect
            id="filter_status"
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Semua"
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
      headerActions={
        createAccess.visible ? (
          <PermissionLink
            to="/kegiatan/jadwal-rutin"
            enabled={createAccess.enabled}
            className="btn btn--ghost"
          >
            Jadwal Rutin
          </PermissionLink>
        ) : null
      }
      list={(params: MasterListParams) => kegiatanService.list(params)}
      remove={(id) => kegiatanService.remove(id)}
    />
  )
}
