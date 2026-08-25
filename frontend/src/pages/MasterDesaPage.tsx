/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { masterDaerahService, masterDesaService } from '../api/services'
import type { Desa } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadDaerahOptions() {
  const result = await masterDaerahService.list({ per_page: 100 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Daerah',
  paramKey: 'daerah_id',
  loadOptions: loadDaerahOptions,
}

export function MasterDesaPage() {
  return (
    <SimpleMasterListPage<Desa>
      title="Master Desa"
      description="Kelola wilayah desa per daerah dalam hierarki SIJAMA."
      entityLabel="desa"
      basePath="/master/desa"
      permissionPrefix="desa"
      createLabel="Tambah desa"
      searchPlaceholder="Cari kode atau nama desa…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={masterDesaService.list}
      remove={masterDesaService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
