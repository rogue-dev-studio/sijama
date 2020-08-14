/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:57:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:57:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { admNegaraService, admProvinsiService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { AdmNegara, AdmProvinsi, AdmProvinsiInput, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: AdmProvinsiInput = {
  negara_id: 0,
  kode: '',
  nama: '',
  is_active: true,
}

export function MasterAdmProvinsiPage() {
  const { can } = useAuth()
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [filterNegaraId, setFilterNegaraId] = useState<number>(0)
  const [items, setItems] = useState<AdmProvinsi[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<AdmProvinsiInput>(emptyForm)
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
      const result = await admProvinsiService.list({
        q: search || undefined,
        negara_id: filterNegaraId || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat provinsi')
    } finally {
      setLoading(false)
    }
  }, [search, filterNegaraId, page, perPage])

  useEffect(() => {
    async function init() {
      try {
        const result = await admNegaraService.list({ per_page: 100 })
        setNegaraList(result.items)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat negara')
      }
    }
    void init()
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm(negaraId?: number) {
    setForm({
      ...emptyForm,
      negara_id: negaraId ?? (filterNegaraId > 0 ? filterNegaraId : negaraList[0]?.id ?? 0),
    })
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(item: AdmProvinsi) {
    setEditingId(item.id)
    setShowForm(true)
    setForm({
      negara_id: item.negara_id,
      kode: item.kode,
      nama: item.nama,
      is_active: item.is_active,
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await admProvinsiService.update(editingId, form)
      } else {
        await admProvinsiService.create(form)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan provinsi')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: AdmProvinsi) {
    if (!window.confirm(`Hapus provinsi "${item.nama}"?`)) return
    setError(null)
    try {
      await admProvinsiService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus provinsi')
    }
  }

  function handleFilterChange(negaraId: number) {
    setFilterNegaraId(negaraId)
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
    setFilterNegaraId(0)
    setPage(1)
  }

  const hasActiveFilters = search !== '' || filterNegaraId > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Provinsi</h1>
            <p>Kelola provinsi per negara dalam wilayah administrasi.</p>
          </div>
          {can('adm_provinsi.create') && negaraList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah provinsi
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama provinsi…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari provinsi"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_negara">Negara</label>
            <select
              id="filter_negara"
              value={filterNegaraId}
              onChange={(event) => handleFilterChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {negaraList.map((item) => (
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

      {showForm && (can('adm_provinsi.create') || can('adm_provinsi.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="negara_id">Negara</label>
              <select
                id="negara_id"
                value={form.negara_id || ''}
                onChange={(event) => setForm({ ...form, negara_id: Number(event.target.value) })}
                required
              >
                <option value="" disabled>
                  Pilih negara
                </option>
                {negaraList.map((item) => (
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

      {loading && <div className="loading-state">Memuat provinsi…</div>}

      {!loading && negaraList.length === 0 && (
        <div className="empty-state">Tambahkan negara terlebih dahulu.</div>
      )}

      {!loading && negaraList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada provinsi yang cocok.' : 'Belum ada data provinsi.'}
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
                  <th>Negara</th>
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
                    <td>{item.negara?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('adm_provinsi.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('adm_provinsi.delete') && (
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
