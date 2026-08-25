/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import { useCallback } from 'react'
import { masterFiturService, masterHakAksesService } from '../api/services'
import type { HakAkses } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

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
      renderLeadingHeaders={() => <th>Slug</th>}
      renderLeadingCells={(item) => <td>{item.slug}</td>}
      renderExtraHeaders={() => (
        <>
          <th>Aksi</th>
          <th>Fitur</th>
        </>
      )}
      renderExtraCells={(item) => (
        <>
          <td>{item.aksi}</td>
          <td>{item.fitur?.nama || item.fitur_id}</td>
        </>
      )}
    />
  )
}
