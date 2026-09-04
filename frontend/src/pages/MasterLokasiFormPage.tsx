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
import { LokasiMapFields, type LokasiMapsApplyPayload } from '../components/LokasiMapFields'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { FormPageLoading } from '../components/FormPageLoading'
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
  wilayah_adm_desa_id: null,
  alamat: '',
  lat: null,
  lng: null,
  maps_place_id: null,
  maps_place_name: null,
  maps_url: null,
  is_active: true,
}

export function MasterLokasiFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
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
            wilayah_adm_desa_id: lokasi.wilayah_adm_desa_id || null,
            alamat: lokasi.alamat || '',
            lat: lokasi.lat ?? null,
            lng: lokasi.lng ?? null,
            maps_place_id: lokasi.maps_place_id ?? null,
            maps_place_name: lokasi.maps_place_name ?? null,
            maps_url: lokasi.maps_url ?? null,
            is_active: lokasi.is_active,
          })
          if (lokasi.wilayah_adm_desa_id) {
            await resolveAdmChain(lokasi.wilayah_adm_desa_id, active)
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
      const kecamatan = await admKecamatanService.get(desaKelurahan.wilayah_adm_kecamatan_id)
      const kabupatenKota = await admKabupatenKotaService.get(kecamatan.wilayah_adm_kabupaten_kota_id)
      const provinsi = await admProvinsiService.get(kabupatenKota.wilayah_adm_provinsi_id)
      if (!active) return

      setSelectedNegaraId(provinsi.wilayah_adm_negara_id)
      setProvinsiList(
        (await admProvinsiService.list({ wilayah_adm_negara_id: provinsi.wilayah_adm_negara_id, per_page: 100 })).items,
      )
      setSelectedProvinsiId(provinsi.id)
      setKabupatenKotaList(
        (await admKabupatenKotaService.list({ wilayah_adm_provinsi_id: provinsi.id, per_page: 100 })).items,
      )
      setSelectedKabupatenKotaId(kabupatenKota.id)
      setKecamatanList(
        (await admKecamatanService.list({ wilayah_adm_kabupaten_kota_id: kabupatenKota.id, per_page: 100 }))
          .items,
      )
      setSelectedKecamatanId(kecamatan.id)
      setDesaKelurahanList(
        (await admDesaKelurahanService.list({ wilayah_adm_kecamatan_id: kecamatan.id, per_page: 100 })).items,
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
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: null, kota: '' }))
    setProvinsiList(
      negaraId > 0
        ? (await admProvinsiService.list({ wilayah_adm_negara_id: negaraId, per_page: 100 })).items
        : [],
    )
  }

  async function handleProvinsiChange(provinsiId: number) {
    setSelectedProvinsiId(provinsiId)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKecamatanList([])
    setDesaKelurahanList([])
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: null, kota: '' }))
    setKabupatenKotaList(
      provinsiId > 0
        ? (await admKabupatenKotaService.list({ wilayah_adm_provinsi_id: provinsiId, per_page: 100 })).items
        : [],
    )
  }

  async function handleKabupatenKotaChange(kabupatenKotaId: number) {
    setSelectedKabupatenKotaId(kabupatenKotaId)
    setSelectedKecamatanId(0)
    setDesaKelurahanList([])
    const kota = kabupatenKotaList.find((item) => item.id === kabupatenKotaId)?.nama || ''
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: null, kota }))
    setKecamatanList(
      kabupatenKotaId > 0
        ? (await admKecamatanService.list({ wilayah_adm_kabupaten_kota_id: kabupatenKotaId, per_page: 100 }))
            .items
        : [],
    )
  }

  async function handleKecamatanChange(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: null }))
    setDesaKelurahanList(
      kecamatanId > 0
        ? (await admDesaKelurahanService.list({ wilayah_adm_kecamatan_id: kecamatanId, per_page: 100 })).items
        : [],
    )
  }

  async function applyFromMaps(payload: LokasiMapsApplyPayload) {
    const adm = payload.adm
    const nextAlamat = payload.alamat?.trim() || null
    const nextKota = adm?.labels?.wilayah_adm_kabupaten_kota?.trim() || null
    const mapsPlaceName = payload.place_name?.trim() || null
    const mapsPlaceId = payload.place_id?.trim() || null
    const mapsUrl = payload.maps_url?.trim() || null

    setForm((prev) => ({
      ...prev,
      lat: payload.lat,
      lng: payload.lng,
      alamat: nextAlamat || prev.alamat,
      kota: nextKota || prev.kota,
      maps_place_id: mapsPlaceId || prev.maps_place_id || null,
      maps_place_name: mapsPlaceName || prev.maps_place_name || null,
      maps_url: mapsUrl || prev.maps_url || null,
      nama: prev.nama.trim() ? prev.nama : mapsPlaceName || prev.nama,
      wilayah_adm_desa_id: adm?.wilayah_adm_desa_id ?? prev.wilayah_adm_desa_id,
    }))

    if (!adm?.wilayah_adm_negara_id) {
      return
    }

    setSelectedNegaraId(adm.wilayah_adm_negara_id)
    setProvinsiList(
      (await admProvinsiService.list({ wilayah_adm_negara_id: adm.wilayah_adm_negara_id, per_page: 100 })).items,
    )

    if (!adm.wilayah_adm_provinsi_id) {
      setSelectedProvinsiId(0)
      setSelectedKabupatenKotaId(0)
      setSelectedKecamatanId(0)
      setKabupatenKotaList([])
      setKecamatanList([])
      setDesaKelurahanList([])
      setForm((prev) => ({ ...prev, wilayah_adm_desa_id: null }))
      return
    }

    setSelectedProvinsiId(adm.wilayah_adm_provinsi_id)
    setKabupatenKotaList(
      (await admKabupatenKotaService.list({ wilayah_adm_provinsi_id: adm.wilayah_adm_provinsi_id, per_page: 100 })).items,
    )

    if (!adm.wilayah_adm_kabupaten_kota_id) {
      setSelectedKabupatenKotaId(0)
      setSelectedKecamatanId(0)
      setKecamatanList([])
      setDesaKelurahanList([])
      setForm((prev) => ({ ...prev, wilayah_adm_desa_id: null, kota: nextKota || prev.kota }))
      return
    }

    setSelectedKabupatenKotaId(adm.wilayah_adm_kabupaten_kota_id)
    setKecamatanList(
      (
        await admKecamatanService.list({
          wilayah_adm_kabupaten_kota_id: adm.wilayah_adm_kabupaten_kota_id,
          per_page: 100,
        })
      ).items,
    )

    if (!adm.wilayah_adm_kecamatan_id) {
      setSelectedKecamatanId(0)
      setDesaKelurahanList([])
      setForm((prev) => ({
        ...prev,
        wilayah_adm_desa_id: null,
        kota: nextKota || prev.kota,
      }))
      return
    }

    setSelectedKecamatanId(adm.wilayah_adm_kecamatan_id)
    setDesaKelurahanList(
      (await admDesaKelurahanService.list({ wilayah_adm_kecamatan_id: adm.wilayah_adm_kecamatan_id, per_page: 100 })).items,
    )
    setForm((prev) => ({
      ...prev,
      wilayah_adm_desa_id: adm.wilayah_adm_desa_id ?? null,
      kota: nextKota || prev.kota,
      alamat: nextAlamat || prev.alamat,
    }))
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
      wilayah_adm_desa_id: form.wilayah_adm_desa_id || null,
      alamat: form.alamat || null,
      lat,
      lng,
      maps_place_id: form.maps_place_id || null,
      maps_place_name: form.maps_place_name || null,
      maps_url: form.maps_url || null,
    }

    try {
      if (isEdit && id) {
        await masterLokasiService.update(Number(id), payload)
      } else {
        await masterLokasiService.create(payload)
      }
      notifySaved('lokasi', isEdit ? 'update' : 'create')
      navigate('/master/lokasi')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan lokasi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPageLoading
        title={isEdit ? 'Edit lokasi' : 'Tambah lokasi'}
        description="Lengkapi data lokasi, wilayah administrasi, dan titik Google Maps untuk share lokasi."
        message="Memuat data lokasi…"
      />
    )
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
            <label htmlFor="wilayah_adm_desa">Kelurahan/Desa</label>
            <SearchableSelect
              id="wilayah_adm_desa"
              value={form.wilayah_adm_desa_id ? String(form.wilayah_adm_desa_id) : ''}
              onChange={(next) => setForm({
                  ...form,
                  wilayah_adm_desa_id: Number(next) || null,
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
          placeName={form.maps_place_name || form.nama}
          mapsPlaceId={form.maps_place_id}
          mapsUrl={form.maps_url}
          onChange={({ lat, lng }) => setForm((prev) => ({ ...prev, lat, lng }))}
          onApplyFromMaps={applyFromMaps}
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
