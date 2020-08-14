/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:30:00
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  kegiatanService,
  masterKategoriKegiatanService,
  masterLokasiService,
} from '../api/services'
import type { KategoriKegiatan, Kegiatan, KegiatanInput, Lokasi } from '../api/types'

const emptyForm: KegiatanInput = {
  judul: '',
  jenis: '',
  kategori_kegiatan_id: null,
  tanggal: '',
  lokasi: '',
  lokasi_id: null,
  deskripsi: '',
  status: 'planned',
}

function filterByQuery<T extends { kode: string; nama: string }>(items: T[], query: string): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return items
  return items.filter(
    (item) =>
      item.nama.toLowerCase().includes(needle) || item.kode.toLowerCase().includes(needle),
  )
}

export function KegiatanFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<KegiatanInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lokasiOptions, setLokasiOptions] = useState<Lokasi[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriKegiatan[]>([])
  const [lokasiFilter, setLokasiFilter] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')

  const filteredLokasi = useMemo(
    () => filterByQuery(lokasiOptions, lokasiFilter),
    [lokasiOptions, lokasiFilter],
  )
  const filteredKategori = useMemo(
    () => filterByQuery(kategoriOptions, kategoriFilter),
    [kategoriOptions, kategoriFilter],
  )

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [lokasiResult, kategoriResult] = await Promise.all([
          masterLokasiService.list({ active_only: true, per_page: 100 }),
          masterKategoriKegiatanService.list({ active_only: true, per_page: 100 }),
        ])
        if (!active) return

        setLokasiOptions(lokasiResult.items)
        setKategoriOptions(kategoriResult.items)

        if (id) {
          const item = await kegiatanService.get(Number(id))
          if (!active) return

          setForm({
            judul: item.judul,
            jenis: item.jenis || item.kategori_kegiatan?.nama || '',
            kategori_kegiatan_id: item.kategori_kegiatan_id ?? null,
            tanggal: item.tanggal,
            lokasi: item.lokasi || item.lokasi_ref?.nama || '',
            lokasi_id: item.lokasi_id ?? null,
            deskripsi: item.deskripsi || '',
            status: item.status,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat kegiatan')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [id])

  function handleLokasiChange(value: string) {
    const selectedId = value ? Number(value) : null
    const selected = selectedId ? lokasiOptions.find((item) => item.id === selectedId) : undefined
    setForm((prev) => ({
      ...prev,
      lokasi_id: selectedId,
      lokasi: selected ? selected.nama : prev.lokasi_id ? '' : prev.lokasi,
    }))
  }

  function handleKategoriChange(value: string) {
    const selectedId = value ? Number(value) : null
    const selected = selectedId ? kategoriOptions.find((item) => item.id === selectedId) : undefined
    setForm((prev) => ({
      ...prev,
      kategori_kegiatan_id: selectedId,
      jenis: selected ? selected.nama : prev.kategori_kegiatan_id ? '' : prev.jenis,
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: KegiatanInput = {
      ...form,
      jenis: form.jenis || null,
      kategori_kegiatan_id: form.kategori_kegiatan_id || null,
      lokasi: form.lokasi || null,
      lokasi_id: form.lokasi_id || null,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (isEdit && id) {
        await kegiatanService.update(Number(id), payload)
      } else {
        await kegiatanService.create(payload)
      }
      navigate('/kegiatan')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kegiatan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat kegiatan…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit kegiatan' : 'Tambah kegiatan'}</h1>
        <p>Agenda kegiatan jamaah dan masjid.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="judul">Judul *</label>
            <input
              id="judul"
              value={form.judul}
              onChange={(event) => setForm((prev) => ({ ...prev, judul: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="kategori_filter">Cari kategori</label>
            <input
              id="kategori_filter"
              type="search"
              placeholder="Filter daftar kategori…"
              value={kategoriFilter}
              onChange={(event) => setKategoriFilter(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="kategori_kegiatan_id">Kategori kegiatan</label>
            <select
              id="kategori_kegiatan_id"
              value={form.kategori_kegiatan_id ? String(form.kategori_kegiatan_id) : ''}
              onChange={(event) => handleKategoriChange(event.target.value)}
            >
              <option value="">— Pilih atau isi jenis manual —</option>
              {filteredKategori.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.kode})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="jenis">Jenis (teks)</label>
            <input
              id="jenis"
              value={form.jenis || ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  jenis: event.target.value,
                  kategori_kegiatan_id: null,
                }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="tanggal">Tanggal *</label>
            <input
              id="tanggal"
              type="date"
              value={form.tanggal}
              onChange={(event) => setForm((prev) => ({ ...prev, tanggal: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="lokasi_filter">Cari lokasi</label>
            <input
              id="lokasi_filter"
              type="search"
              placeholder="Filter daftar lokasi…"
              value={lokasiFilter}
              onChange={(event) => setLokasiFilter(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="lokasi_id">Lokasi (master)</label>
            <select
              id="lokasi_id"
              value={form.lokasi_id ? String(form.lokasi_id) : ''}
              onChange={(event) => handleLokasiChange(event.target.value)}
            >
              <option value="">— Pilih atau isi manual —</option>
              {filteredLokasi.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} · {item.jenis}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="lokasi">Lokasi (teks)</label>
            <input
              id="lokasi"
              value={form.lokasi || ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lokasi: event.target.value,
                  lokasi_id: null,
                }))
              }
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as Kegiatan['status'],
                }))
              }
            >
              <option value="planned">Direncanakan</option>
              <option value="ongoing">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="deskripsi">Deskripsi</label>
            <textarea
              id="deskripsi"
              value={form.deskripsi || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, deskripsi: event.target.value }))}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/kegiatan" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
