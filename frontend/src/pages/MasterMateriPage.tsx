/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { masterMateriService } from '../api/services'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

export function MasterMateriPage() {
  return (
    <SimpleMasterListPage
      title="Master Materi"
      description="Kelola materi pengajian yang dapat dipilih pada jadwal."
      entityLabel="materi"
      basePath="/master/materi"
      permissionPrefix="materi"
      createLabel="Tambah materi"
      list={masterMateriService.list}
      remove={masterMateriService.remove}
    />
  )
}
