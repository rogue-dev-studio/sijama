/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import { useEffect, useState } from 'react'
import { masterMenuService } from '../api/services'
import type { Menu } from '../api/types'
import { MenuIcon } from '../components/MenuIcon'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterMenuPage() {
  const [allMenus, setAllMenus] = useState<Menu[]>([])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const result = await masterMenuService.list({ per_page: 100 })
        if (active) setAllMenus(result.items)
      } catch {
        if (active) setAllMenus([])
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <SimpleMasterListPage<Menu>
      title="Master Menu"
      description="Kelola struktur navigasi aplikasi."
      entityLabel="menu"
      basePath="/master/menu"
      permissionPrefix="menu"
      createLabel="Tambah menu"
      list={masterMenuService.list}
      remove={async (id) => {
        await masterMenuService.remove(id)
        try {
          const result = await masterMenuService.list({ per_page: 100 })
          setAllMenus(result.items)
        } catch {
          setAllMenus([])
        }
      }}
      searchPlaceholder="Cari slug atau nama menu…"
      renderLeadingHeaders={() => <th>Slug</th>}
      renderLeadingCells={(item) => <td>{item.slug}</td>}
      renderExtraHeaders={() => (
        <>
          <th>Icon</th>
          <th>Path</th>
          <th>Parent</th>
        </>
      )}
      renderExtraCells={(item) => (
        <>
          <td>
            <span className="menu-icon-cell" title={item.icon || undefined}>
              <MenuIcon name={item.icon} size={16} />
              <span>{item.icon || '—'}</span>
            </span>
          </td>
          <td>{item.path || '—'}</td>
          <td>
            {item.parent_id
              ? allMenus.find((parent) => parent.id === item.parent_id)?.nama || item.parent_id
              : '—'}
          </td>
        </>
      )}
    />
  )
}
