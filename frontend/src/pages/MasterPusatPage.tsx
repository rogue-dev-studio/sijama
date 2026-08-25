/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

import { masterPusatService } from '../api/services'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'
import type { Pusat } from '../api/types'

export function MasterPusatPage() {
  return (
    <SimpleMasterListPage<Pusat>
      title="Master Pusat"
      description="Kelola wilayah pusat sebagai induk tertinggi hierarki SIJAMA."
      entityLabel="pusat"
      basePath="/master/pusat"
      permissionPrefix="pusat"
      createLabel="Tambah pusat"
      searchPlaceholder="Cari kode atau nama pusat…"
      showStatusFilter={false}
      list={masterPusatService.list}
      remove={masterPusatService.remove}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
