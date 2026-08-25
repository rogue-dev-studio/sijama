/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { masterDaerahService, masterPusatService } from '../api/services'
import type { Daerah } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadPusatOptions() {
  const result = await masterPusatService.list({ per_page: 100 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Pusat',
  paramKey: 'pusat_id',
  loadOptions: loadPusatOptions,
}

export function MasterDaerahPage() {
  return (
    <SimpleMasterListPage<Daerah>
      title="Master Daerah"
      description="Kelola wilayah daerah per pusat dalam hierarki SIJAMA."
      entityLabel="daerah"
      basePath="/master/daerah"
      permissionPrefix="daerah"
      createLabel="Tambah daerah"
      searchPlaceholder="Cari kode atau nama daerah…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={masterDaerahService.list}
      remove={masterDaerahService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
