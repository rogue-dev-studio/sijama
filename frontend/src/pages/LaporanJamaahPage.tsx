/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:35:00
 */

import { useEffect, useState } from 'react'
import { laporanService, masterKelompokService } from '../api/services'
import type { Jamaah, Kelompok } from '../api/types'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { SearchableSelect } from '../components/SearchableSelect'
import { KATEGORI_UMUR_OPTIONS, kategoriUmurLabel } from '../lib/jamaahOptions'

const PREFIX = 'laporan_jamaah'

const COLUMNS: GatedColumn<Jamaah>[] = [
  {
    key: 'nama',
    label: 'Nama',
    sortKey: 'nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'wilayah_fung_kelompok',
    label: 'Kelompok',
    sortKey: 'wilayah_fung_kelompok',
    cell: (item) => item.wilayah_fung_kelompok?.nama || '—',
    exportValue: (item) => item.wilayah_fung_kelompok?.nama || '—',
  },
  {
    key: 'kategori',
    label: 'Kategori',
    sortKey: 'kategori_umur',
    cell: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
    exportValue: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
  },
  {
    key: 'nik',
    label: 'NIK',
    sortKey: 'nik',
    cell: (item) => item.nik || '—',
    exportValue: (item) => item.nik || '—',
  },
  {
    key: 'kontak',
    label: 'Kontak',
    sortKey: 'kontak',
    cell: (item) => [item.no_hp, item.email].filter(Boolean).join(' · ') || '—',
    exportValue: (item) => [item.no_hp, item.email].filter(Boolean).join(' · ') || '—',
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => item.status,
    exportValue: (item) => item.status,
  },
  {
    key: 'wajah',
    label: 'Wajah',
    sortKey: 'face',
    cell: (item) => (item.face_enrolled ? 'Terdaftar' : 'Belum'),
    exportValue: (item) => (item.face_enrolled ? 'Terdaftar' : 'Belum'),
  },
]

export function LaporanJamaahPage() {
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [faceFilter, setFaceFilter] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState(0)
  const [kategoriUmurFilter, setKategoriUmurFilter] = useState('')

  useEffect(() => {
    let active = true
    void masterKelompokService.list({ per_page: 100 }).then((result) => {
      if (active) setKelompokList(result.items)
    })
    return () => {
      active = false
    }
  }, [])

  function clearExtraFilters() {
    setStatusFilter('')
    setFaceFilter('')
    setKelompokFilter(0)
    setKategoriUmurFilter('')
  }

  const hasExtraFilters =
    statusFilter !== '' || faceFilter !== '' || kelompokFilter > 0 || kategoriUmurFilter !== ''

  return (
    <SimpleMasterListPage<Jamaah>
      title="Laporan Jamaah"
      description="Rekap data jamaah menurut kelompok, status, kategori umur, dan enroll wajah."
      entityLabel="laporan jamaah"
      basePath="/laporan/jamaah"
      permissionPrefix={PREFIX}
      createLabel=""
      dokumenKey="laporan_jamaah"
      searchPlaceholder="Cari nama / NIK…"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      hideCreateButton
      showActionsColumn={false}
      extraFilterParams={{
        status: statusFilter || undefined,
        face: faceFilter || undefined,
        wilayah_fung_kelompok_id: kelompokFilter || undefined,
        kategori_umur: kategoriUmurFilter || undefined,
      }}
      hasExtraFilters={hasExtraFilters}
      onClearExtraFilters={clearExtraFilters}
      filterPrimary={[
        <div className="field" key="status">
          <label htmlFor="lap-jamaah-status">Status</label>
          <SearchableSelect
            id="lap-jamaah-status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: 'aktif', label: 'Aktif' },
              { value: 'nonaktif', label: 'Nonaktif' },
            ]}
          />
        </div>,
        <div className="field" key="face">
          <label htmlFor="lap-jamaah-face">Wajah</label>
          <SearchableSelect
            id="lap-jamaah-face"
            value={faceFilter}
            onChange={setFaceFilter}
            options={[
              { value: '', label: 'Semua' },
              { value: 'enrolled', label: 'Terdaftar' },
              { value: 'pending', label: 'Belum' },
            ]}
          />
        </div>,
        <div className="field" key="kelompok">
          <label htmlFor="lap-jamaah-kelompok">Kelompok</label>
          <SearchableSelect
            id="lap-jamaah-kelompok"
            value={kelompokFilter ? String(kelompokFilter) : ''}
            onChange={(next) => setKelompokFilter(Number(next) || 0)}
            options={[
              { value: '', label: 'Semua' },
              ...kelompokList.map((item) => ({ value: String(item.id), label: item.nama })),
            ]}
          />
        </div>,
      ]}
      filterSecondary={
        <div className="field">
          <label htmlFor="lap-jamaah-umur">Kategori umur</label>
          <SearchableSelect
            id="lap-jamaah-umur"
            value={kategoriUmurFilter}
            onChange={setKategoriUmurFilter}
            options={[
              { value: '', label: 'Semua' },
              ...KATEGORI_UMUR_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
            ]}
          />
        </div>
      }
      filterSecondaryActive={kategoriUmurFilter !== ''}
      list={(params: MasterListParams) => laporanService.jamaah(params)}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
    />
  )
}
