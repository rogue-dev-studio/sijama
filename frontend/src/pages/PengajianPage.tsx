import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { pengajianService } from '../api/services'
import { Pagination, rowNumber } from '../components/Pagination'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import type { PaginationMeta, Pengajian } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { listButtonAccess, listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'
import { SearchableSelect } from '../components/SearchableSelect'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { PermissionLink } from '../components/PermissionLink'
import { useToast } from '../components/ToastProvider'

type ColumnDef = {
  key: string
  label: string
  sortKey: string
  cell: (item: Pengajian) => ReactNode
  exportValue: (item: Pengajian) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'judul',
    label: 'Judul',
    sortKey: 'judul',
    cell: (item) => item.judul,
    exportValue: (item) => item.judul,
  },
  {
    key: 'pemateri',
    label: 'Pemateri',
    sortKey: 'pemateri',
    cell: (item) => item.pemateri || item.pemateri_ref?.nama || '—',
    exportValue: (item) => item.pemateri || item.pemateri_ref?.nama || '—',
  },
  {
    key: 'lokasi',
    label: 'Lokasi',
    sortKey: 'lokasi',
    cell: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
    exportValue: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
  },
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'starts_at',
    cell: (item) => new Date(item.starts_at).toLocaleString('id-ID'),
    exportValue: (item) => new Date(item.starts_at).toLocaleString('id-ID'),
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => item.status,
    exportValue: (item) => item.status,
  },
]

const PREFIX = 'pengajian'

export function PengajianPage() {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
  const [items, setItems] = useState<Pengajian[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'starts_at', sortDir: 'desc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)
  const createAccess = listButtonAccess(can, PREFIX, 'create')
  const updateAccess = listButtonAccess(can, PREFIX, 'update')
  const deleteAccess = listButtonAccess(can, PREFIX, 'delete')
  const showActions = updateAccess.visible || deleteAccess.visible

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await pengajianService.list({
        q: search || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat pengajian')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, dateFrom, dateTo, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(id: number) {
    if (!window.confirm('Hapus jadwal pengajian ini?')) return
    try {
      await pengajianService.remove(id)
      notifyDeleted('pengajian')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus pengajian')
    }
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)

  const hasActiveFilters =
    search !== '' || statusFilter !== '' || dateFrom !== '' || dateTo !== ''

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Pengajian</h1>
            <p>Jadwal kajian dan pemateri.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Daftar Pengajian"
              dokumenKey="pengajian"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Daftar Pengajian',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
            {createAccess.visible && (
              <PermissionLink
                to="/pengajian/new"
                enabled={createAccess.enabled}
                className="btn btn--primary"
              >
                Tambah pengajian
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
            placeholder="Cari judul atau pemateri…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari pengajian"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_status">Status</label>
            <SearchableSelect
              id="filter_status"
              value={statusFilter}
              onChange={(next) => handleStatusChange(next)}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                { value: 'scheduled', label: 'Terjadwal' },
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_date_from">Dari tanggal</label>
            <input
              id="filter_date_from"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_date_to">Sampai tanggal</label>
            <input
              id="filter_date_to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value)
                setPage(1)
              }}
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

      {loading && <div className="loading-state">Memuat pengajian…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada pengajian yang cocok.' : 'Belum ada jadwal pengajian.'}
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
                  {visibleColumns.map((column) => (
                    <SortableTh
                      key={column.key}
                      label={column.label}
                      column={column.sortKey}
                      {...sortBind}
                    />
                  ))}
                  {showActions && <th>Aksi</th>}
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
                          {updateAccess.visible && (
                            <PermissionLink
                              to={`/pengajian/${item.id}/edit`}
                              enabled={updateAccess.enabled}
                              className="btn btn--secondary btn--small"
                            >
                              Edit
                            </PermissionLink>
                          )}
                          {deleteAccess.visible && (
                            <button
                              type="button"
                              className="btn btn--danger btn--small"
                              disabled={!deleteAccess.enabled}
                              onClick={() => void handleDelete(item.id)}
                            >
                              Hapus
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
