/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:54:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { admKabupatenKotaService, admKecamatanService } from '../api/services'
import type { AdmKecamatan } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

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

const columns: GatedColumn<AdmKecamatan>[] = [
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
      columns={columns}
    />
  )
}
