/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { masterLookupService } from '../api/services'
import type { LookupM } from '../api/types'
import { SimpleMasterListPage, type GatedColumn } from '../components/SimpleMasterListPage'

const columns: GatedColumn<LookupM>[] = [
  {
    key: 'lookup_type',
    label: 'Tipe',
    cell: (item) => item.lookup_type,
    exportValue: (item) => item.lookup_type,
  },
  {
    key: 'lookup_name',
    label: 'Nama',
    cell: (item) => item.lookup_name || item.nama || '—',
    exportValue: (item) => item.lookup_name || item.nama || '—',
  },
  {
    key: 'lookup_value',
    label: 'Value',
    cell: (item) => item.lookup_value || '—',
    exportValue: (item) => item.lookup_value || '—',
  },
  {
    key: 'lookup_kode',
    label: 'Kode',
    cell: (item) => item.lookup_kode || '—',
    exportValue: (item) => item.lookup_kode || '—',
  },
  {
    key: 'lookup_urutan',
    label: 'Urutan',
    cell: (item) => item.lookup_urutan ?? '—',
    exportValue: (item) => item.lookup_urutan ?? '—',
  },
  {
    key: 'is_active',
    label: 'Status',
    cell: (item) => (
      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_active ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
    exportValue: (item) => (item.is_active ? 'Aktif' : 'Nonaktif'),
  },
]

export function MasterLookupPage() {
  return (
    <SimpleMasterListPage<LookupM>
      title="Master Lookup"
      description="Kelola data referensi generik (lookup_m). Tipe baku: pekerjaan, jenis_kelamin, golongan_darah, status_pernikahan, pendidikan, hubungan_keluarga."
      entityLabel="lookup"
      basePath="/master/lookup"
      permissionPrefix="lookup"
      createLabel="Tambah lookup"
      list={masterLookupService.list}
      remove={masterLookupService.remove}
      searchPlaceholder="Cari tipe, nama, value, atau kode…"
      itemLabel={(item) => item.lookup_name || item.lookup_value || item.lookup_kode || `#${item.id}`}
      defaultSortBy="lookup_type"
      columns={columns}
    />
  )
}
