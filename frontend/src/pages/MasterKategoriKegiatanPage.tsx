/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterKategoriKegiatanService } from '../api/services'
import type { KategoriKegiatan } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<KategoriKegiatan>[] = [
  {
    key: 'nama',
    label: 'Nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'calendar_color',
    label: 'Warna',
    sortable: false,
    cell: (item) => (
      <span className="calendar-legend__item">
        <span
          className="calendar-legend__swatch"
          style={{ backgroundColor: item.calendar_color || '#2563eb' }}
        />
        {item.calendar_color || '#2563eb'}
      </span>
    ),
    exportValue: (item) => item.calendar_color || '#2563eb',
  },
  {
    key: 'deskripsi',
    label: 'Deskripsi',
    cell: (item) => item.deskripsi || '—',
    exportValue: (item) => item.deskripsi || '',
  },
  {
    key: 'is_active',
    label: 'Status',
    cell: (item) => (
      <span className={`badge ${item.is_active !== false ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
    exportValue: (item) => (item.is_active !== false ? 'Aktif' : 'Nonaktif'),
  },
]

export function MasterKategoriKegiatanPage() {
  return (
    <SimpleMasterListPage<KategoriKegiatan>
      title="Master Kategori Kegiatan"
      description="Kelola kategori kegiatan dan warna tampilan di kalender."
      entityLabel="kategori kegiatan"
      basePath="/master/kategori-kegiatan"
      permissionPrefix="kategori_kegiatan"
      createLabel="Tambah kategori"
      list={masterKategoriKegiatanService.list}
      remove={masterKategoriKegiatanService.remove}
      columns={columns}
    />
  )
}
