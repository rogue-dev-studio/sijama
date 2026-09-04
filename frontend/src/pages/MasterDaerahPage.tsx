/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterDaerahService, masterPusatService } from '../api/services'
import type { Daerah } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

async function loadPusatOptions() {
  const result = await masterPusatService.list({ per_page: 100 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Pusat',
  paramKey: 'wilayah_fung_pusat_id',
  loadOptions: loadPusatOptions,
}

const columns: GatedColumn<Daerah>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'wilayah_fung_pusat',
    label: 'Pusat',
    cell: (item) => item.wilayah_fung_pusat?.nama || '—',
    exportValue: (item) => item.wilayah_fung_pusat?.nama || '',
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

export function MasterDaerahPage() {
  return (
    <SimpleMasterListPage<Daerah>
      title="Master Daerah"
      description="Kelola wilayah daerah per pusat dalam hierarki SIJAMA."
      entityLabel="daerah"
      basePath="/master/wilayah-fung/daerah"
      permissionPrefix="wilayah_fung_daerah"
      createLabel="Tambah daerah"
      searchPlaceholder="Cari kode atau nama daerah…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={masterDaerahService.list}
      remove={masterDaerahService.remove}
      parentFilter={parentFilter}
      columns={columns}
    />
  )
}
