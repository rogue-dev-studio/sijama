/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:57:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { admNegaraService, admProvinsiService } from '../api/services'
import type { AdmProvinsi } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

async function loadNegaraOptions() {
  const result = await admNegaraService.list({ per_page: 100 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Negara',
  paramKey: 'wilayah_adm_negara_id',
  loadOptions: loadNegaraOptions,
}

const columns: GatedColumn<AdmProvinsi>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'wilayah_adm_negara',
    label: 'Negara',
    cell: (item) => item.wilayah_adm_negara?.nama || '—',
    exportValue: (item) => item.wilayah_adm_negara?.nama || '',
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

export function MasterAdmProvinsiPage() {
  return (
    <SimpleMasterListPage<AdmProvinsi>
      title="Master Provinsi"
      description="Kelola provinsi per negara dalam wilayah administrasi."
      entityLabel="provinsi"
      basePath="/master/wilayah-adm/provinsi"
      permissionPrefix="wilayah_adm_provinsi"
      createLabel="Tambah provinsi"
      searchPlaceholder="Cari kode atau nama provinsi…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={admProvinsiService.list}
      remove={admProvinsiService.remove}
      parentFilter={parentFilter}
      columns={columns}
    />
  )
}
