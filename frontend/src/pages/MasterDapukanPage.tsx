/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterDapukanService } from '../api/services'
import type { Dapukan } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<Dapukan>[] = [
  {
    key: 'slug',
    label: 'Slug',
    cell: (item) => item.slug,
    exportValue: (item) => item.slug,
  },
  {
    key: 'nama',
    label: 'Nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'urutan',
    label: 'Urutan',
    cell: (item) => item.urutan,
    exportValue: (item) => item.urutan,
  },
  {
    key: 'is_active',
    label: 'Status',
    cell: (item) => (
      <>
        <span className={`badge ${item.is_active !== false ? 'badge--ok' : 'badge--muted'}`}>
          {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
        </span>
        {item.is_system ? (
          <span className="badge badge--muted" style={{ marginLeft: '0.35rem' }}>
            Sistem
          </span>
        ) : null}
      </>
    ),
    exportValue: (item) => {
      const status = item.is_active !== false ? 'Aktif' : 'Nonaktif'
      return item.is_system ? `${status} (Sistem)` : status
    },
  },
]

export function MasterDapukanPage() {
  return (
    <SimpleMasterListPage<Dapukan>
      title="Master Dapukan"
      description="Kelola peran dan tingkat akses pengguna."
      entityLabel="dapukan"
      basePath="/master/dapukan"
      permissionPrefix="dapukan"
      createLabel="Tambah dapukan"
      list={masterDapukanService.list}
      remove={masterDapukanService.remove}
      searchPlaceholder="Cari slug atau nama dapukan…"
      canDeleteItem={(item) => !item.is_system}
      defaultSortBy="urutan"
      columns={columns}
    />
  )
}
