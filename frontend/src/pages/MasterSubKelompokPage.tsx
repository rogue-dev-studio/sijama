/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 22:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import { masterKelompokService, masterSubKelompokService } from '../api/services'
import type { SubKelompok } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadKelompokOptions() {
  const result = await masterKelompokService.list({ per_page: 10000 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Kelompok',
  paramKey: 'kelompok_id',
  loadOptions: loadKelompokOptions,
}

export function MasterSubKelompokPage() {
  return (
    <SimpleMasterListPage<SubKelompok>
      title="Master Sub Kelompok"
      description="Kelola sub kelompok di bawah kelompok."
      entityLabel="sub kelompok"
      basePath="/master/sub-kelompok"
      permissionPrefix="sub_kelompok"
      createLabel="Tambah sub kelompok"
      searchPlaceholder="Cari kode atau nama…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={masterSubKelompokService.list}
      remove={masterSubKelompokService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
