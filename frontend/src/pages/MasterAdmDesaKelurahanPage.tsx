/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:41:12
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:41:12
 */

import { admDesaKelurahanService, admKecamatanService } from '../api/services'
import type { AdmDesaKelurahan } from '../api/types'
import { SimpleMasterListPage } from '../components/SimpleMasterListPage'

async function loadKecamatanOptions() {
  const result = await admKecamatanService.list({ per_page: 10000 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.kabupaten_kota
      ? `${item.nama} · ${item.kabupaten_kota.nama}`
      : item.nama,
  }))
}

const parentFilter = {
  label: 'Kecamatan',
  paramKey: 'kecamatan_id',
  loadOptions: loadKecamatanOptions,
}

export function MasterAdmDesaKelurahanPage() {
  return (
    <SimpleMasterListPage<AdmDesaKelurahan>
      title="Master Desa/Kelurahan"
      description="Kelola desa dan kelurahan per kecamatan."
      entityLabel="desa/kelurahan"
      basePath="/master/adm/desa-kelurahan"
      permissionPrefix="adm_desa_kelurahan"
      createLabel="Tambah desa/kelurahan"
      searchPlaceholder="Cari kode atau nama…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={admDesaKelurahanService.list}
      remove={admDesaKelurahanService.remove}
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
          <td>{item.jenis.replace('_', ' ')}</td>
        </>
      )}
    />
  )
}
