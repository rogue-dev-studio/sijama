/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:57:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { admNegaraService, admProvinsiService } from '../api/services'
import type { AdmProvinsi } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadNegaraOptions() {
  const result = await admNegaraService.list({ per_page: 100 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Negara',
  paramKey: 'negara_id',
  loadOptions: loadNegaraOptions,
}

export function MasterAdmProvinsiPage() {
  return (
    <SimpleMasterListPage<AdmProvinsi>
      title="Master Provinsi"
      description="Kelola provinsi per negara dalam wilayah administrasi."
      entityLabel="provinsi"
      basePath="/master/adm/provinsi"
      permissionPrefix="adm_provinsi"
      createLabel="Tambah provinsi"
      searchPlaceholder="Cari kode atau nama provinsi…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={admProvinsiService.list}
      remove={admProvinsiService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
