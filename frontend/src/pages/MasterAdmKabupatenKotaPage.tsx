/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:53:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:35:53
 */

import { admKabupatenKotaService, admProvinsiService } from '../api/services'
import type { AdmKabupatenKota } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadProvinsiOptions() {
  const result = await admProvinsiService.list({ per_page: 10000 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.negara ? `${item.nama} · ${item.negara.nama}` : item.nama,
  }))
}

const parentFilter = {
  label: 'Provinsi',
  paramKey: 'provinsi_id',
  loadOptions: loadProvinsiOptions,
}

export function MasterAdmKabupatenKotaPage() {
  return (
    <SimpleMasterListPage<AdmKabupatenKota>
      title="Master Kabupaten/Kota"
      description="Kelola kabupaten dan kota per provinsi."
      entityLabel="kabupaten/kota"
      basePath="/master/adm/kabupaten-kota"
      permissionPrefix="adm_kabupaten_kota"
      createLabel="Tambah kabupaten/kota"
      searchPlaceholder="Cari kode atau nama…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={admKabupatenKotaService.list}
      remove={admKabupatenKotaService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => (
        <>
          <th>Kode</th>
          <th>Jenis</th>
        </>
      )}
      renderLeadingCells={(item) => (
        <>
          <td>{item.kode}</td>
          <td>{item.jenis}</td>
        </>
      )}
    />
  )
}
