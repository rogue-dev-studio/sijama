import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { pengajianService } from '../api/services'
import { Pagination, rowNumber } from '../components/Pagination'
import type { PaginationMeta, Pengajian } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

import { SearchableSelect } from '../components/SearchableSelect'
export function PengajianPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Pengajian[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat pengajian')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, dateFrom, dateTo, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(id: number) {
    if (!window.confirm('Hapus jadwal pengajian ini?')) return
    try {
      await pengajianService.remove(id)
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
          {can('pengajian.create') && (
            <Link to="/pengajian/new" className="btn btn--primary">
              Tambah pengajian
            </Link>
          )}
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
                { value: "", label: "Semua" },
                { value: "scheduled", label: "Terjadwal" },
                { value: "completed", label: "Selesai" },
                { value: "cancelled", label: "Dibatalkan" },
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
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {loading && <div className="loading-state">Memuat pengajian…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada pengajian yang cocok.' : 'Belum ada jadwal pengajian.'}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Judul</th>
                  <th>Pemateri</th>
                  <th>Lokasi</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    <td>{item.judul}</td>
                    <td>{item.pemateri || item.pemateri_ref?.nama || '—'}</td>
                    <td>{item.lokasi || item.lokasi_ref?.nama || '—'}</td>
                    <td>{new Date(item.starts_at).toLocaleString('id-ID')}</td>
                    <td>{item.status}</td>
                    <td>
                      <div className="data-table__actions">
                        {can('pengajian.update') && (
                          <Link
                            to={`/pengajian/${item.id}/edit`}
                            className="btn btn--secondary btn--small"
                          >
                            Edit
                          </Link>
                        )}
                        {can('pengajian.delete') && (
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => void handleDelete(item.id)}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
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
