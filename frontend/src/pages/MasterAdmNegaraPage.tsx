/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-01 16:56:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { admNegaraService } from '../api/services'
import type { AdmNegara } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<AdmNegara>[] = [
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
    key: 'iso3',
    label: 'ISO3',
    cell: (item) => item.iso3 || '—',
    exportValue: (item) => item.iso3 || '—',
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

export function MasterAdmNegaraPage() {
  return (
    <SimpleMasterListPage<AdmNegara>
      title="Master Negara"
      description="Kelola data wilayah administrasi negara."
      entityLabel="negara"
      basePath="/master/adm/negara"
      permissionPrefix="adm_negara"
      createLabel="Tambah negara"
      searchPlaceholder="Cari kode atau nama negara…"
      showStatusFilter={false}
      list={admNegaraService.list}
      remove={admNegaraService.remove}
      columns={columns}
    />
  )
}
