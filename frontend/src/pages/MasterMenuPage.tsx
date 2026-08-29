/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useEffect, useState } from 'react'
import { masterMenuService } from '../api/services'
import type { Menu } from '../api/types'
import { MenuIcon } from '../components/MenuIcon'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

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

  const columns: GatedColumn<Menu>[] = [
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
      key: 'path',
      label: 'Path',
      cell: (item) => item.path || '—',
      exportValue: (item) => item.path || '—',
    },
    {
      key: 'icon',
      label: 'Icon',
      sortable: false,
      cell: (item) => (
        <span className="menu-icon-cell" title={item.icon || undefined}>
          <MenuIcon name={item.icon} size={16} />
          <span>{item.icon || '—'}</span>
        </span>
      ),
      exportValue: (item) => item.icon || '—',
    },
    {
      key: 'parent_id',
      label: 'Parent',
      sortable: false,
      cell: (item) =>
        item.parent_id
          ? allMenus.find((parent) => parent.id === item.parent_id)?.nama || item.parent_id
          : '—',
      exportValue: (item) =>
        item.parent_id
          ? allMenus.find((parent) => parent.id === item.parent_id)?.nama || String(item.parent_id)
          : '—',
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
      defaultSortBy="urutan"
      columns={columns}
    />
  )
}
