/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterDaerahService, masterDesaService } from '../api/services'
import type { Desa } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

async function loadDaerahOptions() {
  const result = await masterDaerahService.list({ per_page: 100 })
  return result.items.map((item) => ({ id: item.id, nama: item.nama }))
}

const parentFilter = {
  label: 'Daerah',
  paramKey: 'wilayah_fung_daerah_id',
  loadOptions: loadDaerahOptions,
}

const columns: GatedColumn<Desa>[] = [
  {
    key: 'kode',
    label: 'Kode',
    cell: (item) => item.kode,
    exportValue: (item) => item.kode,
  },
  {
    key: 'wilayah_fung_daerah',
    label: 'Daerah',
    cell: (item) => item.wilayah_fung_daerah?.nama || '—',
    exportValue: (item) => item.wilayah_fung_daerah?.nama || '',
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

export function MasterDesaPage() {
  return (
    <SimpleMasterListPage<Desa>
      title="Master Desa"
      description="Kelola wilayah desa per daerah dalam hierarki SIJAMA."
      entityLabel="desa"
      basePath="/master/wilayah-fung/desa"
      permissionPrefix="wilayah_fung_desa"
      createLabel="Tambah desa"
      searchPlaceholder="Cari kode atau nama desa…"
      showStatusFilter={false}
      requireParentOptionsForCreate
      list={masterDesaService.list}
      remove={masterDesaService.remove}
      parentFilter={parentFilter}
      columns={columns}
    />
  )
}
