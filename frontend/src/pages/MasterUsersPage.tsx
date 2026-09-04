/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:05:00
 */

import { useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { masterDapukanService, masterUserService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { canManageUserAccount, canDeactivateUserAccount } from '../lib/dapukanAccess'
import type { Dapukan, MasterUser } from '../api/types'
import { SimpleMasterListPage, type GatedColumn, type MasterListParams } from '../components/SimpleMasterListPage'
import { SearchableSelect } from '../components/SearchableSelect'
import { PermissionLink } from '../components/PermissionLink'
import { listButtonAccess } from '../lib/listUiAccess'
import { useToast } from '../components/ToastProvider'
import { useConfirm } from '../components/ConfirmDialogProvider'

function formatScope(item: MasterUser) {
  const parts = [
    item.scope?.wilayah_fung_pusat?.nama,
    item.scope?.wilayah_fung_daerah?.nama,
    item.scope?.wilayah_fung_desa?.nama,
    item.scope?.wilayah_fung_kelompok?.nama,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(' → ') : '—'
}

function dapukanLabel(item: MasterUser) {
  return (
    (item.dapukan_list && item.dapukan_list.length > 0
      ? item.dapukan_list.map((d) => d.nama).join(', ')
      : item.dapukan?.nama) || '—'
  )
}

type UserListItem = MasterUser & { nama: string }

const columns: GatedColumn<UserListItem>[] = [
  {
    key: 'nama',
    label: 'Nama',
    sortKey: 'name',
    cell: (item) => item.name,
    exportValue: (item) => item.name,
  },
  {
    key: 'username',
    label: 'Username',
    sortKey: 'username',
    cell: (item) => item.username,
    exportValue: (item) => item.username,
  },
  {
    key: 'dapukan',
    label: 'Dapukan',
    sortable: false,
    cell: (item) => dapukanLabel(item),
    exportValue: (item) => dapukanLabel(item),
  },
  {
    key: 'cakupan',
    label: 'Cakupan',
    sortable: false,
    cell: (item) => formatScope(item),
    exportValue: (item) => formatScope(item),
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'is_active',
    cell: (item) => (
      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_active ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
    exportValue: (item) => (item.is_active ? 'Aktif' : 'Nonaktif'),
  },
]

export function MasterUsersPage() {
  const { can, user: actor } = useAuth()
  const { notifySuccess } = useToast()
  const { confirm } = useConfirm()
  const [dapukanList, setDapukanList] = useState<Dapukan[]>([])
  const [dapukanFilter, setDapukanFilter] = useState(0)
  const [reloadNonce, setReloadNonce] = useState(0)

  const updateAccess = listButtonAccess(can, 'users', 'update')

  useEffect(() => {
    async function loadDapukan() {
      try {
        const result = await masterDapukanService.list({ per_page: 1000 })
        setDapukanList(result.items)
      } catch {
        setDapukanList([])
      }
    }
    void loadDapukan()
  }, [])

  async function handleDeactivate(item: UserListItem) {
    if (!canDeactivateUserAccount(actor, item)) {
      return
    }
    const ok = await confirm({
      title: 'Nonaktifkan pengguna',
      message: `Nonaktifkan pengguna "${item.name}"? Akun tidak bisa login sampai diaktifkan kembali.`,
      confirmLabel: 'Ya, nonaktifkan',
    })
    if (!ok) return
    try {
      await masterUserService.deactivate(item.id)
      notifySuccess('Pengguna berhasil dinonaktifkan.')
      setReloadNonce((value) => value + 1)
    } catch (err) {
      throw err instanceof ApiError ? err : new Error('Gagal menonaktifkan pengguna')
    }
  }

  function renderRowActions(item: UserListItem): ReactNode {
    if (!canManageUserAccount(actor, item)) {
      return <span className="field-hint">Super Admin</span>
    }

    return (
      <div className="data-table__actions">
        {!item.is_demo && (
          <PermissionLink
            to={`/master/users/${item.id}/edit`}
            enabled={updateAccess.enabled}
            className="btn btn--secondary btn--small"
          >
            Edit
          </PermissionLink>
        )}
        {item.is_active && canDeactivateUserAccount(actor, item) && (
          <button
            type="button"
            className="btn btn--danger btn--small"
            disabled={!updateAccess.enabled}
            onClick={() => void handleDeactivate(item)}
          >
            Nonaktifkan
          </button>
        )}
        {item.is_demo && (
          <span className="field-hint" title="Akun demo tidak dapat diedit, dinonaktifkan, atau diganti password">
            Demo (terkunci)
          </span>
        )}
      </div>
    )
  }

  return (
    <SimpleMasterListPage<UserListItem>
      title="Master Pengguna"
      description="Setiap akun login terhubung ke satu jamaah. Dapukan dan cakupan mengikuti data jamaah."
      entityLabel="pengguna"
      basePath="/master/users"
      permissionPrefix="users"
      createLabel="Tambah pengguna"
      searchPlaceholder="Cari nama atau username…"
      dokumenKey="master_users"
      defaultSortBy="name"
      actionsHeaderLabel="Kelola"
      showStatusFilter
      columns={columns}
      extraFilterParams={{
        dapukan_id: dapukanFilter || undefined,
        _reload: reloadNonce || undefined,
      }}
      hasExtraFilters={dapukanFilter > 0}
      onClearExtraFilters={() => setDapukanFilter(0)}
      renderExtraFilters={({ setPage }) => (
        <div className="field">
          <label htmlFor="filter_dapukan">Dapukan</label>
          <SearchableSelect
            id="filter_dapukan"
            value={dapukanFilter ? String(dapukanFilter) : ''}
            onChange={(next) => {
              setDapukanFilter(Number(next))
              setPage(1)
            }}
            placeholder="Semua"
            options={[
              { value: '', label: 'Semua' },
              ...dapukanList.map((item) => ({ value: String(item.id), label: item.nama })),
            ]}
          />
        </div>
      )}
      list={async (params: MasterListParams) => {
        const { _reload: _ignored, ...apiParams } = params
        const result = await masterUserService.list(apiParams)
        return {
          ...result,
          items: result.items.map((item) => ({ ...item, nama: item.name })),
        }
      }}
      remove={async () => Promise.resolve()}
      canDeleteItem={() => false}
      renderRowActions={renderRowActions}
    />
  )
}
