/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:20:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admKodePosService,
  admNegaraService,
  admProvinsiService,
} from '../api/services'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmKodePosInput,
  AdmNegara,
  AdmProvinsi,
} from '../api/types'
import { ApiError } from '../api/client'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { FormPageLoading } from '../components/FormPageLoading'

type KodePosForm = AdmKodePosInput

const emptyForm: KodePosForm = {
  kode: '',
  wilayah_adm_desa_id: 0,
  is_active: true,
}

export function MasterAdmKodePosFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()

  const [form, setForm] = useState<KodePosForm>(emptyForm)
  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<AdmDesaKelurahan[]>([])
  const [selectedNegaraId, setSelectedNegaraId] = useState(0)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState(0)
  const [selectedKabupatenKotaId, setSelectedKabupatenKotaId] = useState(0)
  const [selectedKecamatanId, setSelectedKecamatanId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const negaraResult = await admNegaraService.list({ per_page: 100 })
        if (!active) return
        setNegaraList(negaraResult.items)

        if (id) {
          const item = await admKodePosService.get(Number(id))
          if (!active) return
          setForm({
            kode: item.kode,
            wilayah_adm_desa_id: item.wilayah_adm_desa_id || 0,
            is_active: item.is_active,
          })
          if (item.wilayah_adm_desa_id) {
            await resolveAdmChain(item.wilayah_adm_desa_id, active)
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat kode pos')
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
  }

  async function handleNegaraChange(negaraId: number) {
    setSelectedNegaraId(negaraId)
    setSelectedProvinsiId(0)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: 0 }))
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
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: 0 }))
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
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: 0 }))
    setKecamatanList(
      kabupatenKotaId > 0
        ? (await admKecamatanService.list({ wilayah_adm_kabupaten_kota_id: kabupatenKotaId, per_page: 100 }))
            .items
        : [],
    )
  }

  async function handleKecamatanChange(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    setForm((prev) => ({ ...prev, wilayah_adm_desa_id: 0 }))
    setDesaKelurahanList(
      kecamatanId > 0
        ? (await admDesaKelurahanService.list({ wilayah_adm_kecamatan_id: kecamatanId, per_page: 100 })).items
        : [],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: AdmKodePosInput = {
      kode: form.kode.trim(),
      wilayah_adm_desa_id: form.wilayah_adm_desa_id,
      is_active: form.is_active,
    }

    try {
      if (isEdit && id) {
        await admKodePosService.update(Number(id), payload)
      } else {
        await admKodePosService.create(payload)
      }
      notifySaved('Kode pos')
      navigate('/master/wilayah-adm/kode-pos')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kode pos')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPageLoading
        title={isEdit ? 'Ubah kode pos' : 'Tambah kode pos'}
        description="Pilih wilayah administrasi dari negara hingga desa/kelurahan, lalu isi kode pos 5 digit."
        message="Memuat…"
      />
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isEdit ? 'Ubah kode pos' : 'Tambah kode pos'}</h1>
          <p className="page-header__subtitle">
            Pilih wilayah administrasi dari negara hingga desa/kelurahan, lalu isi kode pos 5 digit.
          </p>
        </div>
        <Link to="/master/wilayah-adm/kode-pos" className="btn btn--ghost">
          Kembali
        </Link>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="card card--form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="wilayah_adm_negara_id">Negara</label>
            <SearchableSelect
              id="wilayah_adm_negara_id"
              value={selectedNegaraId ? String(selectedNegaraId) : ''}
              onChange={(next) => void handleNegaraChange(Number(next) || 0)}
              placeholder="Pilih negara"
              options={[
                { value: '', label: 'Pilih negara' },
                ...negaraList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="wilayah_adm_provinsi_id">Provinsi</label>
            <SearchableSelect
              id="wilayah_adm_provinsi_id"
              value={selectedProvinsiId ? String(selectedProvinsiId) : ''}
              onChange={(next) => void handleProvinsiChange(Number(next) || 0)}
              disabled={provinsiList.length === 0}
              placeholder="Pilih provinsi"
              options={[
                { value: '', label: 'Pilih provinsi' },
                ...provinsiList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="wilayah_adm_kabupaten_kota_id">Kabupaten/Kota</label>
            <SearchableSelect
              id="wilayah_adm_kabupaten_kota_id"
              value={selectedKabupatenKotaId ? String(selectedKabupatenKotaId) : ''}
              onChange={(next) => void handleKabupatenKotaChange(Number(next) || 0)}
              disabled={kabupatenKotaList.length === 0}
              placeholder="Pilih kabupaten/kota"
              options={[
                { value: '', label: 'Pilih kabupaten/kota' },
                ...kabupatenKotaList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="wilayah_adm_kecamatan_id">Kecamatan</label>
            <SearchableSelect
              id="wilayah_adm_kecamatan_id"
              value={selectedKecamatanId ? String(selectedKecamatanId) : ''}
              onChange={(next) => void handleKecamatanChange(Number(next) || 0)}
              disabled={kecamatanList.length === 0}
              placeholder="Pilih kecamatan"
              options={[
                { value: '', label: 'Pilih kecamatan' },
                ...kecamatanList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="wilayah_adm_desa_id">Desa/Kelurahan</label>
            <SearchableSelect
              id="wilayah_adm_desa_id"
              value={form.wilayah_adm_desa_id ? String(form.wilayah_adm_desa_id) : ''}
              onChange={(next) =>
                setForm({ ...form, wilayah_adm_desa_id: Number(next) || 0 })
              }
              disabled={desaKelurahanList.length === 0}
              placeholder="Pilih desa/kelurahan"
              options={[
                { value: '', label: 'Pilih desa/kelurahan' },
                ...desaKelurahanList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="kode">Kode pos</label>
            <input
              id="kode"
              value={form.kode}
              onChange={(event) => setForm({ ...form, kode: event.target.value })}
              maxLength={5}
              pattern="\d{5}"
              title="5 digit angka"
              placeholder="mis. 40123"
              required
            />
          </div>
          <div className="field">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={form.is_active !== false}
                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
              />
              <span>Aktif</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}
