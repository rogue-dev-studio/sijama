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
  masterLokasiService,
  masterMateriService,
  masterPemateriService,
  pengajianService,
} from '../api/services'
import type { Lokasi, Materi, Pemateri, Pengajian, PengajianInput } from '../api/types'

const emptyForm: PengajianInput = {
  judul: '',
  pemateri: '',
  pemateri_id: null,
  lokasi: '',
  lokasi_id: null,
  materi_id: null,
  starts_at: '',
  ends_at: '',
  catatan: '',
  status: 'scheduled',
}

function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function filterByQuery<T extends { kode: string; nama: string }>(items: T[], query: string): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return items
  return items.filter(
    (item) =>
      item.nama.toLowerCase().includes(needle) || item.kode.toLowerCase().includes(needle),
  )
}

export function PengajianFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<PengajianInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lokasiOptions, setLokasiOptions] = useState<Lokasi[]>([])
  const [pemateriOptions, setPemateriOptions] = useState<Pemateri[]>([])
  const [materiOptions, setMateriOptions] = useState<Materi[]>([])
  const [lokasiFilter, setLokasiFilter] = useState('')
  const [pemateriFilter, setPemateriFilter] = useState('')
  const [materiFilter, setMateriFilter] = useState('')

  const filteredLokasi = useMemo(
    () => filterByQuery(lokasiOptions, lokasiFilter),
    [lokasiOptions, lokasiFilter],
  )
  const filteredPemateri = useMemo(
    () => filterByQuery(pemateriOptions, pemateriFilter),
    [pemateriOptions, pemateriFilter],
  )
  const filteredMateri = useMemo(
    () => filterByQuery(materiOptions, materiFilter),
    [materiOptions, materiFilter],
  )

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [lokasiResult, pemateriResult, materiResult] = await Promise.all([
          masterLokasiService.list({ active_only: true, per_page: 100 }),
          masterPemateriService.list({ active_only: true, per_page: 100 }),
          masterMateriService.list({ active_only: true, per_page: 100 }),
        ])
        if (!active) return

        setLokasiOptions(lokasiResult.items)
        setPemateriOptions(pemateriResult.items)
        setMateriOptions(materiResult.items)

        if (id) {
          const item = await pengajianService.get(Number(id))
          if (!active) return

          setForm({
            judul: item.judul,
            pemateri: item.pemateri || item.pemateri_ref?.nama || '',
            pemateri_id: item.pemateri_id ?? null,
            lokasi: item.lokasi || item.lokasi_ref?.nama || '',
            lokasi_id: item.lokasi_id ?? null,
            materi_id: item.materi_id ?? null,
            starts_at: toLocalInput(item.starts_at),
            ends_at: item.ends_at ? toLocalInput(item.ends_at) : '',
            catatan: item.catatan || '',
            status: item.status,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat pengajian')
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

  function handlePemateriChange(value: string) {
    const selectedId = value ? Number(value) : null
    const selected = selectedId ? pemateriOptions.find((item) => item.id === selectedId) : undefined
    setForm((prev) => ({
      ...prev,
      pemateri_id: selectedId,
      pemateri: selected ? selected.nama : prev.pemateri_id ? '' : prev.pemateri,
    }))
  }

  function handleMateriChange(value: string) {
    const selectedId = value ? Number(value) : null
    setForm((prev) => ({
      ...prev,
      materi_id: selectedId,
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: PengajianInput = {
      ...form,
      pemateri: form.pemateri || null,
      pemateri_id: form.pemateri_id || null,
      lokasi: form.lokasi || null,
      lokasi_id: form.lokasi_id || null,
      materi_id: form.materi_id || null,
      ends_at: form.ends_at || null,
      catatan: form.catatan || null,
    }

    try {
      if (isEdit && id) {
        await pengajianService.update(Number(id), payload)
      } else {
        await pengajianService.create(payload)
      }
      navigate('/pengajian')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan pengajian')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat pengajian…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit pengajian' : 'Tambah pengajian'}</h1>
        <p>Jadwal kajian dan pemateri.</p>
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
            <label htmlFor="pemateri_filter">Cari pemateri</label>
            <input
              id="pemateri_filter"
              type="search"
              placeholder="Filter daftar pemateri…"
              value={pemateriFilter}
              onChange={(event) => setPemateriFilter(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="pemateri_id">Pemateri (master)</label>
            <select
              id="pemateri_id"
              value={form.pemateri_id ? String(form.pemateri_id) : ''}
              onChange={(event) => handlePemateriChange(event.target.value)}
            >
              <option value="">— Pilih atau isi manual —</option>
              {filteredPemateri.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.kode})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pemateri">Pemateri (teks)</label>
            <input
              id="pemateri"
              value={form.pemateri || ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  pemateri: event.target.value,
                  pemateri_id: null,
                }))
              }
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
            <label htmlFor="materi_filter">Cari materi</label>
            <input
              id="materi_filter"
              type="search"
              placeholder="Filter daftar materi…"
              value={materiFilter}
              onChange={(event) => setMateriFilter(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="materi_id">Materi</label>
            <select
              id="materi_id"
              value={form.materi_id ? String(form.materi_id) : ''}
              onChange={(event) => handleMateriChange(event.target.value)}
            >
              <option value="">— Opsional —</option>
              {filteredMateri.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.kode})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="starts_at">Mulai *</label>
            <input
              id="starts_at"
              type="datetime-local"
              value={form.starts_at}
              onChange={(event) => setForm((prev) => ({ ...prev, starts_at: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="ends_at">Selesai</label>
            <input
              id="ends_at"
              type="datetime-local"
              value={form.ends_at || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, ends_at: event.target.value }))}
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
                  status: event.target.value as Pengajian['status'],
                }))
              }
            >
              <option value="scheduled">Terjadwal</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="catatan">Catatan</label>
            <textarea
              id="catatan"
              value={form.catatan || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, catatan: event.target.value }))}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/pengajian" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
