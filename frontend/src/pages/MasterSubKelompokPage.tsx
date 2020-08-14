/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 22:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 22:40:00
 */
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterKelompokService, masterSubKelompokService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Kelompok, PaginationMeta, SubKelompok, SubKelompokInput } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: SubKelompokInput = {
  kelompok_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterSubKelompokPage() {
  const { can } = useAuth()
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [filterKelompokId, setFilterKelompokId] = useState(0)
  const [items, setItems] = useState<SubKelompok[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<SubKelompokInput>(emptyForm)
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
      const result = await masterSubKelompokService.list({
        q: search || undefined,
        kelompok_id: filterKelompokId || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat sub kelompok')
    } finally {
      setLoading(false)
    }
  }, [search, filterKelompokId, page, perPage])

  useEffect(() => {
    async function init() {
      try {
        const result = await masterKelompokService.list({ per_page: 10000 })
        setKelompokList(result.items)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat kelompok')
      }
    }
    void init()
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm() {
    setForm({
      ...emptyForm,
      kelompok_id: filterKelompokId > 0 ? filterKelompokId : (kelompokList[0]?.id ?? 0),
    })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: SubKelompok) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      kelompok_id: item.kelompok_id,
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
    const payload: SubKelompokInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }
    try {
      if (editingId) {
        await masterSubKelompokService.update(editingId, payload)
      } else {
        await masterSubKelompokService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan sub kelompok')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: SubKelompok) {
    if (!window.confirm(`Hapus sub kelompok "${item.nama}"?`)) return
    setError(null)
    try {
      await masterSubKelompokService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus sub kelompok')
    }
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  const hasActiveFilters = search !== '' || filterKelompokId > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Sub Kelompok</h1>
            <p>Kelola sub kelompok di bawah kelompok fungsional.</p>
          </div>
          {can('sub_kelompok.create') && kelompokList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah sub kelompok
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama sub kelompok…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari sub kelompok"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_kelompok">Kelompok</label>
            <select
              id="filter_kelompok"
              value={filterKelompokId}
              onChange={(event) => {
                setFilterKelompokId(Number(event.target.value))
                setPage(1)
              }}
            >
              <option value={0}>Semua</option>
              {kelompokList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn--secondary btn--small"
            onClick={() => {
              setQuery('')
              setSearch('')
              setFilterKelompokId(0)
              setPage(1)
            }}
          >
            Hapus filter
          </button>
        )}
      </div>

      {showForm && (can('sub_kelompok.create') || can('sub_kelompok.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="kelompok_id">Kelompok</label>
              <select
                id="kelompok_id"
                value={form.kelompok_id || ''}
                onChange={(event) => setForm({ ...form, kelompok_id: Number(event.target.value) })}
                required
              >
                <option value="" disabled>
                  Pilih kelompok
                </option>
                {kelompokList.map((item) => (
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
            <div className="field form-grid__full">
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea
                id="deskripsi"
                rows={2}
                value={form.deskripsi || ''}
                onChange={(event) => setForm({ ...form, deskripsi: event.target.value })}
              />
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={resetForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Kode</th>
              <th>Nama</th>
              <th>Kelompok</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Memuat…</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6}>Belum ada sub kelompok.</td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id}>
                  <td>{rowNumber(meta, index)}</td>
                  <td>{item.kode}</td>
                  <td>{item.nama}</td>
                  <td>{item.kelompok?.nama ?? '—'}</td>
                  <td>{item.is_active ? 'Aktif' : 'Nonaktif'}</td>
                  <td>
                    <div className="btn-group">
                      {can('sub_kelompok.update') && (
                        <button type="button" className="btn btn--secondary btn--small" onClick={() => startEdit(item)}>
                          Ubah
                        </button>
                      )}
                      {can('sub_kelompok.delete') && (
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        meta={meta}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value)
          setPage(1)
        }}
      />
    </>
  )
}
