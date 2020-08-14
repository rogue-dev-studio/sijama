/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:55:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:55:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admKodePosService,
  admNegaraService,
  admProvinsiService,
} from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmKodePos,
  AdmKodePosInput,
  AdmNegara,
  AdmProvinsi,
  PaginationMeta,
} from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: AdmKodePosInput = {
  kode: '',
  kecamatan_id: null,
  desa_kelurahan_id: null,
  nama_wilayah: '',
  is_active: true,
}

export function MasterAdmKodePosPage() {
  const { can } = useAuth()
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [filterNegaraId, setFilterNegaraId] = useState<number>(0)
  const [filterProvinsiId, setFilterProvinsiId] = useState<number>(0)
  const [filterKabupatenKotaId, setFilterKabupatenKotaId] = useState<number>(0)
  const [filterKecamatanId, setFilterKecamatanId] = useState<number>(0)
  const [items, setItems] = useState<AdmKodePos[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<AdmKodePosInput>(emptyForm)
  const [formNegaraId, setFormNegaraId] = useState<number>(0)
  const [formProvinsiId, setFormProvinsiId] = useState<number>(0)
  const [formKabupatenKotaId, setFormKabupatenKotaId] = useState<number>(0)
  const [formProvinsiList, setFormProvinsiList] = useState<AdmProvinsi[]>([])
  const [formKabupatenKotaList, setFormKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [formKecamatanList, setFormKecamatanList] = useState<AdmKecamatan[]>([])
  const [formDesaKelurahanList, setFormDesaKelurahanList] = useState<AdmDesaKelurahan[]>([])
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
      const result = await admKodePosService.list({
        q: search || undefined,
        kecamatan_id: filterKecamatanId || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kode pos')
    } finally {
      setLoading(false)
    }
  }, [search, filterKecamatanId, page, perPage])

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

  async function loadDesaKelurahanForKecamatan(kecamatanId: number) {
    return (
      await admDesaKelurahanService.list({ kecamatan_id: kecamatanId || undefined, per_page: 10000 })
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

  async function loadFormDesaKelurahan(kecamatanId: number) {
    const items = kecamatanId > 0 ? await loadDesaKelurahanForKecamatan(kecamatanId) : []
    setFormDesaKelurahanList(items)
    setForm((prev) => ({ ...prev, kecamatan_id: kecamatanId || null, desa_kelurahan_id: null }))
  }

  async function loadFormKecamatan(kabupatenKotaId: number) {
    const items = kabupatenKotaId > 0 ? await loadKecamatanForKabupatenKota(kabupatenKotaId) : []
    setFormKecamatanList(items)
    setFormDesaKelurahanList([])
    setForm((prev) => ({ ...prev, kecamatan_id: null, desa_kelurahan_id: null }))
  }

  async function loadFormKabupatenKota(provinsiId: number) {
    const items = provinsiId > 0 ? await loadKabupatenKotaForProvinsi(provinsiId) : []
    setFormKabupatenKotaList(items)
    setFormKabupatenKotaId(0)
    setFormKecamatanList([])
    setFormDesaKelurahanList([])
    setForm((prev) => ({ ...prev, kecamatan_id: null, desa_kelurahan_id: null }))
  }

  async function loadFormProvinsi(negaraId: number) {
    const items = negaraId > 0 ? await loadProvinsiForNegara(negaraId) : []
    setFormProvinsiList(items)
    setFormProvinsiId(0)
    setFormKabupatenKotaList([])
    setFormKecamatanList([])
    setFormDesaKelurahanList([])
    setForm((prev) => ({ ...prev, kecamatan_id: null, desa_kelurahan_id: null }))
  }

  function resetForm() {
    setFormNegaraId(0)
    setFormProvinsiId(0)
    setFormKabupatenKotaId(0)
    setFormProvinsiList([])
    setFormKabupatenKotaList([])
    setFormKecamatanList([])
    setFormDesaKelurahanList([])
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  async function startEdit(item: AdmKodePos) {
    setEditingId(item.id)
    setShowForm(true)
    setFormNegaraId(0)
    setFormProvinsiId(0)
    setFormKabupatenKotaId(0)
    setFormProvinsiList([])
    setFormKabupatenKotaList([])

    const kecamatanResult = await admKecamatanService.list({ per_page: 100 })
    setFormKecamatanList(kecamatanResult.items)

    const desaKelurahanItems = item.kecamatan_id
      ? await loadDesaKelurahanForKecamatan(item.kecamatan_id)
      : []
    setFormDesaKelurahanList(desaKelurahanItems)

    setForm({
      kode: item.kode,
      kecamatan_id: item.kecamatan_id,
      desa_kelurahan_id: item.desa_kelurahan_id,
      nama_wilayah: item.nama_wilayah || '',
      is_active: item.is_active,
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: AdmKodePosInput = {
      ...form,
      nama_wilayah: form.nama_wilayah || null,
    }

    try {
      if (editingId) {
        await admKodePosService.update(editingId, payload)
      } else {
        await admKodePosService.create(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kode pos')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: AdmKodePos) {
    if (!window.confirm(`Hapus kode pos "${item.kode}"?`)) return
    setError(null)
    try {
      await admKodePosService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus kode pos')
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
    filterKecamatanId > 0

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Kode Pos</h1>
            <p>Kelola kode pos per kecamatan, dengan opsi rincian per desa/kelurahan.</p>
          </div>
          {can('adm_kode_pos.create') && negaraList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah kode pos
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari kode pos atau nama wilayah…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari kode pos"
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
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {showForm && (can('adm_kode_pos.create') || can('adm_kode_pos.update')) && (
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
                onChange={(event) => void loadFormDesaKelurahan(Number(event.target.value))}
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
              <label htmlFor="desa_kelurahan_id">Desa/Kelurahan (opsional)</label>
              <select
                id="desa_kelurahan_id"
                value={form.desa_kelurahan_id ?? ''}
                onChange={(event) =>
                  setForm({
                    ...form,
                    desa_kelurahan_id: event.target.value ? Number(event.target.value) : null,
                  })
                }
                disabled={formDesaKelurahanList.length === 0}
              >
                <option value="">Semua desa/kelurahan di kecamatan ini</option>
                {formDesaKelurahanList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
              <p className="field-hint">Kosongkan jika kode pos berlaku untuk seluruh kecamatan.</p>
            </div>
            <div className="field">
              <label htmlFor="kode">Kode Pos</label>
              <input
                id="kode"
                value={form.kode}
                onChange={(event) => setForm({ ...form, kode: event.target.value })}
                required
                maxLength={5}
                pattern="\d{5}"
                title="5 digit angka"
                placeholder="mis. 12345"
              />
            </div>
            <div className="field">
              <label htmlFor="nama_wilayah">Nama Wilayah</label>
              <input
                id="nama_wilayah"
                value={form.nama_wilayah || ''}
                onChange={(event) => setForm({ ...form, nama_wilayah: event.target.value })}
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

      {loading && <div className="loading-state">Memuat kode pos…</div>}

      {!loading && negaraList.length === 0 && (
        <div className="empty-state">Tambahkan negara terlebih dahulu.</div>
      )}

      {!loading && negaraList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada data yang cocok.' : 'Belum ada data kode pos.'}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Kode Pos</th>
                  <th>Kecamatan</th>
                  <th>Desa/Kelurahan</th>
                  <th>Nama Wilayah</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    <td>{item.kode}</td>
                    <td>{item.kecamatan?.nama || '—'}</td>
                    <td>{item.desa_kelurahan?.nama || '—'}</td>
                    <td>{item.nama_wilayah || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('adm_kode_pos.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => void startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('adm_kode_pos.delete') && (
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
