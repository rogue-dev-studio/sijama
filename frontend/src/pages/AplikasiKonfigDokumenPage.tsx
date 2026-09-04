/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:14:05
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:30:00
 */

import type { ReactNode } from 'react'
import { aplikasiKonfigDokumenService } from '../api/services'
import type { KonfigDokumen } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import {
  SimpleMasterListPage,
  type GatedColumn,
  type MasterListParams,
} from '../components/SimpleMasterListPage'
import { PermissionLink } from '../components/PermissionLink'
import { listButtonAccess } from '../lib/listUiAccess'

const PREFIX = 'konfig_dokumen'

type KonfigDokumenRow = KonfigDokumen & { id: number }

function kopMediaLabel(item: KonfigDokumen): string {
  const parts: string[] = []
  if (item.apply_pdf) parts.push('PDF')
  if (item.apply_excel) parts.push('Excel')
  if (item.apply_csv) parts.push('CSV')
  return parts.length > 0 ? parts.join(', ') : '—'
}

const COLUMNS: GatedColumn<KonfigDokumenRow>[] = [
  {
    key: 'nama_cetakan',
    label: 'Nama cetakan',
    sortKey: 'lookup_name',
    cell: (item) => item.lookup_name || item.nama || '—',
    exportValue: (item) => item.lookup_name || item.nama || '—',
  },
  {
    key: 'value',
    label: 'Value',
    sortKey: 'lookup_value',
    cell: (item) => <code>{item.lookup_value || '—'}</code>,
    exportValue: (item) => item.lookup_value || '—',
  },
  {
    key: 'header',
    label: 'Header',
    sortable: false,
    cell: (item) => item.header || '—',
    exportValue: (item) => item.header || '—',
  },
  {
    key: 'media',
    label: 'Kop di media',
    sortable: false,
    cell: (item) => kopMediaLabel(item),
    exportValue: (item) => kopMediaLabel(item),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    cell: (item) => (
      <span className={`badge ${item.is_configured ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_configured ? 'Terkonfigurasi' : 'Belum'}
      </span>
    ),
    exportValue: (item) => (item.is_configured ? 'Terkonfigurasi' : 'Belum'),
  },
]

export function AplikasiKonfigDokumenPage() {
  const { can } = useAuth()
  const createLookupAccess = listButtonAccess(can, 'lookup', 'create')
  const updateAccess = listButtonAccess(can, PREFIX, 'update')

  return (
    <SimpleMasterListPage<KonfigDokumenRow>
      title="Konfigurasi Dokumen"
      description="Header/footer per cetakan dari lookup tipe konfig_dokumen."
      entityLabel="konfigurasi dokumen"
      basePath="/aplikasi/konfig-dokumen"
      permissionPrefix={PREFIX}
      createLabel="Tambah lookup"
      searchPlaceholder="Cari nama / value cetakan…"
      defaultSortBy="lookup_urutan"
      columns={COLUMNS}
      showStatusFilter={false}
      showStatusColumn={false}
      hideCreateButton
      getRowKey={(item) => item.lookup_id}
      editItemPath={(item) => `/aplikasi/konfig-dokumen/${item.lookup_id}/edit`}
      headerActions={
        createLookupAccess.visible ? (
          <PermissionLink
            to="/master/lookup/new"
            enabled={createLookupAccess.enabled}
            className="btn btn--secondary"
          >
            Tambah lookup
          </PermissionLink>
        ) : null
      }
      list={async (params: MasterListParams) => {
        const result = await aplikasiKonfigDokumenService.list(params)
        return {
          ...result,
          items: result.items.map((item) => ({ ...item, id: item.lookup_id })),
        }
      }}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
      renderRowActions={(item): ReactNode => (
        <PermissionLink
          to={`/aplikasi/konfig-dokumen/${item.lookup_id}/edit`}
          enabled={updateAccess.enabled}
          className="btn btn--secondary btn--small"
        >
          Ubah
        </PermissionLink>
      )}
    />
  )
}
