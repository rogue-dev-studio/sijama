/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:21:51
 */

import { masterPemateriService } from '../api/services'
import type { Pemateri } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterPemateriPage() {
  return (
    <SimpleMasterListPage<Pemateri>
      title="Master Pemateri"
      description="Pemateri diambil dari master jamaah (nama & kontak)."
      entityLabel="pemateri"
      basePath="/master/pemateri"
      permissionPrefix="pemateri"
      createLabel="Tambah pemateri"
      list={masterPemateriService.list}
      remove={masterPemateriService.remove}
      renderExtraHeaders={() => <th>Kontak</th>}
      renderExtraCells={(item) => <td>{item.kontak || '—'}</td>}
    />
  )
}
