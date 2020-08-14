import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { masterDaerahService, masterDesaService, masterKelompokService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type { Daerah, Desa, Kelompok, KelompokInput, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: KelompokInput = {
  desa_id: 0,
  kode: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterKelompokPage() {
  const { can } = useAuth()
  const [daerahList, setDaerahList] = useState<Daerah[]>([])
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [filterDaerahId, setFilterDaerahId] = useState<number>(0)
  const [filterDesaId, setFilterDesaId] = useState<number>(0)
  const [items, setItems] = useState<Kelompok[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<KelompokInput>(emptyForm)
  const [formDaerahId, setFormDaerahId] = useState<number>(0)
  const [formDesaList, setFormDesaList] = useState<Desa[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await masterKelompokService.list({
        q: search || undefined,
        desa_id: filterDesaId || undefined,
        daerah_id: filterDaerahId || undefined,
        is_active: isActiveFilter === '' ? undefined : isActiveFilter === '1',
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kelompok')
    } finally {
      setLoading(false)
    }
  }, [search, filterDesaId, filterDaerahId, isActiveFilter, page, perPage])

  async function loadDesaForDaerah(daerahId: number) {
    const result = await masterDesaService.list({
      daerah_id: daerahId || undefined,
      per_page: 10000,
    })
    return result.items
  }

  useEffect(() => {
    async function init() {
      try {
        const [daerahResult, desaItems] = await Promise.all([
          masterDaerahService.list({ per_page: 10000 }),
          loadDesaForDaerah(0),
        ])
        setDaerahList(daerahResult.items)
        setDesaList(desaItems)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat data')
      }
    }
    void init()
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleFilterDaerahChange(daerahId: number) {
    setFilterDaerahId(daerahId)
    setFilterDesaId(0)
    setPage(1)
    try {
      setDesaList(await loadDesaForDaerah(daerahId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat desa')
    }
  }

  function handleFilterDesaChange(desaId: number) {
    setFilterDesaId(desaId)
    setPage(1)
  }

  async function loadFormDesa(daerahId: number, selectedDesaId?: number) {
    const desaItems = daerahId > 0 ? await loadDesaForDaerah(daerahId) : []
    setFormDesaList(desaItems)
    const nextDesaId = selectedDesaId ?? desaItems[0]?.id ?? 0
    setForm((prev) => ({ ...prev, desa_id: nextDesaId }))
    return nextDesaId
  }

  function resetForm() {
    const daerahId = filterDaerahId > 0 ? filterDaerahId : (daerahList[0]?.id ?? 0)
    setFormDaerahId(daerahId)
    setForm({ ...emptyForm, desa_id: filterDesaId > 0 ? filterDesaId : 0 })
    setEditingId(null)
    setShowForm(false)
    void loadFormDesa(daerahId, filterDesaId > 0 ? filterDesaId : undefined)
  }

  async function startEdit(item: Kelompok) {
    setEditingId(item.id)
    setShowForm(true)

    const daerahId = item.desa?.daerah_id ?? filterDaerahId
    setFormDaerahId(daerahId)
    await loadFormDesa(daerahId, item.desa_id)

    setForm({
      desa_id: item.desa_id,
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

    const payload: KelompokInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (editingId) {
        await masterKelompokService.update(editingId, payload)
      } else {
        await masterKelompokService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kelompok')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: Kelompok) {
    if (!window.confirm(`Hapus kelompok "${item.nama}"?`)) return
    setError(null)
    try {
      await masterKelompokService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus kelompok')
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
    setFilterDaerahId(0)
    setFilterDesaId(0)
    setIsActiveFilter('')
    setPage(1)
    void (async () => {
      try {
        setDesaList(await loadDesaForDaerah(0))
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat filter')
      }
    })()
  }

  const hasActiveFilters =
    search !== '' || filterDaerahId > 0 || filterDesaId > 0 || isActiveFilter !== ''

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Kelompok</h1>
            <p>Kelola kelompok jamaah per desa.</p>
          </div>
          {can('kelompok.create') && daerahList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah kelompok
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama kelompok…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari kelompok"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_daerah">Daerah</label>
            <select
              id="filter_daerah"
              value={filterDaerahId}
              onChange={(event) => void handleFilterDaerahChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {daerahList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_desa">Desa</label>
            <select
              id="filter_desa"
              value={filterDesaId}
              onChange={(event) => handleFilterDesaChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {desaList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
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

      {showForm && (can('kelompok.create') || can('kelompok.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="form_daerah">Daerah</label>
              <select
                id="form_daerah"
                value={formDaerahId || ''}
                onChange={(event) => {
                  const daerahId = Number(event.target.value)
                  setFormDaerahId(daerahId)
                  void loadFormDesa(daerahId)
                }}
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
              <label htmlFor="desa_id">Desa</label>
              <select
                id="desa_id"
                value={form.desa_id || ''}
                onChange={(event) => setForm({ ...form, desa_id: Number(event.target.value) })}
                required
                disabled={formDesaList.length === 0}
              >
                <option value="" disabled>
                  Pilih desa
                </option>
                {formDesaList.map((item) => (
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
            <button type="button" className="btn btn--secondary" onClick={resetForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading-state">Memuat kelompok…</div>}

      {!loading && daerahList.length === 0 && (
        <div className="empty-state">Tambahkan daerah terlebih dahulu.</div>
      )}

      {!loading && daerahList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada kelompok yang cocok.' : 'Belum ada data kelompok.'}
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
                  <th>Desa</th>
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
                    <td>{item.desa?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('kelompok.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => void startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('kelompok.delete') && (
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
