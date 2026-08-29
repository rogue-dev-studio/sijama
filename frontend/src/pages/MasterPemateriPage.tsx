/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterPemateriService } from '../api/services'
import type { Pemateri } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<Pemateri>[] = [
  {
    key: 'nama',
    label: 'Nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'kontak',
    label: 'Kontak',
    sortable: false,
    cell: (item) => item.kontak || '—',
    exportValue: (item) => item.kontak || '—',
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

export function MasterPemateriPage() {
  return (
    <SimpleMasterListPage<Pemateri>
      title="Master Pemateri"
      description="Pemateri diambil dari master jamaah (nama & kontak)."
      entityLabel="pemateri"
      basePath="/master/pemateri"
      permissionPrefix="pemateri"
      createLabel="Tambah pemateri"
      list={masterPemateriService.list}
      remove={masterPemateriService.remove}
      columns={columns}
    />
  )
}
