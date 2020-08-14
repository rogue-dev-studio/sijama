/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:58:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:58:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterPusatService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { PaginationMeta, Pusat, PusatInput } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: PusatInput = {
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterPusatPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Pusat[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<PusatInput>(emptyForm)
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
      const result = await masterPusatService.list({
        q: search || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat pusat')
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: Pusat) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
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

    const payload: PusatInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (editingId) {
        await masterPusatService.update(editingId, payload)
      } else {
        await masterPusatService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan pusat')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: Pusat) {
    if (!window.confirm(`Hapus pusat "${item.nama}"?`)) return
    setError(null)
    try {
      await masterPusatService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus pusat')
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

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Pusat</h1>
            <p>Kelola wilayah pusat sebagai induk tertinggi hierarki SIJAMA.</p>
          </div>
          {can('pusat.create') && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah pusat
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama pusat…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari pusat"
          />
        </form>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {showForm && (can('pusat.create') || can('pusat.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
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
            <button type="button" className="btn btn--secondary" onClick={resetForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading-state">Memuat pusat…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada pusat yang cocok.' : 'Belum ada data pusat.'}
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
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('pusat.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('pusat.delete') && (
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
