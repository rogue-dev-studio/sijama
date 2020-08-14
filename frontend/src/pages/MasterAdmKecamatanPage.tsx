/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:54:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:54:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import {
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
} from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type {
  AdmKabupatenKota,
  AdmKecamatan,
  AdmKecamatanInput,
  AdmNegara,
  AdmProvinsi,
  PaginationMeta,
} from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: AdmKecamatanInput = {
  kabupaten_kota_id: 0,
  kode: '',
  nama: '',
  is_active: true,
}

export function MasterAdmKecamatanPage() {
  const { can } = useAuth()
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [filterNegaraId, setFilterNegaraId] = useState<number>(0)
  const [filterProvinsiId, setFilterProvinsiId] = useState<number>(0)
  const [filterKabupatenKotaId, setFilterKabupatenKotaId] = useState<number>(0)
  const [items, setItems] = useState<AdmKecamatan[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<AdmKecamatanInput>(emptyForm)
  const [formNegaraId, setFormNegaraId] = useState<number>(0)
  const [formProvinsiId, setFormProvinsiId] = useState<number>(0)
  const [formProvinsiList, setFormProvinsiList] = useState<AdmProvinsi[]>([])
  const [formKabupatenKotaList, setFormKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
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
      const result = await admKecamatanService.list({
        q: search || undefined,
        kabupaten_kota_id: filterKabupatenKotaId || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kecamatan')
    } finally {
      setLoading(false)
    }
  }, [search, filterKabupatenKotaId, page, perPage])

  async function loadProvinsiForNegara(negaraId: number) {
    const result = await admProvinsiService.list({
      negara_id: negaraId || undefined,
      per_page: 10000,
    })
    return result.items
  }

  async function loadKabupatenKotaForProvinsi(provinsiId: number) {
    const result = await admKabupatenKotaService.list({
      provinsi_id: provinsiId || undefined,
      per_page: 10000,
    })
    return result.items
  }

  useEffect(() => {
    async function init() {
      try {
        const [negaraResult, provinsiItems, kabupatenKotaItems] = await Promise.all([
          admNegaraService.list({ per_page: 10000 }),
          loadProvinsiForNegara(0),
          loadKabupatenKotaForProvinsi(0),
        ])
        setNegaraList(negaraResult.items)
        setProvinsiList(provinsiItems)
        setKabupatenKotaList(kabupatenKotaItems)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat data')
      }
    }
    void init()
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleFilterNegaraChange(negaraId: number) {
    setFilterNegaraId(negaraId)
    setFilterProvinsiId(0)
    setFilterKabupatenKotaId(0)
    setPage(1)
    try {
      const [provinsiItems, kabupatenKotaItems] = await Promise.all([
        loadProvinsiForNegara(negaraId),
        loadKabupatenKotaForProvinsi(0),
      ])
      setProvinsiList(provinsiItems)
      setKabupatenKotaList(kabupatenKotaItems)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat provinsi')
    }
  }

  async function handleFilterProvinsiChange(provinsiId: number) {
    setFilterProvinsiId(provinsiId)
    setFilterKabupatenKotaId(0)
    setPage(1)
    try {
      setKabupatenKotaList(await loadKabupatenKotaForProvinsi(provinsiId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kabupaten/kota')
    }
  }

  function handleFilterKabupatenKotaChange(kabupatenKotaId: number) {
    setFilterKabupatenKotaId(kabupatenKotaId)
    setPage(1)
  }

  async function loadFormKabupatenKota(provinsiId: number, selectedId?: number) {
    const items = provinsiId > 0 ? await loadKabupatenKotaForProvinsi(provinsiId) : []
    setFormKabupatenKotaList(items)
    const nextId = selectedId ?? items[0]?.id ?? 0
    setForm((prev) => ({ ...prev, kabupaten_kota_id: nextId }))
    return nextId
  }

  async function loadFormProvinsi(negaraId: number, selectedProvinsiId?: number) {
    const items = negaraId > 0 ? await loadProvinsiForNegara(negaraId) : []
    setFormProvinsiList(items)
    const nextProvinsiId = selectedProvinsiId ?? items[0]?.id ?? 0
    setFormProvinsiId(nextProvinsiId)
    await loadFormKabupatenKota(nextProvinsiId)
    return nextProvinsiId
  }

  function resetForm() {
    setFormNegaraId(0)
    setFormProvinsiId(0)
    setFormProvinsiList([])
    setFormKabupatenKotaList([])
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  async function startEdit(item: AdmKecamatan) {
    setEditingId(item.id)
    setShowForm(true)
    setFormNegaraId(0)
    setFormProvinsiId(0)

    const kabupatenKotaResult = await admKabupatenKotaService.list({ per_page: 100 })
    setFormKabupatenKotaList(kabupatenKotaResult.items)

    setForm({
      kabupaten_kota_id: item.kabupaten_kota_id,
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
        await admKecamatanService.update(editingId, form)
      } else {
        await admKecamatanService.create(form)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kecamatan')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: AdmKecamatan) {
    if (!window.confirm(`Hapus kecamatan "${item.nama}"?`)) return
    setError(null)
    try {
      await admKecamatanService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus kecamatan')
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
    setFilterNegaraId(0)
    setFilterProvinsiId(0)
    setFilterKabupatenKotaId(0)
    setPage(1)
    void (async () => {
      try {
        const [provinsiItems, kabupatenKotaItems] = await Promise.all([
          loadProvinsiForNegara(0),
          loadKabupatenKotaForProvinsi(0),
        ])
        setProvinsiList(provinsiItems)
        setKabupatenKotaList(kabupatenKotaItems)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat filter')
      }
    })()
  }

  const hasActiveFilters =
    search !== '' || filterNegaraId > 0 || filterProvinsiId > 0 || filterKabupatenKotaId > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Kecamatan</h1>
            <p>Kelola kecamatan per kabupaten/kota dalam wilayah administrasi.</p>
          </div>
          {can('adm_kecamatan.create') && negaraList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah kecamatan
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama kecamatan…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari kecamatan"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_negara">Negara</label>
            <select
              id="filter_negara"
              value={filterNegaraId}
              onChange={(event) => void handleFilterNegaraChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {negaraList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_provinsi">Provinsi</label>
            <select
              id="filter_provinsi"
              value={filterProvinsiId}
              onChange={(event) => void handleFilterProvinsiChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {provinsiList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_kabkota">Kabupaten/Kota</label>
            <select
              id="filter_kabkota"
              value={filterKabupatenKotaId}
              onChange={(event) => handleFilterKabupatenKotaChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {kabupatenKotaList.map((item) => (
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

      {showForm && (can('adm_kecamatan.create') || can('adm_kecamatan.update')) && (
        <form className="form-panel inline-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="form_negara">Negara</label>
              <select
                id="form_negara"
                value={formNegaraId || ''}
                onChange={(event) => {
                  const negaraId = Number(event.target.value)
                  setFormNegaraId(negaraId)
                  void loadFormProvinsi(negaraId)
                }}
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
              <label htmlFor="form_provinsi">Provinsi</label>
              <select
                id="form_provinsi"
                value={formProvinsiId || ''}
                onChange={(event) => {
                  const provinsiId = Number(event.target.value)
                  setFormProvinsiId(provinsiId)
                  void loadFormKabupatenKota(provinsiId)
                }}
                disabled={formProvinsiList.length === 0}
              >
                <option value="" disabled>
                  Pilih provinsi
                </option>
                {formProvinsiList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="kabupaten_kota_id">Kabupaten/Kota</label>
              <select
                id="kabupaten_kota_id"
                value={form.kabupaten_kota_id || ''}
                onChange={(event) =>
                  setForm({ ...form, kabupaten_kota_id: Number(event.target.value) })
                }
                required
                disabled={formKabupatenKotaList.length === 0}
              >
                <option value="" disabled>
                  Pilih kabupaten/kota
                </option>
                {formKabupatenKotaList.map((item) => (
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
            <button type="button" className="btn btn--secondary" onClick={resetForm}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading && <div className="loading-state">Memuat kecamatan…</div>}

      {!loading && negaraList.length === 0 && (
        <div className="empty-state">Tambahkan negara terlebih dahulu.</div>
      )}

      {!loading && negaraList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada kecamatan yang cocok.' : 'Belum ada data kecamatan.'}
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
                  <th>Kabupaten/Kota</th>
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
                    <td>{item.kabupaten_kota?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('adm_kecamatan.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => void startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('adm_kecamatan.delete') && (
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
