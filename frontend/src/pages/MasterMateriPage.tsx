/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterMateriService } from '../api/services'
import type { Materi } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<Materi>[] = [
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

export function MasterMateriPage() {
  return (
    <SimpleMasterListPage<Materi>
      title="Master Materi"
      description="Kelola materi pengajian yang dapat dipilih pada jadwal."
      entityLabel="materi"
      basePath="/master/materi"
      permissionPrefix="materi"
      createLabel="Tambah materi"
      list={masterMateriService.list}
      remove={masterMateriService.remove}
      columns={columns}
    />
  )
}
