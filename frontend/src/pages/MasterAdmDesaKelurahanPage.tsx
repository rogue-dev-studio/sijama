/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:52:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:52:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
} from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type {
  AdmDesaKelurahan,
  AdmDesaKelurahanInput,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
  PaginationMeta,
} from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: AdmDesaKelurahanInput = {
  kecamatan_id: 0,
  kode: '',
  nama: '',
  jenis: 'desa',
  is_active: true,
}

export function MasterAdmDesaKelurahanPage() {
  const { can } = useAuth()
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [filterNegaraId, setFilterNegaraId] = useState<number>(0)
  const [filterProvinsiId, setFilterProvinsiId] = useState<number>(0)
  const [filterKabupatenKotaId, setFilterKabupatenKotaId] = useState<number>(0)
  const [filterKecamatanId, setFilterKecamatanId] = useState<number>(0)
  const [items, setItems] = useState<AdmDesaKelurahan[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<AdmDesaKelurahanInput>(emptyForm)
  const [formNegaraId, setFormNegaraId] = useState<number>(0)
  const [formProvinsiId, setFormProvinsiId] = useState<number>(0)
  const [formKabupatenKotaId, setFormKabupatenKotaId] = useState<number>(0)
  const [formProvinsiList, setFormProvinsiList] = useState<AdmProvinsi[]>([])
  const [formKabupatenKotaList, setFormKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [formKecamatanList, setFormKecamatanList] = useState<AdmKecamatan[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [jenisFilter, setJenisFilter] = useState<'' | 'desa' | 'kelurahan' | 'desa_adat'>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await admDesaKelurahanService.list({
        q: search || undefined,
        kecamatan_id: filterKecamatanId || undefined,
        jenis: jenisFilter || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat desa/kelurahan')
    } finally {
      setLoading(false)
    }
  }, [search, filterKecamatanId, jenisFilter, page, perPage])

  async function loadProvinsiForNegara(negaraId: number) {
    return (await admProvinsiService.list({ negara_id: negaraId || undefined, per_page: 10000 })).items
  }

  async function loadKabupatenKotaForProvinsi(provinsiId: number) {
    return (
      await admKabupatenKotaService.list({ provinsi_id: provinsiId || undefined, per_page: 10000 })
    ).items
  }

  async function loadKecamatanForKabupatenKota(kabupatenKotaId: number) {
    return (
      await admKecamatanService.list({
        kabupaten_kota_id: kabupatenKotaId || undefined,
        per_page: 10000,
      })
    ).items
  }

  useEffect(() => {
    async function init() {
      try {
        const [negaraItems, provinsiItems, kabupatenKotaItems, kecamatanItems] = await Promise.all([
          admNegaraService.list({ per_page: 10000 }),
          loadProvinsiForNegara(0),
          loadKabupatenKotaForProvinsi(0),
          loadKecamatanForKabupatenKota(0),
        ])
        setNegaraList(negaraItems.items)
        setProvinsiList(provinsiItems)
        setKabupatenKotaList(kabupatenKotaItems)
        setKecamatanList(kecamatanItems)
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
    setFilterKecamatanId(0)
    setPage(1)
    try {
      const [provinsiItems, kabupatenKotaItems, kecamatanItems] = await Promise.all([
        loadProvinsiForNegara(negaraId),
        loadKabupatenKotaForProvinsi(0),
        loadKecamatanForKabupatenKota(0),
      ])
      setProvinsiList(provinsiItems)
      setKabupatenKotaList(kabupatenKotaItems)
      setKecamatanList(kecamatanItems)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat provinsi')
    }
  }

  async function handleFilterProvinsiChange(provinsiId: number) {
    setFilterProvinsiId(provinsiId)
    setFilterKabupatenKotaId(0)
    setFilterKecamatanId(0)
    setPage(1)
    try {
      const [kabupatenKotaItems, kecamatanItems] = await Promise.all([
        loadKabupatenKotaForProvinsi(provinsiId),
        loadKecamatanForKabupatenKota(0),
      ])
      setKabupatenKotaList(kabupatenKotaItems)
      setKecamatanList(kecamatanItems)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kabupaten/kota')
    }
  }

  async function handleFilterKabupatenKotaChange(kabupatenKotaId: number) {
    setFilterKabupatenKotaId(kabupatenKotaId)
    setFilterKecamatanId(0)
    setPage(1)
    try {
      setKecamatanList(await loadKecamatanForKabupatenKota(kabupatenKotaId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kecamatan')
    }
  }

  function handleFilterKecamatanChange(kecamatanId: number) {
    setFilterKecamatanId(kecamatanId)
    setPage(1)
  }

  async function loadFormKecamatan(kabupatenKotaId: number, selectedId?: number) {
    const items = kabupatenKotaId > 0 ? await loadKecamatanForKabupatenKota(kabupatenKotaId) : []
    setFormKecamatanList(items)
    const nextId = selectedId ?? items[0]?.id ?? 0
    setForm((prev) => ({ ...prev, kecamatan_id: nextId }))
    return nextId
  }

  async function loadFormKabupatenKota(provinsiId: number, selectedId?: number) {
    const items = provinsiId > 0 ? await loadKabupatenKotaForProvinsi(provinsiId) : []
    setFormKabupatenKotaList(items)
    const nextId = selectedId ?? items[0]?.id ?? 0
    setFormKabupatenKotaId(nextId)
    await loadFormKecamatan(nextId)
    return nextId
  }

  async function loadFormProvinsi(negaraId: number, selectedId?: number) {
    const items = negaraId > 0 ? await loadProvinsiForNegara(negaraId) : []
    setFormProvinsiList(items)
    const nextId = selectedId ?? items[0]?.id ?? 0
    setFormProvinsiId(nextId)
    await loadFormKabupatenKota(nextId)
    return nextId
  }

  function resetForm() {
    setFormNegaraId(0)
    setFormProvinsiId(0)
    setFormKabupatenKotaId(0)
    setFormProvinsiList([])
    setFormKabupatenKotaList([])
    setFormKecamatanList([])
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  async function startEdit(item: AdmDesaKelurahan) {
    setEditingId(item.id)
    setShowForm(true)
    setFormNegaraId(0)
    setFormProvinsiId(0)
    setFormKabupatenKotaId(0)

    const kecamatanResult = await admKecamatanService.list({ per_page: 100 })
    setFormKecamatanList(kecamatanResult.items)

    setForm({
      kecamatan_id: item.kecamatan_id,
      kode: item.kode,
      nama: item.nama,
      jenis: item.jenis,
      is_active: item.is_active,
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await admDesaKelurahanService.update(editingId, form)
      } else {
        await admDesaKelurahanService.create(form)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan desa/kelurahan')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: AdmDesaKelurahan) {
    if (!window.confirm(`Hapus "${item.nama}"?`)) return
    setError(null)
    try {
      await admDesaKelurahanService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus desa/kelurahan')
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
    setFilterKecamatanId(0)
    setJenisFilter('')
    setPage(1)
    void (async () => {
      try {
        const [provinsiItems, kabupatenKotaItems, kecamatanItems] = await Promise.all([
          loadProvinsiForNegara(0),
          loadKabupatenKotaForProvinsi(0),
          loadKecamatanForKabupatenKota(0),
        ])
        setProvinsiList(provinsiItems)
        setKabupatenKotaList(kabupatenKotaItems)
        setKecamatanList(kecamatanItems)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat filter')
      }
    })()
  }

  const hasActiveFilters =
    search !== '' ||
    filterNegaraId > 0 ||
    filterProvinsiId > 0 ||
    filterKabupatenKotaId > 0 ||
    filterKecamatanId > 0 ||
    jenisFilter !== ''

  function jenisLabel(jenis: AdmDesaKelurahan['jenis']) {
    if (jenis === 'kelurahan') return 'Kelurahan'
    if (jenis === 'desa_adat') return 'Desa Adat'
    return 'Desa'
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Desa/Kelurahan</h1>
            <p>Kelola desa/kelurahan per kecamatan dalam wilayah administrasi.</p>
          </div>
          {can('adm_desa_kelurahan.create') && negaraList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah desa/kelurahan
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode atau nama…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari desa/kelurahan"
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
              onChange={(event) => void handleFilterKabupatenKotaChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {kabupatenKotaList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_kecamatan">Kecamatan</label>
            <select
              id="filter_kecamatan"
              value={filterKecamatanId}
              onChange={(event) => handleFilterKecamatanChange(Number(event.target.value))}
            >
              <option value={0}>Semua</option>
              {kecamatanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter_jenis">Jenis</label>
            <select
              id="filter_jenis"
              value={jenisFilter}
              onChange={(event) => {
                setJenisFilter(event.target.value as '' | 'desa' | 'kelurahan' | 'desa_adat')
                setPage(1)
              }}
            >
              <option value="">Semua</option>
              <option value="desa">Desa</option>
              <option value="kelurahan">Kelurahan</option>
              <option value="desa_adat">Desa Adat</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {showForm && (can('adm_desa_kelurahan.create') || can('adm_desa_kelurahan.update')) && (
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
              <label htmlFor="form_kabkota">Kabupaten/Kota</label>
              <select
                id="form_kabkota"
                value={formKabupatenKotaId || ''}
                onChange={(event) => {
                  const kabupatenKotaId = Number(event.target.value)
                  setFormKabupatenKotaId(kabupatenKotaId)
                  void loadFormKecamatan(kabupatenKotaId)
                }}
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
              <label htmlFor="kecamatan_id">Kecamatan</label>
              <select
                id="kecamatan_id"
                value={form.kecamatan_id || ''}
                onChange={(event) => setForm({ ...form, kecamatan_id: Number(event.target.value) })}
                required
                disabled={formKecamatanList.length === 0}
              >
                <option value="" disabled>
                  Pilih kecamatan
                </option>
                {formKecamatanList.map((item) => (
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
              <label htmlFor="jenis">Jenis</label>
              <select
                id="jenis"
                value={form.jenis}
                onChange={(event) =>
                  setForm({ ...form, jenis: event.target.value as AdmDesaKelurahanInput['jenis'] })
                }
              >
                <option value="desa">Desa</option>
                <option value="kelurahan">Kelurahan</option>
                <option value="desa_adat">Desa Adat</option>
              </select>
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

      {loading && <div className="loading-state">Memuat desa/kelurahan…</div>}

      {!loading && negaraList.length === 0 && (
        <div className="empty-state">Tambahkan negara terlebih dahulu.</div>
      )}

      {!loading && negaraList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada data yang cocok.' : 'Belum ada data desa/kelurahan.'}
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
                  <th>Jenis</th>
                  <th>Kecamatan</th>
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
                    <td>{jenisLabel(item.jenis)}</td>
                    <td>{item.kecamatan?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('adm_desa_kelurahan.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => void startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('adm_desa_kelurahan.delete') && (
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
