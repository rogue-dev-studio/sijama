/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:53:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 14:20:00
 */

import { admKabupatenKotaService, admProvinsiService } from '../api/services'
import type { AdmKabupatenKota } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

async function loadProvinsiOptions() {
  const result = await admProvinsiService.list({ per_page: 500 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.wilayah_adm_negara ? `${item.nama} · ${item.wilayah_adm_negara.nama}` : item.nama,
  }))
}

const parentFilter = {
  label: 'Provinsi',
  paramKey: 'wilayah_adm_provinsi_id',
  loadOptions: loadProvinsiOptions,
}

const columns: GatedColumn<AdmKabupatenKota>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'wilayah_adm_provinsi',
    label: 'Provinsi',
    cell: (item) => item.wilayah_adm_provinsi?.nama || '—',
    exportValue: (item) => item.wilayah_adm_provinsi?.nama || '',
  },
  {
    key: 'singkatan',
    label: 'SNI',
    cell: (item) => item.singkatan || '—',
    exportValue: (item) => item.singkatan || '',
  },
  {
    key: 'nama',
    label: 'Nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'singkatan_kawasan_metropolitan',
    label: 'Kawasan Metro',
    cell: (item) => item.singkatan_kawasan_metropolitan || '—',
    exportValue: (item) => item.singkatan_kawasan_metropolitan || '',
  },
  {
    key: 'jenis',
    label: 'Jenis',
    cell: (item) => item.jenis,
    exportValue: (item) => item.jenis,
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

export function MasterAdmKabupatenKotaPage() {
  return (
    <SimpleMasterListPage<AdmKabupatenKota>
      title="Master Kabupaten/Kota"
      description="Kelola kabupaten dan kota per provinsi."
      entityLabel="kabupaten/kota"
      basePath="/master/wilayah-adm/kabupaten-kota"
      permissionPrefix="wilayah_adm_kabupaten_kota"
      createLabel="Tambah kabupaten/kota"
      searchPlaceholder="Cari kode atau nama…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={admKabupatenKotaService.list}
      remove={admKabupatenKotaService.remove}
      parentFilter={parentFilter}
      columns={columns}
    />
  )
}
