/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:41:12
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { admDesaKelurahanService, admKecamatanService } from '../api/services'
import type { AdmDesaKelurahan } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

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

const columns: GatedColumn<AdmDesaKelurahan>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'nama',
    label: 'Nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'jenis',
    label: 'Jenis',
    cell: (item) => item.jenis.replace('_', ' '),
    exportValue: (item) => item.jenis.replace('_', ' '),
  },
  {
    key: 'is_active',
    label: 'Status',
    cell: (item) => (
      <span className={`badge ${item.is_active !== false ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
    exportValue: (item) => (item.is_active !== false ? 'Aktif' : 'Nonaktif'),
  },
]

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
      columns={columns}
    />
  )
}
