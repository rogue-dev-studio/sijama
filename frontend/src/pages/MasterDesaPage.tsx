import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterDaerahService, masterDesaService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Daerah, Desa, DesaInput, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: DesaInput = {
  daerah_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterDesaPage() {
  const { can } = useAuth()
  const [daerahList, setDaerahList] = useState<Daerah[]>([])
  const [filterDaerahId, setFilterDaerahId] = useState<number>(0)
  const [items, setItems] = useState<Desa[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<DesaInput>(emptyForm)
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
      const result = await masterDesaService.list({
        q: search || undefined,
        daerah_id: filterDaerahId || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat desa')
    } finally {
      setLoading(false)
    }
  }, [search, filterDaerahId, page, perPage])

  useEffect(() => {
    async function init() {
      try {
        const result = await masterDaerahService.list({ per_page: 100 })
        setDaerahList(result.items)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat daerah')
      }
    }
    void init()
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm(daerahId?: number) {
    setForm({
      ...emptyForm,
      daerah_id: daerahId ?? (filterDaerahId > 0 ? filterDaerahId : daerahList[0]?.id ?? 0),
    })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: Desa) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      daerah_id: item.daerah_id,
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

    const payload: DesaInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (editingId) {
        await masterDesaService.update(editingId, payload)
      } else {
        await masterDesaService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan desa')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: Desa) {
    if (!window.confirm(`Hapus desa "${item.nama}"?`)) return
    setError(null)
    try {
      await masterDesaService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus desa')
    }
  }

  function handleFilterChange(daerahId: number) {
    setFilterDaerahId(daerahId)
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
    setFilterDaerahId(0)
    setPage(1)
  }

  const hasActiveFilters = search !== '' || filterDaerahId > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Desa</h1>
            <p>Kelola desa per daerah dalam hierarki SIJAMA.</p>
          </div>
          {can('desa.create') && daerahList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah desa
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama desa…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari desa"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_daerah">Daerah</label>
            <select
              id="filter_daerah"
              value={filterDaerahId}
              onChange={(event) => handleFilterChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {daerahList.map((item) => (
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

      {showForm && (can('desa.create') || can('desa.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="daerah_id">Daerah</label>
              <select
                id="daerah_id"
                value={form.daerah_id || ''}
                onChange={(event) => setForm({ ...form, daerah_id: Number(event.target.value) })}
                required
              >
                <option value="" disabled>
                  Pilih daerah
                </option>
                {daerahList.map((item) => (
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

      {loading && <div className="loading-state">Memuat desa…</div>}

      {!loading && daerahList.length === 0 && (
        <div className="empty-state">Tambahkan daerah terlebih dahulu.</div>
      )}

      {!loading && daerahList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada desa yang cocok.' : 'Belum ada data desa.'}
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
                  <th>Daerah</th>
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
                    <td>{item.daerah?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('desa.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('desa.delete') && (
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
