import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { masterDapukanService, masterUserService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import type { Dapukan, MasterUser, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { listButtonAccess, listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'
import { SearchableSelect } from '../components/SearchableSelect'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { PermissionLink } from '../components/PermissionLink'
import { useToast } from '../components/ToastProvider'

function formatScope(item: MasterUser) {
  const parts = [
    item.scope?.pusat?.nama,
    item.scope?.daerah?.nama,
    item.scope?.desa?.nama,
    item.scope?.kelompok?.nama,
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

type ColumnDef = {
  key: string
  label: string
  sortKey?: string
  sortable?: boolean
  cell: (item: MasterUser) => ReactNode
  exportValue: (item: MasterUser) => string | number
}

const COLUMNS: ColumnDef[] = [
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

const PREFIX = 'users'

export function MasterUsersPage() {
  const { can } = useAuth()
  const { notifySuccess } = useToast()
  const [items, setItems] = useState<MasterUser[]>([])
  const [dapukanList, setDapukanList] = useState<Dapukan[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('')
  const [dapukanFilter, setDapukanFilter] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'name', sortDir: 'asc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)
  const createAccess = listButtonAccess(can, PREFIX, 'create')
  const updateAccess = listButtonAccess(can, PREFIX, 'update')
  const showActions = updateAccess.visible

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const users = await masterUserService.list({
        q: search || undefined,
        is_active: isActiveFilter === '' ? undefined : isActiveFilter === '1',
        dapukan_id: dapukanFilter || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(users.items)
      setMeta(users.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat pengguna')
    } finally {
      setLoading(false)
    }
  }, [search, isActiveFilter, dapukanFilter, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

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

  async function handleDeactivate(item: MasterUser) {
    if (!window.confirm(`Nonaktifkan pengguna "${item.name}"?`)) return
    setError(null)
    try {
      await masterUserService.deactivate(item.id)
      notifySuccess('Pengguna berhasil dinonaktifkan.')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menonaktifkan pengguna')
    }
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setIsActiveFilter('')
    setDapukanFilter(0)
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)

  const hasActiveFilters = search !== '' || isActiveFilter !== '' || dapukanFilter > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Pengguna</h1>
            <p>Akun login ditautkan ke jamaah; dapukan & cakupan dari master jamaah.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Master Pengguna"
              dokumenKey="master_users"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Master Pengguna',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
            {createAccess.visible && (
              <PermissionLink
                to="/master/users/new"
                enabled={createAccess.enabled}
                className="btn btn--primary"
              >
                Tambah pengguna
              </PermissionLink>
            )}
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari nama atau username…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari pengguna"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_status">Status</label>
            <SearchableSelect
              id="filter_status"
              value={isActiveFilter}
              onChange={(next) => {
                setIsActiveFilter(next as '' | '1' | '0')
                setPage(1)
              }}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                { value: '1', label: 'Aktif' },
                { value: '0', label: 'Nonaktif' },
              ]}
            />
          </div>
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
        </div>
        {hasActiveFilters && (
          <div className="filter-bar__actions">
            <button type="button" className="btn btn--secondary" onClick={clearFilters}>
              Hapus filter
            </button>
          </div>
        )}
      </div>

      {loading && <div className="loading-state">Memuat pengguna…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada pengguna yang cocok.' : 'Belum ada data pengguna.'}
        </div>
      )}

      {!loading && items.length > 0 && visibleColumns.length === 0 && !showActions && (
        <div className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</div>
      )}

      {!loading && items.length > 0 && (visibleColumns.length > 0 || showActions) && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  {visibleColumns.map((column) =>
                    column.sortable === false ? (
                      <th key={column.key}>{column.label}</th>
                    ) : (
                      <SortableTh
                        key={column.key}
                        label={column.label}
                        column={column.sortKey ?? column.key}
                        {...sortBind}
                      />
                    ),
                  )}
                  {showActions && <th>Kelola</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{column.cell(item)}</td>
                    ))}
                    {showActions && (
                      <td>
                        <div className="data-table__actions">
                          <PermissionLink
                            to={`/master/users/${item.id}/edit`}
                            enabled={updateAccess.enabled}
                            className="btn btn--secondary btn--small"
                          >
                            Edit
                          </PermissionLink>
                          {item.is_active && (
                            <button
                              type="button"
                              className="btn btn--danger btn--small"
                              disabled={!updateAccess.enabled}
                              onClick={() => void handleDeactivate(item)}
                            >
                              Nonaktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            meta={meta}
            onPageChange={setPage}
            onPerPageChange={(next) => {
              setPerPage(next)
              setPage(1)
            }}
          />
        </>
      )}
    </>
  )
}
