import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterDapukanService, masterUserService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Dapukan, MasterUser, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

export function MasterUsersPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<MasterUser[]>([])
  const [dapukanList, setDapukanList] = useState<Dapukan[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('')
  const [dapukanFilter, setDapukanFilter] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      })
      setItems(users.items)
      setMeta(users.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat pengguna')
    } finally {
      setLoading(false)
    }
  }, [search, isActiveFilter, dapukanFilter, page, perPage])

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

  const hasActiveFilters = search !== '' || isActiveFilter !== '' || dapukanFilter > 0

  function formatScope(item: MasterUser) {
    const parts = [
      item.scope?.pusat?.nama,
      item.scope?.daerah?.nama,
      item.scope?.desa?.nama,
      item.scope?.kelompok?.nama,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(' → ') : '—'
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Pengguna</h1>
            <p>Akun login ditautkan ke jamaah; dapukan & cakupan dari master jamaah.</p>
          </div>
          {can('users.create') && (
            <Link to="/master/users/new" className="btn btn--primary">
              Tambah pengguna
            </Link>
          )}
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
            <select
              id="filter_status"
              value={isActiveFilter}
              onChange={(event) => {
                setIsActiveFilter(event.target.value as '' | '1' | '0')
                setPage(1)
              }}
            >
              <option value="">Semua</option>
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_dapukan">Dapukan</label>
            <select
              id="filter_dapukan"
              value={dapukanFilter}
              onChange={(event) => {
                setDapukanFilter(Number(event.target.value))
                setPage(1)
              }}
            >
              <option value={0}>Semua</option>
              {dapukanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {loading && <div className="loading-state">Memuat pengguna…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada pengguna yang cocok.' : 'Belum ada data pengguna.'}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Username</th>
                  <th>Dapukan</th>
                  <th>Cakupan</th>
                  <th>Status</th>
                  <th>Kelola</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    <td>{item.name}</td>
                    <td>{item.username}</td>
                    <td>
                      {(item.dapukan_list && item.dapukan_list.length > 0
                        ? item.dapukan_list.map((d) => d.nama).join(', ')
                        : item.dapukan?.nama) || '—'}
                    </td>
                    <td>{formatScope(item)}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('users.update') && (
                          <Link
                            to={`/master/users/${item.id}/edit`}
                            className="btn btn--secondary btn--small"
                          >
                            Edit
                          </Link>
                        )}
                        {can('users.update') && item.is_active && (
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => void handleDeactivate(item)}
                          >
                            Nonaktifkan
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
