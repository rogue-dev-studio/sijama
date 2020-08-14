import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterDaerahService, masterPusatService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Daerah, DaerahInput, PaginationMeta, Pusat } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: DaerahInput = {
  pusat_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterDaerahPage() {
  const { can } = useAuth()
  const [pusatList, setPusatList] = useState<Pusat[]>([])
  const [filterPusatId, setFilterPusatId] = useState<number>(0)
  const [items, setItems] = useState<Daerah[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<DaerahInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await masterDaerahService.list({
        q: search || undefined,
        pusat_id: filterPusatId || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat daerah')
    } finally {
      setLoading(false)
    }
  }, [search, filterPusatId, page, perPage])

  useEffect(() => {
    async function init() {
      try {
        const result = await masterPusatService.list({ per_page: 100 })
        setPusatList(result.items)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat pusat')
      }
    }
    void init()
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm(pusatId?: number) {
    setForm({
      ...emptyForm,
      pusat_id: pusatId ?? (filterPusatId > 0 ? filterPusatId : pusatList[0]?.id ?? 0),
    })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: Daerah) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      pusat_id: item.pusat_id,
      kode: item.kode,
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      is_active: item.is_active,
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: DaerahInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (editingId) {
        await masterDaerahService.update(editingId, payload)
      } else {
        await masterDaerahService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan daerah')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: Daerah) {
    if (!window.confirm(`Hapus daerah "${item.nama}"?`)) return
    setError(null)
    try {
      await masterDaerahService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus daerah')
    }
  }

  function handleFilterChange(pusatId: number) {
    setFilterPusatId(pusatId)
    setPage(1)
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setFilterPusatId(0)
    setPage(1)
  }

  const hasActiveFilters = search !== '' || filterPusatId > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Daerah</h1>
            <p>Kelola wilayah daerah per pusat dalam hierarki SIJAMA.</p>
          </div>
          {can('daerah.create') && pusatList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah daerah
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama daerah…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari daerah"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_pusat">Pusat</label>
            <select
              id="filter_pusat"
              value={filterPusatId}
              onChange={(event) => handleFilterChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {pusatList.map((item) => (
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

      {showForm && (can('daerah.create') || can('daerah.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="pusat_id">Pusat</label>
              <select
                id="pusat_id"
                value={form.pusat_id || ''}
                onChange={(event) => setForm({ ...form, pusat_id: Number(event.target.value) })}
                required
              >
                <option value="" disabled>
                  Pilih pusat
                </option>
                {pusatList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="kode">Kode</label>
              <input
                id="kode"
                value={form.kode}
                onChange={(event) => setForm({ ...form, kode: event.target.value })}
                required
                disabled={!!editingId}
              />
            </div>
            <div className="field">
              <label htmlFor="nama">Nama</label>
              <input
                id="nama"
                value={form.nama}
                onChange={(event) => setForm({ ...form, nama: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="is_active">Status</label>
              <select
                id="is_active"
                value={form.is_active ? '1' : '0'}
                onChange={(event) => setForm({ ...form, is_active: event.target.value === '1' })}
              >
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea
                id="deskripsi"
                value={form.deskripsi || ''}
                onChange={(event) => setForm({ ...form, deskripsi: event.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Simpan'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => resetForm()}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading-state">Memuat daerah…</div>}

      {!loading && pusatList.length === 0 && (
        <div className="empty-state">Tambahkan pusat terlebih dahulu.</div>
      )}

      {!loading && pusatList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada daerah yang cocok.' : 'Belum ada data daerah.'}
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
                  <th>Pusat</th>
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
                    <td>{item.pusat?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('daerah.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('daerah.delete') && (
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
