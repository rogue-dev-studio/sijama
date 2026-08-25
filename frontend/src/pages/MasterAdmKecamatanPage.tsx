/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:54:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:41:12
 */

import { admKabupatenKotaService, admKecamatanService } from '../api/services'
import type { AdmKecamatan } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadKabupatenOptions() {
  const result = await admKabupatenKotaService.list({ per_page: 10000 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.provinsi
      ? `${item.nama} · ${item.provinsi.nama}`
      : `${item.nama} (${item.jenis})`,
  }))
}

const parentFilter = {
  label: 'Kabupaten/Kota',
  paramKey: 'kabupaten_kota_id',
  loadOptions: loadKabupatenOptions,
}

export function MasterAdmKecamatanPage() {
  return (
    <SimpleMasterListPage<AdmKecamatan>
      title="Master Kecamatan"
      description="Kelola kecamatan per kabupaten/kota."
      entityLabel="kecamatan"
      basePath="/master/adm/kecamatan"
      permissionPrefix="adm_kecamatan"
      createLabel="Tambah kecamatan"
      searchPlaceholder="Cari kode atau nama…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={admKecamatanService.list}
      remove={admKecamatanService.remove}
      parentFilter={parentFilter}
      renderLeadingHeaders={() => <th>Kode</th>}
      renderLeadingCells={(item) => <td>{item.kode}</td>}
    />
  )
}
