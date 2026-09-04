/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:30:00
 */

import { jamaahService, keluargaService } from '../api/services'
import type { Keluarga } from '../api/types'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'

function formatAlamat(item: Keluarga): string {
  const parts = [
    item.alamat,
    item.rt ? `RT ${item.rt}` : null,
    item.rw ? `RW ${item.rw}` : null,
    item.wilayah_adm_desa?.nama,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const COLUMNS: GatedColumn<Keluarga>[] = [
  {
    key: 'kepala',
    label: 'Kepala Keluarga',
    sortKey: 'kepala',
    cell: (item) => (
      <div className="data-table__stack">
        <span className="data-table__primary">{item.kepala_jamaah?.nama || '—'}</span>
        {item.kepala_jamaah?.nik ? (
          <span className="data-table__meta">NIK {item.kepala_jamaah.nik}</span>
        ) : null}
      </div>
    ),
    exportValue: (item) => item.kepala_jamaah?.nama || '—',
  },
  {
    key: 'no_kk',
    label: 'No. KK',
    sortKey: 'no_kk',
    cell: (item) => item.no_kk || '—',
    exportValue: (item) => item.no_kk || '—',
  },
  {
    key: 'anggota',
    label: 'Anggota',
    sortKey: 'anggota',
    cell: (item) => {
      const count = item.anggota_count ?? item.anggota?.length ?? 0
      return <span className="badge badge--muted">{count} orang</span>
    },
    exportValue: (item) => item.anggota_count ?? item.anggota?.length ?? 0,
  },
  {
    key: 'alamat',
    label: 'Alamat',
    sortKey: 'alamat',
    cell: (item) => <span className="data-table__clip">{formatAlamat(item)}</span>,
    exportValue: (item) => formatAlamat(item),
  },
  {
    key: 'wilayah_fung_kelompok',
    label: 'Kelompok',
    sortKey: 'wilayah_fung_kelompok',
    cell: (item) => item.wilayah_fung_kelompok?.nama || '—',
    exportValue: (item) => item.wilayah_fung_kelompok?.nama || '—',
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => (
      <span className={`badge ${item.status === 'aktif' ? 'badge--ok' : 'badge--muted'}`}>
        {item.status}
      </span>
    ),
    exportValue: (item) => item.status,
  },
]

export function KeluargaListPage() {
  return (
    <SimpleMasterListPage<Keluarga>
      title="Keluarga"
      description="Kelola kepala keluarga dan anggota rumah tangga jamaah."
      entityLabel="keluarga"
      basePath="/keluarga"
      permissionPrefix="keluarga"
      createLabel="Tambah keluarga"
      dokumenKey="keluarga"
      searchPlaceholder="Cari no. KK, alamat, atau nama kepala…"
      defaultSortBy="kepala"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      selectFilter={{
        label: 'Status',
        paramKey: 'status',
        options: [
          { value: 'aktif', label: 'Aktif' },
          { value: 'nonaktif', label: 'Nonaktif' },
        ],
      }}
      parentFilter={{
        label: 'Kelompok',
        paramKey: 'wilayah_fung_kelompok_id',
        loadOptions: () => jamaahService.kelompokOptions(),
      }}
      itemLabel={(item) => item.kepala_jamaah?.nama || 'Keluarga'}
      list={(params: MasterListParams) => keluargaService.list(params)}
      remove={(id) => keluargaService.remove(id)}
    />
  )
}
