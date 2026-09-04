/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:35:53
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterDesaService, masterKelompokService } from '../api/services'
import type { Kelompok } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

async function loadDesaOptions() {
  const result = await masterDesaService.list({ per_page: 500 })
  return result.items.map((item) => ({
    id: item.id,
    nama: item.wilayah_fung_daerah ? `${item.nama} · ${item.wilayah_fung_daerah.nama}` : item.nama,
  }))
}

const parentFilter = {
  label: 'Desa',
  paramKey: 'wilayah_fung_desa_id',
  loadOptions: loadDesaOptions,
}

const columns: GatedColumn<Kelompok>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'wilayah_fung_desa',
    label: 'Desa',
    cell: (item) => item.wilayah_fung_desa?.nama || '—',
    exportValue: (item) => item.wilayah_fung_desa?.nama || '',
  },
  {
    key: 'singkatan',
    label: 'Singkatan',
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
    key: 'deskripsi',
    label: 'Deskripsi',
    cell: (item) => item.deskripsi || '—',
    exportValue: (item) => item.deskripsi || '',
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

export function MasterKelompokPage() {
  return (
    <SimpleMasterListPage<Kelompok>
      title="Master Kelompok"
      description="Kelola kelompok jamaah per desa."
      entityLabel="kelompok"
      basePath="/master/wilayah-fung/kelompok"
      permissionPrefix="wilayah_fung_kelompok"
      createLabel="Tambah kelompok"
      searchPlaceholder="Cari kode atau nama kelompok…"
      showStatusFilter
      requireParentOptionsForCreate
      list={masterKelompokService.list}
      remove={masterKelompokService.remove}
      parentFilter={parentFilter}
      columns={columns}
    />
  )
}
