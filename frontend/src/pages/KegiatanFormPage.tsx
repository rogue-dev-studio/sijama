/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 20:10:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  kegiatanService,
  masterKategoriKegiatanService,
  masterLokasiService,
  masterMateriService,
  masterPemateriService,
} from '../api/services'
import type {
  KategoriKegiatan,
  Kegiatan,
  KegiatanInput,
  Lokasi,
  Materi,
  Pemateri,
} from '../api/types'

import { SearchableMultiSelect } from '../components/SearchableMultiSelect'
import { SearchableSelect } from '../components/SearchableSelect'
import { TimeInput24 } from '../components/TimeInput24'
import { DateField } from '../components/DateField'
import { useToast } from '../components/ToastProvider'
import { FormPageLoading } from '../components/FormPageLoading'

const emptyForm: KegiatanInput = {
  judul: '',
  pemateri_id: null,
  materi_ids: [],
  kategori_kegiatan_id: null,
  tanggal: '',
  jam_mulai: '',
  jam_selesai: '',
  lokasi_id: null,
  deskripsi: '',
  catatan: '',
  status: 'planned',
}

export function KegiatanFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<KegiatanInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lokasiOptions, setLokasiOptions] = useState<Lokasi[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriKegiatan[]>([])
  const [pemateriOptions, setPemateriOptions] = useState<Pemateri[]>([])
  const [materiOptions, setMateriOptions] = useState<Materi[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [lokasiResult, kategoriResult, pemateriResult, materiResult] = await Promise.all([
          masterLokasiService.list({ active_only: true, per_page: 100 }),
          masterKategoriKegiatanService.list({ active_only: true, per_page: 100 }),
          masterPemateriService.list({ active_only: true, per_page: 100 }),
          masterMateriService.list({ active_only: true, per_page: 100 }),
        ])
        if (!active) return

        setLokasiOptions(lokasiResult.items)
        setKategoriOptions(kategoriResult.items)
        setPemateriOptions(pemateriResult.items)
        setMateriOptions(materiResult.items)

        if (id) {
          const item = await kegiatanService.get(Number(id))
          if (!active) return

          setForm({
            judul: item.judul,
            pemateri_id: item.pemateri_id ?? null,
            materi_ids: item.materi_ids ?? item.materi_list?.map((m) => m.id) ?? [],
            kategori_kegiatan_id: item.kategori_kegiatan_id ?? null,
            tanggal: item.tanggal,
            jam_mulai: item.jam_mulai || '',
            jam_selesai: item.jam_selesai || '',
            lokasi_id: item.lokasi_id ?? null,
            deskripsi: item.deskripsi || '',
            catatan: item.catatan || '',
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: KegiatanInput = {
      ...form,
      pemateri_id: form.pemateri_id || null,
      materi_ids: form.materi_ids ?? [],
      kategori_kegiatan_id: form.kategori_kegiatan_id || null,
      jam_mulai: form.jam_mulai || null,
      jam_selesai: form.jam_selesai || null,
      lokasi_id: form.lokasi_id || null,
      deskripsi: form.deskripsi || null,
      catatan: form.catatan || null,
    }

    try {
      if (isEdit && id) {
        await kegiatanService.update(Number(id), payload)
      } else {
        await kegiatanService.create(payload)
      }
      notifySaved('kegiatan', isEdit ? 'update' : 'create')
      navigate('/kegiatan')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kegiatan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPageLoading
        title={isEdit ? 'Edit kegiatan' : 'Tambah kegiatan'}
        description="Agenda kegiatan jamaah dan masjid, termasuk pengajian."
        message="Memuat kegiatan…"
      />
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit kegiatan' : 'Tambah kegiatan'}</h1>
        <p>Agenda kegiatan jamaah dan masjid, termasuk pengajian.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="judul">Judul</label>
            <input
              id="judul"
              value={form.judul}
              onChange={(event) => setForm((prev) => ({ ...prev, judul: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="kategori_kegiatan_id">Kategori kegiatan</label>
            <SearchableSelect
              id="kategori_kegiatan_id"
              value={form.kategori_kegiatan_id ? String(form.kategori_kegiatan_id) : ''}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  kategori_kegiatan_id: next ? Number(next) : null,
                }))
              }
              placeholder="— Pilih kategori —"
              options={[
                { value: '', label: '— Pilih kategori —' },
                ...kategoriOptions.map((item) => ({
                  value: String(item.id),
                  label: item.nama,
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="tanggal">Tanggal</label>
            <DateField
              id="tanggal"
              value={form.tanggal}
              onChange={(next) => setForm((prev) => ({ ...prev, tanggal: next }))}
            />
          </div>
          <div className="field">
            <label htmlFor="jam_mulai">Jam mulai</label>
            <TimeInput24
              id="jam_mulai"
              value={form.jam_mulai || ''}
              onChange={(next) => setForm((prev) => ({ ...prev, jam_mulai: next }))}
            />
            <p className="field-hint">Format 24 jam (00–23), contoh 19:30</p>
          </div>
          <div className="field">
            <label htmlFor="jam_selesai">Jam selesai</label>
            <TimeInput24
              id="jam_selesai"
              value={form.jam_selesai || ''}
              onChange={(next) => setForm((prev) => ({ ...prev, jam_selesai: next }))}
            />
            <p className="field-hint">Format 24 jam (00–23), contoh 21:00</p>
          </div>
          <div className="field">
            <label htmlFor="lokasi_id">Lokasi</label>
            <SearchableSelect
              id="lokasi_id"
              value={form.lokasi_id ? String(form.lokasi_id) : ''}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  lokasi_id: next ? Number(next) : null,
                }))
              }
              placeholder="— Pilih lokasi —"
              options={[
                { value: '', label: '— Pilih lokasi —' },
                ...lokasiOptions.map((item) => ({
                  value: String(item.id),
                  label: `${item.nama} · ${item.jenis}`,
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <SearchableSelect
              id="status"
              value={form.status ?? ''}
              onChange={(next) =>
                setForm((prev) => ({
                  ...prev,
                  status: next as Kegiatan['status'],
                }))
              }
              options={[
                { value: 'planned', label: 'Direncanakan' },
                { value: 'ongoing', label: 'Berlangsung' },
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
          </div>
        </div>

        <fieldset className="form-fieldset">
          <legend>Pemateri &amp; materi (opsional)</legend>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="pemateri_id">Pemateri</label>
              <SearchableSelect
                id="pemateri_id"
                value={form.pemateri_id ? String(form.pemateri_id) : ''}
                onChange={(next) =>
                  setForm((prev) => ({
                    ...prev,
                    pemateri_id: next ? Number(next) : null,
                  }))
                }
                placeholder="— Opsional —"
                options={[
                  { value: '', label: '— Opsional —' },
                  ...pemateriOptions.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="materi_ids">Materi</label>
              <SearchableMultiSelect
                id="materi_ids"
                values={(form.materi_ids ?? []).map(String)}
                onChange={(next) =>
                  setForm((prev) => ({
                    ...prev,
                    materi_ids: next.map(Number),
                  }))
                }
                placeholder="— Pilih satu atau lebih —"
                options={materiOptions.map((item) => ({
                  value: String(item.id),
                  label: item.nama,
                }))}
              />
            </div>
          </div>
        </fieldset>

        <div className="form-grid form-grid--2">
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="deskripsi">Deskripsi</label>
            <textarea
              id="deskripsi"
              value={form.deskripsi || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, deskripsi: event.target.value }))}
            />
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
          <Link to="/kegiatan" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
