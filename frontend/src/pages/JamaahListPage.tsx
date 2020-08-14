import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { jamaahService, masterKelompokService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Jamaah, Kelompok, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { KATEGORI_UMUR_OPTIONS, kategoriUmurLabel } from '../lib/jamaahOptions'

export function JamaahListPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Jamaah[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [faceFilter, setFaceFilter] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState(0)
  const [kategoriUmurFilter, setKategoriUmurFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await jamaahService.list({
        q: search || undefined,
        status: statusFilter || undefined,
        face: faceFilter || undefined,
        kelompok_id: kelompokFilter || undefined,
        kategori_umur: kategoriUmurFilter || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat jamaah')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, faceFilter, kelompokFilter, kategoriUmurFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    async function loadKelompok() {
      try {
        const result = await masterKelompokService.list({ per_page: 100 })
        setKelompokList(result.items)
      } catch {
        setKelompokList([])
      }
    }
    void loadKelompok()
  }, [])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function handleFilterChange(
    key: 'status' | 'face' | 'kelompok' | 'kategori_umur',
    value: string | number,
  ) {
    if (key === 'status') setStatusFilter(String(value))
    if (key === 'face') setFaceFilter(String(value))
    if (key === 'kelompok') setKelompokFilter(Number(value))
    if (key === 'kategori_umur') setKategoriUmurFilter(String(value))
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setStatusFilter('')
    setFaceFilter('')
    setKelompokFilter(0)
    setKategoriUmurFilter('')
    setPage(1)
  }

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== '' ||
    faceFilter !== '' ||
    kelompokFilter > 0 ||
    kategoriUmurFilter !== ''

  async function handleDelete(id: number, nama: string) {
    if (!window.confirm(`Hapus jamaah "${nama}"?`)) return
    try {
      await jamaahService.remove(id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus jamaah')
    }
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Jamaah</h1>
            <p>Kelola data jamaah dan pendaftaran wajah.</p>
          </div>
          {can('jamaah.create') && (
            <Link to="/jamaah/new" className="btn btn--primary">
              Tambah jamaah
            </Link>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari nama, NIK, email, atau HP…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari jamaah"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_status">Status</label>
            <select
              id="filter_status"
              value={statusFilter}
              onChange={(event) => handleFilterChange('status', event.target.value)}
            >
              <option value="">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_face">Wajah</label>
            <select
              id="filter_face"
              value={faceFilter}
              onChange={(event) => handleFilterChange('face', event.target.value)}
            >
              <option value="">Semua</option>
              <option value="enrolled">Terdaftar</option>
              <option value="pending">Belum</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_kelompok">Kelompok</label>
            <select
              id="filter_kelompok"
              value={kelompokFilter}
              onChange={(event) => handleFilterChange('kelompok', event.target.value)}
            >
              <option value={0}>Semua</option>
              {kelompokList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_kategori_umur">Kategori umur</label>
            <select
              id="filter_kategori_umur"
              value={kategoriUmurFilter}
              onChange={(event) => handleFilterChange('kategori_umur', event.target.value)}
            >
              <option value="">Semua</option>
              {KATEGORI_UMUR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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

      {loading && <div className="loading-state">Memuat jamaah…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada jamaah yang cocok.' : 'Belum ada data jamaah.'}
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
                  <th>Kelompok</th>
                  <th>Kategori</th>
                  <th>NIK</th>
                  <th>Kontak</th>
                  <th>Status</th>
                  <th>Wajah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    <td>{item.nama}</td>
                    <td>{item.kelompok?.nama || '—'}</td>
                    <td>{item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur)}</td>
                    <td>{item.nik || '—'}</td>
                    <td>
                      {item.no_hp}
                      {item.email ? ` · ${item.email}` : ''}
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'aktif' ? 'badge--ok' : 'badge--muted'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.face_enrolled ? 'badge--ok' : 'badge--muted'}`}>
                        {item.face_enrolled ? 'Terdaftar' : 'Belum'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('jamaah.update') && (
                          <Link to={`/jamaah/${item.id}/edit`} className="btn btn--secondary btn--small">
                            Edit
                          </Link>
                        )}
                        {can('jamaah.enroll_face') && (
                          <Link to={`/jamaah/${item.id}/face`} className="btn btn--secondary btn--small">
                            Wajah
                          </Link>
                        )}
                        {can('jamaah.delete') && (
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => void handleDelete(item.id, item.nama)}
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
