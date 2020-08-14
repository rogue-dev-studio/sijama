/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:30:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterLokasiService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Lokasi, LokasiJenis, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const JENIS_OPTIONS: { value: LokasiJenis; label: string }[] = [
  { value: 'masjid', label: 'Masjid LDII' },
  { value: 'gsg', label: 'Gedung Serbaguna (GSG)' },
  { value: 'ppm', label: 'PPM' },
  { value: 'aula', label: 'Aula' },
  { value: 'kantor', label: 'Kantor DPW/DPD/DPP' },
  { value: 'lainnya', label: 'Lainnya' },
]

function jenisLabel(jenis: string): string {
  return JENIS_OPTIONS.find((option) => option.value === jenis)?.label || jenis
}

export function MasterLokasiPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Lokasi[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [jenisFilter, setJenisFilter] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await masterLokasiService.list({
        q: search || undefined,
        jenis: jenisFilter || undefined,
        is_active: isActiveFilter === '' ? undefined : isActiveFilter === '1',
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat lokasi')
    } finally {
      setLoading(false)
    }
  }, [search, jenisFilter, isActiveFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(item: Lokasi) {
    if (!window.confirm(`Hapus lokasi "${item.nama}"?`)) return
    setError(null)
    try {
      await masterLokasiService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus lokasi')
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
    setJenisFilter('')
    setIsActiveFilter('')
    setPage(1)
  }

  const hasActiveFilters = search !== '' || jenisFilter !== '' || isActiveFilter !== ''
  const wilayahLabel = (item: Lokasi) =>
    [item.adm_desa_kelurahan?.nama, item.adm_kecamatan?.nama, item.adm_kabupaten_kota?.nama]
      .filter(Boolean)
      .join(', ') ||
    item.kota ||
    '—'

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Lokasi</h1>
            <p>Lokasi kegiatan terhubung ke master wilayah administrasi.</p>
          </div>
          {can('lokasi.create') && (
            <Link to="/master/lokasi/new" className="btn btn--primary">
              Tambah lokasi
            </Link>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama lokasi…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari lokasi"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_jenis">Jenis</label>
            <select
              id="filter_jenis"
              value={jenisFilter}
              onChange={(event) => {
                setJenisFilter(event.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua</option>
              {JENIS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
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

      {loading && <div className="loading-state">Memuat lokasi…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada lokasi yang cocok.' : 'Belum ada data lokasi.'}
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
                  <th>Jenis</th>
                  <th>Wilayah</th>
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
                    <td>{jenisLabel(item.jenis)}</td>
                    <td>{wilayahLabel(item)}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('lokasi.update') && (
                          <Link
                            to={`/master/lokasi/${item.id}/edit`}
                            className="btn btn--secondary btn--small"
                          >
                            Edit
                          </Link>
                        )}
                        {can('lokasi.delete') && (
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
