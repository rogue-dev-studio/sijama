/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:53:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:53:00
 */

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { admKabupatenKotaService, admNegaraService, admProvinsiService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import type {
  AdmKabupatenKota,
  AdmKabupatenKotaInput,
  AdmNegara,
  AdmProvinsi,
  PaginationMeta,
} from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const emptyForm: AdmKabupatenKotaInput = {
  provinsi_id: 0,
  kode: '',
  nama: '',
  jenis: 'kabupaten',
  is_active: true,
}

export function MasterAdmKabupatenKotaPage() {
  const { can } = useAuth()
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [filterNegaraId, setFilterNegaraId] = useState<number>(0)
  const [filterProvinsiId, setFilterProvinsiId] = useState<number>(0)
  const [items, setItems] = useState<AdmKabupatenKota[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [form, setForm] = useState<AdmKabupatenKotaInput>(emptyForm)
  const [formNegaraId, setFormNegaraId] = useState<number>(0)
  const [formProvinsiList, setFormProvinsiList] = useState<AdmProvinsi[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [jenisFilter, setJenisFilter] = useState<'' | 'kabupaten' | 'kota'>('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await admKabupatenKotaService.list({
        q: search || undefined,
        provinsi_id: filterProvinsiId || undefined,
        jenis: jenisFilter || undefined,
        page,
        per_page: perPage,
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kabupaten/kota')
    } finally {
      setLoading(false)
    }
  }, [search, filterProvinsiId, jenisFilter, page, perPage])

  async function loadProvinsiForNegara(negaraId: number) {
    const result = await admProvinsiService.list({
      negara_id: negaraId || undefined,
      per_page: 10000,
    })
    return result.items
  }

  useEffect(() => {
    async function init() {
      try {
        const [negaraResult, provinsiItems] = await Promise.all([
          admNegaraService.list({ per_page: 10000 }),
          loadProvinsiForNegara(0),
        ])
        setNegaraList(negaraResult.items)
        setProvinsiList(provinsiItems)
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
    setPage(1)
    try {
      setProvinsiList(await loadProvinsiForNegara(negaraId))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat provinsi')
    }
  }

  function handleFilterProvinsiChange(provinsiId: number) {
    setFilterProvinsiId(provinsiId)
    setPage(1)
  }

  async function loadFormProvinsi(negaraId: number, selectedProvinsiId?: number) {
    const provinsiItems = negaraId > 0 ? await loadProvinsiForNegara(negaraId) : []
    setFormProvinsiList(provinsiItems)
    const nextProvinsiId = selectedProvinsiId ?? provinsiItems[0]?.id ?? 0
    setForm((prev) => ({ ...prev, provinsi_id: nextProvinsiId }))
    return nextProvinsiId
  }

  function resetForm() {
    const negaraId = filterNegaraId > 0 ? filterNegaraId : (negaraList[0]?.id ?? 0)
    setFormNegaraId(negaraId)
    setForm({ ...emptyForm, provinsi_id: filterProvinsiId > 0 ? filterProvinsiId : 0 })
    setEditingId(null)
    setShowForm(false)
    void loadFormProvinsi(negaraId, filterProvinsiId > 0 ? filterProvinsiId : undefined)
  }

  async function startEdit(item: AdmKabupatenKota) {
    setEditingId(item.id)
    setShowForm(true)
    setFormNegaraId(0)

    const provinsiResult = await admProvinsiService.list({ per_page: 100 })
    setFormProvinsiList(provinsiResult.items)

    setForm({
      provinsi_id: item.provinsi_id,
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
        await admKabupatenKotaService.update(editingId, form)
      } else {
        await admKabupatenKotaService.create(form)
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kabupaten/kota')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(item: AdmKabupatenKota) {
    if (!window.confirm(`Hapus "${item.nama}"?`)) return
    setError(null)
    try {
      await admKabupatenKotaService.remove(item.id)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus kabupaten/kota')
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
    setJenisFilter('')
    setPage(1)
    void (async () => {
      try {
        setProvinsiList(await loadProvinsiForNegara(0))
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal memuat filter')
      }
    })()
  }

  const hasActiveFilters =
    search !== '' || filterNegaraId > 0 || filterProvinsiId > 0 || jenisFilter !== ''

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Master Kabupaten/Kota</h1>
            <p>Kelola kabupaten/kota per provinsi dalam wilayah administrasi.</p>
          </div>
          {can('adm_kabupaten_kota.create') && negaraList.length > 0 && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
            >
              Tambah kabupaten/kota
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
            aria-label="Cari kabupaten/kota"
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
              onChange={(event) => handleFilterProvinsiChange(Number(event.target.value))}
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
            <label htmlFor="filter_jenis">Jenis</label>
            <select
              id="filter_jenis"
              value={jenisFilter}
              onChange={(event) => {
                setJenisFilter(event.target.value as '' | 'kabupaten' | 'kota')
                setPage(1)
              }}
            >
              <option value="">Semua</option>
              <option value="kabupaten">Kabupaten</option>
              <option value="kota">Kota</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
        )}
      </div>

      {showForm && (can('adm_kabupaten_kota.create') || can('adm_kabupaten_kota.update')) && (
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
              <label htmlFor="provinsi_id">Provinsi</label>
              <select
                id="provinsi_id"
                value={form.provinsi_id || ''}
                onChange={(event) => setForm({ ...form, provinsi_id: Number(event.target.value) })}
                required
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
                  setForm({ ...form, jenis: event.target.value as AdmKabupatenKotaInput['jenis'] })
                }
              >
                <option value="kabupaten">Kabupaten</option>
                <option value="kota">Kota</option>
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

      {loading && <div className="loading-state">Memuat kabupaten/kota…</div>}

      {!loading && negaraList.length === 0 && (
        <div className="empty-state">Tambahkan negara terlebih dahulu.</div>
      )}

      {!loading && negaraList.length > 0 && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada data yang cocok.' : 'Belum ada data kabupaten/kota.'}
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
                  <th>Provinsi</th>
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
                    <td>{item.jenis === 'kota' ? 'Kota' : 'Kabupaten'}</td>
                    <td>{item.provinsi?.nama || '—'}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge--ok' : 'badge--muted'}`}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="data-table__actions">
                        {can('adm_kabupaten_kota.update') && (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => void startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                        {can('adm_kabupaten_kota.delete') && (
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
