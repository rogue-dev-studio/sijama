import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterFiturService, masterMenuService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Fitur, FiturInput, Menu, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: FiturInput = {
  menu_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterFiturPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Fitur[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<FiturInput>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [menuFilter, setMenuFilter] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await masterFiturService.list({
        q: search || undefined,
        menu_id: menuFilter || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat fitur')
    } finally {
      setLoading(false)
    }
  }, [search, menuFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    async function loadMenus() {
      try {
        const result = await masterMenuService.list({ per_page: 100 })
        setMenus(result.items)
      } catch {
        setMenus([])
      }
    }
    void loadMenus()
  }, [])

  function resetForm() {
    setForm({ ...emptyForm, menu_id: menus[0]?.id ?? 0 })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: Fitur) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      menu_id: item.menu_id,
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

    const payload: FiturInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (editingId) {
        await masterFiturService.update(editingId, payload)
      } else {
        await masterFiturService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan fitur')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: Fitur) {
    if (!window.confirm(`Hapus fitur "${item.nama}"?`)) return
    setError(null)
    try {
      await masterFiturService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus fitur')
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
    setMenuFilter(0)
    setPage(1)
  }

  const hasActiveFilters = search !== '' || menuFilter > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Fitur</h1>
            <p>Kelola fitur per menu navigasi.</p>
          </div>
          {can('fitur.create') && menus.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah fitur
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama fitur…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari fitur"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_menu">Menu</label>
            <select
              id="filter_menu"
              value={menuFilter}
              onChange={(event) => {
                setMenuFilter(Number(event.target.value))
                setPage(1)
              }}
            >
              <option value={0}>Semua</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.nama}
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

      {showForm && (can('fitur.create') || can('fitur.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="menu_id">Menu</label>
              <select
                id="menu_id"
                value={form.menu_id || ''}
                onChange={(event) => setForm({ ...form, menu_id: Number(event.target.value) })}
                required
              >
                <option value="" disabled>
                  Pilih menu
                </option>
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.nama}
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
            <button type="button" className="btn btn--secondary" onClick={resetForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading-state">Memuat fitur…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada fitur yang cocok.' : 'Belum ada data fitur.'}
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
                  <th>Menu</th>
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
                    <td>{item.menu?.nama || menus.find((menu) => menu.id === item.menu_id)?.nama || item.menu_id}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('fitur.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('fitur.delete') && (
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
