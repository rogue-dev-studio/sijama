/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:30:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
  masterLokasiService,
} from '../api/services'
import type { LokasiInput, LokasiJenis, WilayahSummary } from '../api/types'

const JENIS_OPTIONS: { value: LokasiJenis; label: string }[] = [
  { value: 'masjid', label: 'Masjid LDII' },
  { value: 'gsg', label: 'Gedung Serbaguna (GSG)' },
  { value: 'ppm', label: 'PPM' },
  { value: 'aula', label: 'Aula' },
  { value: 'kantor', label: 'Kantor DPW/DPD/DPP' },
  { value: 'lainnya', label: 'Lainnya' },
]

const emptyForm: LokasiInput = {
  kode: '',
  nama: '',
  jenis: 'masjid',
  kota: '',
  adm_desa_kelurahan_id: null,
  alamat: '',
  is_active: true,
}

export function MasterLokasiFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<LokasiInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [negaraList, setNegaraList] = useState<WilayahSummary[]>([])
  const [provinsiList, setProvinsiList] = useState<WilayahSummary[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<WilayahSummary[]>([])
  const [kecamatanList, setKecamatanList] = useState<WilayahSummary[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<WilayahSummary[]>([])
  const [selectedNegaraId, setSelectedNegaraId] = useState(0)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState(0)
  const [selectedKabupatenKotaId, setSelectedKabupatenKotaId] = useState(0)
  const [selectedKecamatanId, setSelectedKecamatanId] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const negaraResult = await admNegaraService.list({ per_page: 100 })
        if (!active) return
        setNegaraList(negaraResult.items)

        if (id) {
          const lokasi = await masterLokasiService.get(Number(id))
          if (!active) return
          setForm({
            kode: lokasi.kode,
            nama: lokasi.nama,
            jenis: lokasi.jenis,
            kota: lokasi.kota || '',
            adm_desa_kelurahan_id: lokasi.adm_desa_kelurahan_id || null,
            alamat: lokasi.alamat || '',
            is_active: lokasi.is_active,
          })
          if (lokasi.adm_desa_kelurahan_id) {
            await resolveAdmChain(lokasi.adm_desa_kelurahan_id, active)
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat data lokasi')
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

  async function resolveAdmChain(desaKelurahanId: number, active: boolean) {
    try {
      const desaKelurahan = await admDesaKelurahanService.get(desaKelurahanId)
      const kecamatan = await admKecamatanService.get(desaKelurahan.kecamatan_id)
      const kabupatenKota = await admKabupatenKotaService.get(kecamatan.kabupaten_kota_id)
      const provinsi = await admProvinsiService.get(kabupatenKota.provinsi_id)
      if (!active) return

      setSelectedNegaraId(provinsi.negara_id)
      setProvinsiList(
        (await admProvinsiService.list({ negara_id: provinsi.negara_id, per_page: 100 })).items,
      )
      setSelectedProvinsiId(provinsi.id)
      setKabupatenKotaList(
        (await admKabupatenKotaService.list({ provinsi_id: provinsi.id, per_page: 100 })).items,
      )
      setSelectedKabupatenKotaId(kabupatenKota.id)
      setKecamatanList(
        (await admKecamatanService.list({ kabupaten_kota_id: kabupatenKota.id, per_page: 100 }))
          .items,
      )
      setSelectedKecamatanId(kecamatan.id)
      setDesaKelurahanList(
        (await admDesaKelurahanService.list({ kecamatan_id: kecamatan.id, per_page: 100 })).items,
      )
    } catch {
      // Rantai wilayah administratif tidak lengkap; biarkan kota tersimpan apa adanya.
    }
  }

  async function handleNegaraChange(negaraId: number) {
    setSelectedNegaraId(negaraId)
    setSelectedProvinsiId(0)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    setForm((prev) => ({ ...prev, adm_desa_kelurahan_id: null, kota: '' }))
    setProvinsiList(
      negaraId > 0
        ? (await admProvinsiService.list({ negara_id: negaraId, per_page: 100 })).items
        : [],
    )
  }

  async function handleProvinsiChange(provinsiId: number) {
    setSelectedProvinsiId(provinsiId)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKecamatanList([])
    setDesaKelurahanList([])
    setForm((prev) => ({ ...prev, adm_desa_kelurahan_id: null, kota: '' }))
    setKabupatenKotaList(
      provinsiId > 0
        ? (await admKabupatenKotaService.list({ provinsi_id: provinsiId, per_page: 100 })).items
        : [],
    )
  }

  async function handleKabupatenKotaChange(kabupatenKotaId: number) {
    setSelectedKabupatenKotaId(kabupatenKotaId)
    setSelectedKecamatanId(0)
    setDesaKelurahanList([])
    const kota = kabupatenKotaList.find((item) => item.id === kabupatenKotaId)?.nama || ''
    setForm((prev) => ({ ...prev, adm_desa_kelurahan_id: null, kota }))
    setKecamatanList(
      kabupatenKotaId > 0
        ? (await admKecamatanService.list({ kabupaten_kota_id: kabupatenKotaId, per_page: 100 }))
            .items
        : [],
    )
  }

  async function handleKecamatanChange(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    setForm((prev) => ({ ...prev, adm_desa_kelurahan_id: null }))
    setDesaKelurahanList(
      kecamatanId > 0
        ? (await admDesaKelurahanService.list({ kecamatan_id: kecamatanId, per_page: 100 })).items
        : [],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: LokasiInput = {
      ...form,
      kota: form.kota || null,
      adm_desa_kelurahan_id: form.adm_desa_kelurahan_id || null,
      alamat: form.alamat || null,
    }

    try {
      if (isEdit && id) {
        await masterLokasiService.update(Number(id), payload)
      } else {
        await masterLokasiService.create(payload)
      }
      navigate('/master/lokasi')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan lokasi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat data lokasi…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit lokasi' : 'Tambah lokasi'}</h1>
        <p>Lengkapi data lokasi kegiatan dan wilayah administrasi.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="kode">Kode</label>
            <input
              id="kode"
              value={form.kode}
              onChange={(event) => setForm({ ...form, kode: event.target.value })}
              required
              disabled={isEdit}
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
                setForm({ ...form, jenis: event.target.value as LokasiJenis })
              }
              required
            >
              {JENIS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
          <div className="field">
            <label htmlFor="negara">Negara</label>
            <select
              id="negara"
              value={selectedNegaraId}
              onChange={(event) => void handleNegaraChange(Number(event.target.value))}
            >
              <option value={0}>Pilih negara</option>
              {negaraList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="provinsi">Provinsi</label>
            <select
              id="provinsi"
              value={selectedProvinsiId}
              onChange={(event) => void handleProvinsiChange(Number(event.target.value))}
              disabled={!selectedNegaraId}
            >
              <option value={0}>Pilih provinsi</option>
              {provinsiList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="kabupaten_kota">Kabupaten/Kota</label>
            <select
              id="kabupaten_kota"
              value={selectedKabupatenKotaId}
              onChange={(event) => void handleKabupatenKotaChange(Number(event.target.value))}
              disabled={!selectedProvinsiId}
            >
              <option value={0}>Pilih kabupaten/kota</option>
              {kabupatenKotaList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="kecamatan">Kecamatan</label>
            <select
              id="kecamatan"
              value={selectedKecamatanId}
              onChange={(event) => void handleKecamatanChange(Number(event.target.value))}
              disabled={!selectedKabupatenKotaId}
            >
              <option value={0}>Pilih kecamatan</option>
              {kecamatanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="desa_kelurahan">Kelurahan/Desa</label>
            <select
              id="desa_kelurahan"
              value={form.adm_desa_kelurahan_id || 0}
              onChange={(event) =>
                setForm({
                  ...form,
                  adm_desa_kelurahan_id: Number(event.target.value) || null,
                })
              }
              disabled={!selectedKecamatanId}
            >
              <option value={0}>Pilih kelurahan/desa</option>
              {desaKelurahanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="kota">Kota (otomatis)</label>
            <input id="kota" value={form.kota || ''} readOnly />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="alamat">Alamat</label>
            <textarea
              id="alamat"
              value={form.alamat || ''}
              onChange={(event) => setForm({ ...form, alamat: event.target.value })}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/master/lokasi" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
