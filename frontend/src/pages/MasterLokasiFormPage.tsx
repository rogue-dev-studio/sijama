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
import { LokasiMapFields } from '../components/LokasiMapFields'
import { SearchableSelect } from '../components/SearchableSelect'
import { isValidCoords } from '../lib/googleMaps'
const JENIS_OPTIONS: { value: LokasiJenis; label: string }[] = [
  { value: 'masjid', label: 'Masjid LDII' },
  { value: 'gsg', label: 'Gedung Serbaguna (GSG)' },
  { value: 'ppm', label: 'PPM' },
  { value: 'aula', label: 'Aula' },
  { value: 'kantor', label: 'Kantor DPW/DPD/DPP' },
  { value: 'lainnya', label: 'Lainnya' },
]

const emptyForm: LokasiInput = {
  nama: '',
  jenis: 'masjid',
  kota: '',
  adm_desa_kelurahan_id: null,
  alamat: '',
  lat: null,
  lng: null,
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
            nama: lokasi.nama,
            jenis: lokasi.jenis,
            kota: lokasi.kota || '',
            adm_desa_kelurahan_id: lokasi.adm_desa_kelurahan_id || null,
            alamat: lokasi.alamat || '',
            lat: lokasi.lat ?? null,
            lng: lokasi.lng ?? null,
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

    const lat = form.lat ?? null
    const lng = form.lng ?? null
    if ((lat != null || lng != null) && !isValidCoords(lat, lng)) {
      setError('Koordinat tidak valid. Latitude -90…90, longitude -180…180, keduanya harus diisi.')
      setSubmitting(false)
      return
    }

    const payload: LokasiInput = {
      ...form,
      kota: form.kota || null,
      adm_desa_kelurahan_id: form.adm_desa_kelurahan_id || null,
      alamat: form.alamat || null,
      lat,
      lng,
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
        <p>Lengkapi data lokasi, wilayah administrasi, dan titik Google Maps untuk share lokasi.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
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
            <SearchableSelect
              id="jenis"
              value={form.jenis}
              onChange={(next) => setForm({ ...form, jenis: next as LokasiJenis })}
              required
              options={[
                ...JENIS_OPTIONS.map((option) => ({ value: String(option.value), label: option.label })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="is_active">Status</label>
            <SearchableSelect
              id="is_active"
              value={form.is_active ? '1' : '0'}
              onChange={(next) => setForm({ ...form, is_active: next === '1' })}
              options={[
                { value: "1", label: "Aktif" },
                { value: "0", label: "Nonaktif" },
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="negara">Negara</label>
            <SearchableSelect
              id="negara"
              value={selectedNegaraId ? String(selectedNegaraId) : ''}
              onChange={(next) => void handleNegaraChange(Number(next))}
              placeholder="Pilih negara"
              options={[
                { value: '', label: 'Pilih negara' },
                ...negaraList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="provinsi">Provinsi</label>
            <SearchableSelect
              id="provinsi"
              value={selectedProvinsiId ? String(selectedProvinsiId) : ''}
              onChange={(next) => void handleProvinsiChange(Number(next))}
              placeholder="Pilih provinsi"
              disabled={!selectedNegaraId}
              options={[
                { value: '', label: 'Pilih provinsi' },
                ...provinsiList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="kabupaten_kota">Kabupaten/Kota</label>
            <SearchableSelect
              id="kabupaten_kota"
              value={selectedKabupatenKotaId ? String(selectedKabupatenKotaId) : ''}
              onChange={(next) => void handleKabupatenKotaChange(Number(next))}
              placeholder="Pilih kabupaten/kota"
              disabled={!selectedProvinsiId}
              options={[
                { value: '', label: 'Pilih kabupaten/kota' },
                ...kabupatenKotaList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="kecamatan">Kecamatan</label>
            <SearchableSelect
              id="kecamatan"
              value={selectedKecamatanId ? String(selectedKecamatanId) : ''}
              onChange={(next) => void handleKecamatanChange(Number(next))}
              placeholder="Pilih kecamatan"
              disabled={!selectedKabupatenKotaId}
              options={[
                { value: '', label: 'Pilih kecamatan' },
                ...kecamatanList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="desa_kelurahan">Kelurahan/Desa</label>
            <SearchableSelect
              id="desa_kelurahan"
              value={form.adm_desa_kelurahan_id ? String(form.adm_desa_kelurahan_id) : ''}
              onChange={(next) => setForm({
                  ...form,
                  adm_desa_kelurahan_id: Number(next) || null,
                })}
              placeholder="Pilih kelurahan/desa"
              disabled={!selectedKecamatanId}
              options={[
                { value: '', label: 'Pilih kelurahan/desa' },
                ...desaKelurahanList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
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

        <LokasiMapFields
          lat={form.lat}
          lng={form.lng}
          onChange={({ lat, lng }) => setForm((prev) => ({ ...prev, lat, lng }))}
        />

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
