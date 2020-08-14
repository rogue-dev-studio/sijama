import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterMenuService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { MENU_ICON_NAMES, MenuIcon } from '../components/MenuIcon'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Menu, MenuInput, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: MenuInput = {
  parent_id: null,
  kode: '',
  nama: '',
  path: '',
  icon: '',
  urutan: 0,
  is_active: true,
}

export function MasterMenuPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Menu[]>([])
  const [allMenus, setAllMenus] = useState<Menu[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<MenuInput>(emptyForm)
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
      const result = await masterMenuService.list({
        q: search || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat menu')
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    async function loadAllMenus() {
      try {
        const result = await masterMenuService.list({ per_page: 100 })
        setAllMenus(result.items)
      } catch {
        setAllMenus([])
      }
    }
    void loadAllMenus()
  }, [])

  async function reloadAllMenus() {
    try {
      const result = await masterMenuService.list({ per_page: 100 })
      setAllMenus(result.items)
    } catch {
      setAllMenus([])
    }
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: Menu) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      parent_id: item.parent_id,
      kode: item.kode,
      nama: item.nama,
      path: item.path || '',
      icon: item.icon || '',
      urutan: item.urutan,
      is_active: item.is_active,
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: MenuInput = {
      ...form,
      parent_id: form.parent_id || null,
      path: form.path || null,
      icon: form.icon || null,
    }

    try {
      if (editingId) {
        await masterMenuService.update(editingId, payload)
      } else {
        await masterMenuService.create(payload)
      }
      resetForm()
      await reloadAllMenus()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan menu')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: Menu) {
    if (!window.confirm(`Hapus menu "${item.nama}"?`)) return
    setError(null)
    try {
      await masterMenuService.remove(item.id)
      await reloadAllMenus()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus menu')
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
    setPage(1)
  }

  const hasActiveFilters = search !== ''
  const parentOptions = allMenus.filter((item) => item.id !== editingId)

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Menu</h1>
            <p>Kelola struktur navigasi aplikasi.</p>
          </div>
          {can('menu.create') && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah menu
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama menu…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari menu"
          />
        </form>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {showForm && (can('menu.create') || can('menu.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
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
              <label htmlFor="parent_id">Parent</label>
              <select
                id="parent_id"
                value={form.parent_id ?? ''}
                onChange={(event) =>
                  setForm({
                    ...form,
                    parent_id: event.target.value ? Number(event.target.value) : null,
                  })
                }
              >
                <option value="">— Root —</option>
                {parentOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="path">Path</label>
              <input
                id="path"
                value={form.path || ''}
                onChange={(event) => setForm({ ...form, path: event.target.value })}
                placeholder="/jamaah"
              />
            </div>
            <div className="field">
              <label htmlFor="icon">Icon</label>
              <div className="field-control field-control--icon-pick">
                <span className="field-control__icon" aria-hidden>
                  <MenuIcon name={form.icon || 'circle'} size={16} />
                </span>
                <select
                  id="icon"
                  value={form.icon || ''}
                  onChange={(event) => setForm({ ...form, icon: event.target.value })}
                >
                  <option value="">— Pilih icon —</option>
                  {MENU_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="urutan">Urutan</label>
              <input
                id="urutan"
                type="number"
                min={0}
                value={form.urutan ?? 0}
                onChange={(event) => setForm({ ...form, urutan: Number(event.target.value) })}
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

      {loading && <div className="loading-state">Memuat menu…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada menu yang cocok.' : 'Belum ada data menu.'}
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
                  <th>Icon</th>
                  <th>Path</th>
                  <th>Parent</th>
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
                      <span className="menu-icon-cell" title={item.icon || undefined}>
                        <MenuIcon name={item.icon} size={16} />
                        <span>{item.icon || '—'}</span>
                      </span>
                    </td>
                    <td>{item.path || '—'}</td>
                    <td>
                      {item.parent_id
                        ? allMenus.find((parent) => parent.id === item.parent_id)?.nama || item.parent_id
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('menu.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('menu.delete') && (
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
