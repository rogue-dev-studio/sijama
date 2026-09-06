/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 20:10:00
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  kegiatanJadwalRutinService,
  lookupOptionsService,
  masterDaerahService,
  masterDesaService,
  masterKelompokService,
  masterKategoriKegiatanService,
  masterLokasiService,
  masterMateriService,
  masterPemateriService,
} from '../api/services'
import type {
  Daerah,
  Desa,
  Kelompok,
  KategoriKegiatan,
  KegiatanJadwalRutinInput,
  Lokasi,
  LookupOption,
  Materi,
  Pemateri,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { SearchableMultiSelect } from '../components/SearchableMultiSelect'
import { SearchableSelect } from '../components/SearchableSelect'
import { TimeInput24 } from '../components/TimeInput24'
import { DateField } from '../components/DateField'
import { useToast } from '../components/ToastProvider'
import { FormPageLoading } from '../components/FormPageLoading'
import { hariMingguSelectOptions } from '../lib/hariMinggu'
import { LOOKUP_TYPE } from '../lib/lookupTypes'

const emptyForm: KegiatanJadwalRutinInput = {
  judul: '',
  pemateri_id: null,
  materi_ids: [],
  kategori_kegiatan_id: null,
  lokasi_id: null,
  deskripsi: '',
  frekuensi: 'mingguan',
  day_of_week: 1,
  day_of_month: 1,
  month_of_year: 1,
  jam_mulai: '',
  jam_selesai: '',
  scope_level: 'kelompok',
  wilayah_fung_daerah_id: null,
  wilayah_fung_desa_id: null,
  wilayah_fung_kelompok_id: null,
  effective_from: new Date().toISOString().slice(0, 10),
  effective_until: '',
  generate_horizon_days: 90,
}

const MONTH_OPTIONS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
].map((label, index) => ({ value: String(index + 1), label }))

export function KegiatanJadwalRutinFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved, notifySuccess } = useToast()
  const { user } = useAuth()
  const [form, setForm] = useState<KegiatanJadwalRutinInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lokasiOptions, setLokasiOptions] = useState<Lokasi[]>([])
  const [kategoriOptions, setKategoriOptions] = useState<KategoriKegiatan[]>([])
  const [pemateriOptions, setPemateriOptions] = useState<Pemateri[]>([])
  const [materiOptions, setMateriOptions] = useState<Materi[]>([])
  const [daerahOptions, setDaerahOptions] = useState<Daerah[]>([])
  const [desaOptions, setDesaOptions] = useState<Desa[]>([])
  const [kelompokOptions, setKelompokOptions] = useState<Kelompok[]>([])
  const [hariMingguOptions, setHariMingguOptions] = useState<LookupOption[]>([])

  const defaultScopeLevel = useMemo(() => {
    const tingkat = user?.dapukan?.tingkat ?? user?.dapukan_list?.[0]?.tingkat
    if (tingkat === 'daerah' || tingkat === 'pusat' || tingkat === 'global') return 'daerah'
    if (tingkat === 'desa') return 'desa'
    return 'kelompok'
  }, [user])

  useEffect(() => {
    let active = true

    async function loadMasters() {
      try {
        const [lokasiResult, kategoriResult, pemateriResult, materiResult, daerahResult, lookupResult] =
          await Promise.all([
          masterLokasiService.list({ active_only: true, per_page: 100 }),
          masterKategoriKegiatanService.list({ active_only: true, per_page: 100 }),
          masterPemateriService.list({ active_only: true, per_page: 100 }),
          masterMateriService.list({ active_only: true, per_page: 100 }),
          masterDaerahService.list({ per_page: 100 }),
          lookupOptionsService.byTypes([LOOKUP_TYPE.HARI_MINGGU]),
        ])
        if (!active) return
        setLokasiOptions(lokasiResult.items)
        setKategoriOptions(kategoriResult.items)
        setPemateriOptions(pemateriResult.items)
        setMateriOptions(materiResult.items)
        setDaerahOptions(daerahResult.items)
        setHariMingguOptions(lookupResult[LOOKUP_TYPE.HARI_MINGGU] ?? [])

        if (id) {
          const item = await kegiatanJadwalRutinService.get(Number(id))
          if (!active) return
          if (!item.is_active) {
            setError('Jadwal nonaktif tidak dapat diubah. Buat jadwal baru sebagai pengganti.')
          }
          setForm({
            judul: item.judul,
            pemateri_id: item.pemateri_id ?? null,
            materi_ids: item.materi_ids ?? item.materi_list?.map((m) => m.id) ?? [],
            kategori_kegiatan_id: item.kategori_kegiatan_id ?? null,
            lokasi_id: item.lokasi_id ?? null,
            deskripsi: item.deskripsi || '',
            frekuensi: item.frekuensi,
            day_of_week: item.day_of_week ?? 1,
            day_of_month: item.day_of_month ?? 1,
            month_of_year: item.month_of_year ?? 1,
            jam_mulai: item.jam_mulai || '',
            jam_selesai: item.jam_selesai || '',
            scope_level: item.scope_level,
            wilayah_fung_daerah_id: item.wilayah_fung_daerah_id ?? null,
            wilayah_fung_desa_id: item.wilayah_fung_desa_id ?? null,
            wilayah_fung_kelompok_id: item.wilayah_fung_kelompok_id ?? null,
            effective_from: item.effective_from,
            effective_until: item.effective_until || '',
            generate_horizon_days: item.generate_horizon_days,
          })
        } else {
          setForm((prev) => ({ ...prev, scope_level: defaultScopeLevel as KegiatanJadwalRutinInput['scope_level'] }))
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat data')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadMasters()
    return () => {
      active = false
    }
  }, [defaultScopeLevel, id])

  useEffect(() => {
    let active = true
    async function loadDesa() {
      if (form.scope_level === 'daerah' || !form.wilayah_fung_daerah_id) {
        setDesaOptions([])
        return
      }
      try {
        const result = await masterDesaService.list({ wilayah_fung_daerah_id: form.wilayah_fung_daerah_id ?? undefined, per_page: 100 })
        if (active) setDesaOptions(result.items)
      } catch {
        if (active) setDesaOptions([])
      }
    }
    void loadDesa()
    return () => {
      active = false
    }
  }, [form.wilayah_fung_daerah_id, form.scope_level])

  useEffect(() => {
    let active = true
    async function loadKelompok() {
      if (form.scope_level !== 'kelompok') {
        setKelompokOptions([])
        return
      }
      try {
        const result = await masterKelompokService.list({
          wilayah_fung_daerah_id: form.wilayah_fung_daerah_id ?? undefined,
          wilayah_fung_desa_id: form.wilayah_fung_desa_id ?? undefined,
          per_page: 100,
        })
        if (active) setKelompokOptions(result.items)
      } catch {
        if (active) setKelompokOptions([])
      }
    }
    void loadKelompok()
    return () => {
      active = false
    }
  }, [form.wilayah_fung_daerah_id, form.wilayah_fung_desa_id, form.scope_level])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: KegiatanJadwalRutinInput = {
      ...form,
      pemateri_id: form.pemateri_id || null,
      materi_ids: form.materi_ids ?? [],
      kategori_kegiatan_id: form.kategori_kegiatan_id || null,
      lokasi_id: form.lokasi_id || null,
      deskripsi: form.deskripsi ? form.deskripsi : undefined,
      jam_mulai: form.jam_mulai ? form.jam_mulai : undefined,
      jam_selesai: form.jam_selesai ? form.jam_selesai : undefined,
      effective_until: form.effective_until ? form.effective_until : undefined,
      wilayah_fung_daerah_id: form.scope_level === 'daerah' ? form.wilayah_fung_daerah_id : form.wilayah_fung_daerah_id || null,
      wilayah_fung_desa_id: form.scope_level === 'desa' ? form.wilayah_fung_desa_id : form.scope_level === 'kelompok' ? form.wilayah_fung_desa_id : null,
      wilayah_fung_kelompok_id: form.scope_level === 'kelompok' ? form.wilayah_fung_kelompok_id : null,
      day_of_week: form.frekuensi === 'mingguan' ? form.day_of_week : null,
      day_of_month: form.frekuensi === 'mingguan' ? null : form.day_of_month,
      month_of_year: form.frekuensi === 'tahunan' ? form.month_of_year : null,
    }

    try {
      if (isEdit && id) {
        await kegiatanJadwalRutinService.update(Number(id), payload)
        notifySaved('jadwal rutin kegiatan', 'update')
      } else {
        const result = await kegiatanJadwalRutinService.create(payload)
        if (result.created > 0) {
          notifySuccess(
            `Jadwal disimpan. ${result.created} kegiatan dibuat — lihat di menu Kegiatan (rentang tanggal ke depan).`,
          )
        } else {
          notifySuccess(
            'Jadwal disimpan. Belum ada tanggal cocok di horizon generate; cek hari/frekuensi atau tekan Generate di daftar jadwal.',
          )
        }
      }
      navigate('/kegiatan/jadwal-rutin')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan jadwal')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPageLoading
        title={isEdit ? 'Edit jadwal rutin' : 'Tambah jadwal rutin'}
        description="Kegiatan dibuat otomatis sesuai frekuensi. Ubah pola jadwal dengan nonaktifkan jadwal lama lalu buat baru."
        message="Memuat jadwal…"
      />
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit jadwal rutin' : 'Tambah jadwal rutin'}</h1>
        <p>
          Kegiatan akan dibuat otomatis sesuai frekuensi. Untuk mengubah pola jadwal, nonaktifkan jadwal lama lalu
          buat jadwal baru.
        </p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="judul">Judul kegiatan</label>
            <input
              id="judul"
              value={form.judul}
              onChange={(event) => setForm((prev) => ({ ...prev, judul: event.target.value }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="kategori_kegiatan_id">Kategori</label>
            <SearchableSelect
              id="kategori_kegiatan_id"
              value={form.kategori_kegiatan_id ? String(form.kategori_kegiatan_id) : ''}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  kategori_kegiatan_id: value ? Number(value) : null,
                }))
              }
              options={[
                { value: '', label: '— Pilih kategori —' },
                ...kategoriOptions.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="pemateri_id">Pemateri</label>
            <SearchableSelect
              id="pemateri_id"
              value={form.pemateri_id ? String(form.pemateri_id) : ''}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  pemateri_id: value ? Number(value) : null,
                }))
              }
              options={[
                { value: '', label: '— Opsional —' },
                ...pemateriOptions.map((item) => ({ value: String(item.id), label: item.nama })),
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
          <div className="field">
            <label htmlFor="frekuensi">Frekuensi</label>
            <select
              id="frekuensi"
              value={form.frekuensi}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  frekuensi: event.target.value as KegiatanJadwalRutinInput['frekuensi'],
                }))
              }
            >
              <option value="mingguan">Mingguan</option>
              <option value="bulanan">Bulanan</option>
              <option value="tahunan">Tahunan</option>
            </select>
          </div>
          {form.frekuensi === 'mingguan' && (
            <div className="field">
              <label htmlFor="day_of_week">Hari</label>
              <SearchableSelect
                id="day_of_week"
                value={String(form.day_of_week ?? 1)}
                onChange={(value) => setForm((prev) => ({ ...prev, day_of_week: Number(value) }))}
                placeholder="— Pilih hari —"
                options={[
                  { value: '', label: '— Pilih hari —' },
                  ...hariMingguSelectOptions(hariMingguOptions),
                ]}
              />
            </div>
          )}
          {form.frekuensi !== 'mingguan' && (
            <div className="field">
              <label htmlFor="day_of_month">Tanggal (1–31)</label>
              <input
                id="day_of_month"
                type="number"
                min={1}
                max={31}
                value={form.day_of_month ?? 1}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, day_of_month: Number(event.target.value) }))
                }
                required
              />
            </div>
          )}
          {form.frekuensi === 'tahunan' && (
            <div className="field">
              <label htmlFor="month_of_year">Bulan</label>
              <SearchableSelect
                id="month_of_year"
                value={String(form.month_of_year ?? 1)}
                onChange={(value) => setForm((prev) => ({ ...prev, month_of_year: Number(value) }))}
                options={MONTH_OPTIONS}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="jam_mulai">Jam mulai</label>
            <TimeInput24
              id="jam_mulai"
              value={form.jam_mulai || ''}
              onChange={(next) => setForm((prev) => ({ ...prev, jam_mulai: next }))}
            />
            <p className="field-hint">Format 24 jam (00–23)</p>
          </div>
          <div className="field">
            <label htmlFor="jam_selesai">Jam selesai</label>
            <TimeInput24
              id="jam_selesai"
              value={form.jam_selesai || ''}
              onChange={(next) => setForm((prev) => ({ ...prev, jam_selesai: next }))}
            />
            <p className="field-hint">Format 24 jam (00–23)</p>
          </div>
          <div className="field">
            <label htmlFor="scope_level">Cakupan</label>
            <select
              id="scope_level"
              value={form.scope_level}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  scope_level: event.target.value as KegiatanJadwalRutinInput['scope_level'],
                  wilayah_fung_daerah_id: null,
                  wilayah_fung_desa_id: null,
                  wilayah_fung_kelompok_id: null,
                }))
              }
            >
              <option value="daerah">Daerah</option>
              <option value="desa">Desa</option>
              <option value="kelompok">Kelompok</option>
            </select>
          </div>
          {(form.scope_level === 'daerah' || form.scope_level === 'desa' || form.scope_level === 'kelompok') && (
            <div className="field">
              <label htmlFor="wilayah_fung_daerah_id">Daerah</label>
              <SearchableSelect
                id="wilayah_fung_daerah_id"
                value={form.wilayah_fung_daerah_id ? String(form.wilayah_fung_daerah_id) : ''}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    wilayah_fung_daerah_id: value ? Number(value) : null,
                    wilayah_fung_desa_id: null,
                    wilayah_fung_kelompok_id: null,
                  }))
                }
                options={[
                  { value: '', label: '— Pilih daerah —' },
                  ...daerahOptions.map((item) => ({ value: String(item.id), label: item.nama })),
                ]}
              />
            </div>
          )}
          {(form.scope_level === 'desa' || form.scope_level === 'kelompok') && (
            <div className="field">
              <label htmlFor="wilayah_fung_desa_id">Desa</label>
              <SearchableSelect
                id="wilayah_fung_desa_id"
                value={form.wilayah_fung_desa_id ? String(form.wilayah_fung_desa_id) : ''}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    wilayah_fung_desa_id: value ? Number(value) : null,
                    wilayah_fung_kelompok_id: null,
                  }))
                }
                options={[
                  { value: '', label: '— Pilih desa —' },
                  ...desaOptions.map((item) => ({ value: String(item.id), label: item.nama })),
                ]}
              />
            </div>
          )}
          {form.scope_level === 'kelompok' && (
            <div className="field">
              <label htmlFor="wilayah_fung_kelompok_id">Kelompok</label>
              <SearchableSelect
                id="wilayah_fung_kelompok_id"
                value={form.wilayah_fung_kelompok_id ? String(form.wilayah_fung_kelompok_id) : ''}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, wilayah_fung_kelompok_id: value ? Number(value) : null }))
                }
                options={[
                  { value: '', label: '— Pilih kelompok —' },
                  ...kelompokOptions.map((item) => ({ value: String(item.id), label: item.nama })),
                ]}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="lokasi_id">Lokasi</label>
            <SearchableSelect
              id="lokasi_id"
              value={form.lokasi_id ? String(form.lokasi_id) : ''}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  lokasi_id: value ? Number(value) : null,
                }))
              }
              options={[
                { value: '', label: '— Pilih lokasi —' },
                ...lokasiOptions.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="effective_from">Berlaku dari</label>
            <DateField
              id="effective_from"
              value={form.effective_from}
              onChange={(next) => setForm((prev) => ({ ...prev, effective_from: next }))}
            />
          </div>
          <div className="field">
            <label htmlFor="effective_until">Berlaku sampai (opsional)</label>
            <DateField
              id="effective_until"
              value={form.effective_until || ''}
              onChange={(next) => setForm((prev) => ({ ...prev, effective_until: next }))}
              min={form.effective_from || undefined}
            />
          </div>
          <div className="field">
            <label htmlFor="generate_horizon_days">Generate ke depan (hari)</label>
            <input
              id="generate_horizon_days"
              type="number"
              min={7}
              max={365}
              value={form.generate_horizon_days ?? 90}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, generate_horizon_days: Number(event.target.value) }))
              }
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="deskripsi">Deskripsi</label>
          <textarea
            id="deskripsi"
            rows={4}
            value={form.deskripsi || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, deskripsi: event.target.value }))}
          />
        </div>
        <div className="form-actions">
          <Link to="/kegiatan/jadwal-rutin" className="btn btn--ghost">
            Batal
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </>
  )
}
