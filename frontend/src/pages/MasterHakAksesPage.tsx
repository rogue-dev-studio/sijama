import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterFiturService, masterHakAksesService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Fitur, HakAkses, HakAksesInput, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const aksiOptions: HakAkses['aksi'][] = ['view', 'create', 'update', 'delete', 'execute']

const emptyForm: HakAksesInput = {
  fitur_id: 0,
  kode: '',
  nama: '',
  aksi: 'view',
}

export function MasterHakAksesPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<HakAkses[]>([])
  const [fiturs, setFiturs] = useState<Fitur[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<HakAksesInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [fiturFilter, setFiturFilter] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await masterHakAksesService.list({
        q: search || undefined,
        fitur_id: fiturFilter || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat hak akses')
    } finally {
      setLoading(false)
    }
  }, [search, fiturFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    async function loadFiturs() {
      try {
        const result = await masterFiturService.list({ per_page: 100 })
        setFiturs(result.items)
      } catch {
        setFiturs([])
      }
    }
    void loadFiturs()
  }, [])

  function resetForm() {
    setForm({ ...emptyForm, fitur_id: fiturs[0]?.id ?? 0 })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: HakAkses) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      fitur_id: item.fitur_id,
      kode: item.kode,
      nama: item.nama,
      aksi: item.aksi,
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await masterHakAksesService.update(editingId, form)
      } else {
        await masterHakAksesService.create(form)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan hak akses')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: HakAkses) {
    if (!window.confirm(`Hapus hak akses "${item.nama}"?`)) return
    setError(null)
    try {
      await masterHakAksesService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus hak akses')
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
    setFiturFilter(0)
    setPage(1)
  }

  const hasActiveFilters = search !== '' || fiturFilter > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Hak Akses</h1>
            <p>Kelola permission per fitur.</p>
          </div>
          {can('hak_akses.create') && fiturs.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah hak akses
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama hak akses…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari hak akses"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_fitur">Fitur</label>
            <select
              id="filter_fitur"
              value={fiturFilter}
              onChange={(event) => {
                setFiturFilter(Number(event.target.value))
                setPage(1)
              }}
            >
              <option value={0}>Semua</option>
              {fiturs.map((fitur) => (
                <option key={fitur.id} value={fitur.id}>
                  {fitur.nama} ({fitur.kode})
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

      {showForm && (can('hak_akses.create') || can('hak_akses.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="fitur_id">Fitur</label>
              <select
                id="fitur_id"
                value={form.fitur_id || ''}
                onChange={(event) => setForm({ ...form, fitur_id: Number(event.target.value) })}
                required
              >
                <option value="" disabled>
                  Pilih fitur
                </option>
                {fiturs.map((fitur) => (
                  <option key={fitur.id} value={fitur.id}>
                    {fitur.nama} ({fitur.kode})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="aksi">Aksi</label>
              <select
                id="aksi"
                value={form.aksi}
                onChange={(event) =>
                  setForm({ ...form, aksi: event.target.value as HakAkses['aksi'] })
                }
                required
              >
                {aksiOptions.map((aksi) => (
                  <option key={aksi} value={aksi}>
                    {aksi}
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
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : editingId ? 'Perbarui' : 'Simpan'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={resetForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading-state">Memuat hak akses…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada hak akses yang cocok.' : 'Belum ada data hak akses.'}
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
                  <th>Aksi</th>
                  <th>Fitur</th>
                  <th>Kelola</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    <td>{item.kode}</td>
                    <td>{item.nama}</td>
                    <td>{item.aksi}</td>
                    <td>
                      {item.fitur?.nama ||
                        fiturs.find((fitur) => fitur.id === item.fitur_id)?.nama ||
                        item.fitur_id}
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('hak_akses.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('hak_akses.delete') && (
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
