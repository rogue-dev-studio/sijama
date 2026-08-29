/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 22:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterKelompokService, masterSubKelompokService } from '../api/services'
import type { SubKelompok } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

async function loadKelompokOptions() {
  const result = await masterKelompokService.list({ per_page: 10000 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Kelompok',
  paramKey: 'kelompok_id',
  loadOptions: loadKelompokOptions,
}

const columns: GatedColumn<SubKelompok>[] = [
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

export function MasterSubKelompokPage() {
  return (
    <SimpleMasterListPage<SubKelompok>
      title="Master Sub Kelompok"
      description="Kelola sub kelompok di bawah kelompok."
      entityLabel="sub kelompok"
      basePath="/master/sub-kelompok"
      permissionPrefix="sub_kelompok"
      createLabel="Tambah sub kelompok"
      searchPlaceholder="Cari kode atau nama…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={masterSubKelompokService.list}
      remove={masterSubKelompokService.remove}
      parentFilter={parentFilter}
      columns={columns}
    />
  )
}
