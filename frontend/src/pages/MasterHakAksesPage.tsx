/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback } from 'react'
import { masterFiturService, masterHakAksesService } from '../api/services'
import type { HakAkses } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<HakAkses>[] = [
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
    key: 'aksi',
    label: 'Aksi',
    cell: (item) => item.aksi,
    exportValue: (item) => item.aksi,
  },
  {
    key: 'fitur',
    label: 'Fitur',
    sortable: false,
    cell: (item) => item.fitur?.nama || item.fitur_id,
    exportValue: (item) => item.fitur?.nama || String(item.fitur_id),
  },
]

export function MasterHakAksesPage() {
  const loadFiturs = useCallback(async () => {
    const result = await masterFiturService.list({ per_page: 100 })
    return result.items.map((fitur) => ({ id: fitur.id, nama: fitur.nama }))
  }, [])

  return (
    <SimpleMasterListPage<HakAkses>
      title="Master Hak Akses"
      description="Kelola permission per fitur."
      entityLabel="hak akses"
      basePath="/master/hak-akses"
      permissionPrefix="hak_akses"
      createLabel="Tambah hak akses"
      list={masterHakAksesService.list}
      remove={masterHakAksesService.remove}
      searchPlaceholder="Cari slug atau nama hak akses…"
      showStatusFilter={false}
      showStatusColumn={false}
      requireParentOptionsForCreate
      parentFilter={{
        label: 'Fitur',
        paramKey: 'fitur_id',
        loadOptions: loadFiturs,
      }}
      actionsHeaderLabel="Kelola"
      columns={columns}
    />
  )
}
