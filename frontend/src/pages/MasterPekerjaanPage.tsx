/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:06:41
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { masterPekerjaanService } from '../api/services'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterPekerjaanPage() {
  return (
    <SimpleMasterListPage
      title="Master Pekerjaan"
      description="Kelola daftar pekerjaan yang dipilih pada master jamaah."
      entityLabel="pekerjaan"
      basePath="/master/pekerjaan"
      permissionPrefix="pekerjaan"
      createLabel="Tambah pekerjaan"
      list={masterPekerjaanService.list}
      remove={masterPekerjaanService.remove}
    />
  )
}
