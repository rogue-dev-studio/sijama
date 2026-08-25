/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:35:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import { masterDesaService, masterKelompokService } from '../api/services'
import type { Kelompok } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadDesaOptions() {
  const result = await masterDesaService.list({ per_page: 10000 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.daerah ? `${item.nama} · ${item.daerah.nama}` : item.nama,
  }))
}

const parentFilter = {
  label: 'Desa',
  paramKey: 'desa_id',
  loadOptions: loadDesaOptions,
}

export function MasterKelompokPage() {
  return (
    <SimpleMasterListPage<Kelompok>
      title="Master Kelompok"
      description="Kelola kelompok jamaah per desa."
      entityLabel="kelompok"
      basePath="/master/kelompok"
      permissionPrefix="kelompok"
      createLabel="Tambah kelompok"
      searchPlaceholder="Cari kode atau nama kelompok…"
      showStatusFilter
      requireParentOptionsForCreate
      list={masterKelompokService.list}
      remove={masterKelompokService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
