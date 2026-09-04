/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterPusatService } from '../api/services'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'
import type { Pusat } from '../api/types'

const columns: GatedColumn<Pusat>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'nama',
    label: 'Nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
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

export function MasterPusatPage() {
  return (
    <SimpleMasterListPage<Pusat>
      title="Master Pusat"
      description="Kelola wilayah pusat sebagai induk tertinggi hierarki SIJAMA."
      entityLabel="pusat"
      basePath="/master/wilayah-fung/pusat"
      permissionPrefix="wilayah_fung_pusat"
      createLabel="Tambah pusat"
      searchPlaceholder="Cari kode atau nama pusat…"
      showStatusFilter={false}
      list={masterPusatService.list}
      remove={masterPusatService.remove}
      columns={columns}
    />
  )
}
