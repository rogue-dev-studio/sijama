/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:45:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterKategoriKegiatanService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { KategoriKegiatan, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

export function MasterKategoriKegiatanPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<KategoriKegiatan[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await masterKategoriKegiatanService.list({
        q: search || undefined,
        is_active: isActiveFilter === '' ? undefined : isActiveFilter === '1',
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kategori kegiatan')
    } finally {
      setLoading(false)
    }
  }, [search, isActiveFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(item: KategoriKegiatan) {
    if (!window.confirm(`Hapus kategori "${item.nama}"?`)) return
    setError(null)
    try {
      await masterKategoriKegiatanService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus kategori kegiatan')
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
    setPage(1)
  }

  const hasActiveFilters = search !== '' || isActiveFilter !== ''

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Kategori Kegiatan</h1>
            <p>Kelola kategori untuk klasifikasi kegiatan jamaah.</p>
          </div>
          {can('kategori_kegiatan.create') && (
            <Link to="/master/kategori-kegiatan/new" className="btn btn--primary">
              Tambah kategori
            </Link>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama kategori…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari kategori kegiatan"
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
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {loading && <div className="loading-state">Memuat kategori kegiatan…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters
            ? 'Tidak ada kategori yang cocok.'
            : 'Belum ada data kategori kegiatan.'}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Warna</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    <td>{item.kode}</td>
                    <td>{item.nama}</td>
                    <td>
                      <span className="calendar-legend__item">
                        <span
                          className="calendar-legend__swatch"
                          style={{ backgroundColor: item.calendar_color || '#2563eb' }}
                        />
                        {item.calendar_color || '#2563eb'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('kategori_kegiatan.update') && (
                          <Link
                            to={`/master/kategori-kegiatan/${item.id}/edit`}
                            className="btn btn--secondary btn--small"
                          >
                            Edit
                          </Link>
                        )}
                        {can('kategori_kegiatan.delete') && (
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => void handleDelete(item)}
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
