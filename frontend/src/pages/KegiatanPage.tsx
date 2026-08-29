import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { kegiatanService } from '../api/services'
import { Pagination, rowNumber } from '../components/Pagination'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import type { Kegiatan, PaginationMeta } from '../api/types'
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
  cell: (item: Kegiatan) => ReactNode
  exportValue: (item: Kegiatan) => string | number
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
    key: 'jenis',
    label: 'Jenis',
    sortKey: 'jenis',
    cell: (item) => item.jenis || item.kategori_kegiatan?.nama || '—',
    exportValue: (item) => item.jenis || item.kategori_kegiatan?.nama || '—',
  },
  {
    key: 'lokasi',
    label: 'Lokasi',
    sortKey: 'lokasi',
    cell: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
    exportValue: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
  },
  {
    key: 'tanggal',
    label: 'Tanggal',
    sortKey: 'tanggal',
    cell: (item) => new Date(item.tanggal).toLocaleDateString('id-ID'),
    exportValue: (item) => new Date(item.tanggal).toLocaleDateString('id-ID'),
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => item.status,
    exportValue: (item) => item.status,
  },
]

const PREFIX = 'kegiatan'

export function KegiatanPage() {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
  const [items, setItems] = useState<Kegiatan[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'tanggal', sortDir: 'desc' })
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
      const result = await kegiatanService.list({
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
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kegiatan')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, dateFrom, dateTo, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(id: number) {
    if (!window.confirm('Hapus kegiatan ini?')) return
    try {
      await kegiatanService.remove(id)
      notifyDeleted('kegiatan')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus kegiatan')
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
            <h1>Kegiatan</h1>
            <p>Agenda kegiatan jamaah dan masjid.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Daftar Kegiatan"
              dokumenKey="kegiatan"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Daftar Kegiatan',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
            {createAccess.visible && (
              <PermissionLink
                to="/kegiatan/new"
                enabled={createAccess.enabled}
                className="btn btn--primary"
              >
                Tambah kegiatan
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
            placeholder="Cari judul atau jenis…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari kegiatan"
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
                { value: 'planned', label: 'Direncanakan' },
                { value: 'ongoing', label: 'Berlangsung' },
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

      {loading && <div className="loading-state">Memuat kegiatan…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada kegiatan yang cocok.' : 'Belum ada kegiatan.'}
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
                              to={`/kegiatan/${item.id}/edit`}
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
