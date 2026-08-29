/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback } from 'react'
import { masterFiturService, masterMenuService } from '../api/services'
import type { Fitur } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<Fitur>[] = [
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
    key: 'menu',
    label: 'Menu',
    sortable: false,
    cell: (item) => item.menu?.nama || item.menu_id,
    exportValue: (item) => item.menu?.nama || String(item.menu_id),
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

export function MasterFiturPage() {
  const loadMenus = useCallback(async () => {
    const result = await masterMenuService.list({ per_page: 100 })
    return result.items.map((menu) => ({ id: menu.id, nama: menu.nama }))
  }, [])

  return (
    <SimpleMasterListPage<Fitur>
      title="Master Fitur"
      description="Kelola fitur per menu navigasi."
      entityLabel="fitur"
      basePath="/master/fitur"
      permissionPrefix="fitur"
      createLabel="Tambah fitur"
      list={masterFiturService.list}
      remove={masterFiturService.remove}
      searchPlaceholder="Cari slug atau nama fitur…"
      requireParentOptionsForCreate
      parentFilter={{
        label: 'Menu',
        paramKey: 'menu_id',
        loadOptions: loadMenus,
      }}
      columns={columns}
    />
  )
}
