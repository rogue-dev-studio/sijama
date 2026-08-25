/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import { useCallback } from 'react'
import { masterFiturService, masterMenuService } from '../api/services'
import type { Fitur } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

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
      renderLeadingHeaders={() => <th>Slug</th>}
      renderLeadingCells={(item) => <td>{item.slug}</td>}
      renderExtraHeaders={() => <th>Menu</th>}
      renderExtraCells={(item) => <td>{item.menu?.nama || item.menu_id}</td>}
    />
  )
}
