import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
  jamaahService,
  lookupOptionsService,
} from '../api/services'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
  JamaahDapukanOption,
  JamaahInput,
  Kelompok,
  LookupOption,
} from '../api/types'
import { JAMAAH_FORM_TYPES, LOOKUP_TYPE } from '../lib/lookupTypes'
import { parseBirthInfoFromNik } from '../lib/nik'
import { JamaahAddressFields } from './jamaah/JamaahAddressFields'
import { JamaahProfileFields } from './jamaah/JamaahProfileFields'
import {
  emptyJamaahForm as emptyForm,
  JAMAHA_KELOMPOK_DAPUKAN_SLUG,
  normalizeDapukanIds,
  withJamaahKelompokDapukan,
} from './jamaah/jamaahFormUtils'

export function JamaahFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [form, setForm] = useState<JamaahInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<AdmDesaKelurahan[]>([])
  const [selectedNegaraId, setSelectedNegaraId] = useState<number>(0)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<number>(0)
  const [selectedKabupatenKotaId, setSelectedKabupatenKotaId] = useState<number>(0)
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<number>(0)
  const [pekerjaanOptions, setPekerjaanOptions] = useState<LookupOption[]>([])
  const [jenisKelaminOptions, setJenisKelaminOptions] = useState<LookupOption[]>([])
  const [golonganDarahOptions, setGolonganDarahOptions] = useState<LookupOption[]>([])
  const [statusPernikahanOptions, setStatusPernikahanOptions] = useState<LookupOption[]>([])
  const [pendidikanOptions, setPendidikanOptions] = useState<LookupOption[]>([])
  const [dapukanList, setDapukanList] = useState<JamaahDapukanOption[]>([])
  const [dapukanError, setDapukanError] = useState<string | null>(null)
  const [kelompokError, setKelompokError] = useState<string | null>(null)

  const jamaahKelompokDapukanId = useMemo(() => {
    const item = dapukanList.find((dapukan) => dapukan.slug === JAMAHA_KELOMPOK_DAPUKAN_SLUG)
    return item?.id ?? null
  }, [dapukanList])

  useEffect(() => {
    if (!jamaahKelompokDapukanId || !form.kelompok_id) return
    setForm((prev) => {
      const current = normalizeDapukanIds(prev.dapukan_ids)
      if (current.includes(jamaahKelompokDapukanId)) return prev
      return {
        ...prev,
        dapukan_ids: withJamaahKelompokDapukan(current, prev.kelompok_id, jamaahKelompokDapukanId),
      }
    })
  }, [jamaahKelompokDapukanId, form.kelompok_id])

  useEffect(() => {
    let active = true

    async function load() {
      setError(null)
      setDapukanError(null)
      setKelompokError(null)
      try {
        let loadedKelompok: Kelompok[] = []

        const lookupsPromise = lookupOptionsService
          .byTypes([...JAMAAH_FORM_TYPES])
          .then((result) => {
            if (!active) return
            setPekerjaanOptions(result[LOOKUP_TYPE.PEKERJAAN] ?? [])
            setJenisKelaminOptions(result[LOOKUP_TYPE.JENIS_KELAMIN] ?? [])
            setGolonganDarahOptions(result[LOOKUP_TYPE.GOLONGAN_DARAH] ?? [])
            setStatusPernikahanOptions(result[LOOKUP_TYPE.STATUS_PERNIKAHAN] ?? [])
            setPendidikanOptions(result[LOOKUP_TYPE.PENDIDIKAN] ?? [])
          })
          .catch((err) => {
            if (active) {
              setPekerjaanOptions([])
              setJenisKelaminOptions([])
              setGolonganDarahOptions([])
              setStatusPernikahanOptions([])
              setPendidikanOptions([])
              setError(err instanceof ApiError ? err.message : 'Gagal memuat opsi lookup')
            }
          })

        const negaraPromise = admNegaraService
          .list({ per_page: 100 })
          .then((result) => {
            if (active) setNegaraList(result.items)
          })
          .catch(() => {
            if (active) setNegaraList([])
          })

        const kelompokPromise = jamaahService
          .kelompokOptions()
          .then((items) => {
            loadedKelompok = items
            if (active) setKelompokList(items)
          })
          .catch((err) => {
            if (active) {
              setKelompokList([])
              setKelompokError(
                err instanceof ApiError ? err.message : 'Gagal memuat daftar kelompok',
              )
            }
          })

        let loadedDapukan: JamaahDapukanOption[] = []
        const dapukanPromise = jamaahService
          .dapukanOptions()
          .then((items) => {
            loadedDapukan = items
            if (active) setDapukanList(items)
          })
          .catch((err) => {
            if (active) {
              setDapukanList([])
              setDapukanError(
                err instanceof ApiError ? err.message : 'Gagal memuat daftar dapukan',
              )
            }
          })

        await Promise.all([lookupsPromise, negaraPromise, kelompokPromise, dapukanPromise])
        if (!active) return

        const lockedDapukanId =
          loadedDapukan.find((item) => item.slug === JAMAHA_KELOMPOK_DAPUKAN_SLUG)?.id ?? null

        if (id) {
          const jamaah = await jamaahService.get(Number(id))
          if (!active) return
          const kelompokId = jamaah.kelompok_id ?? loadedKelompok[0]?.id ?? 0
          setForm({
            kelompok_id: kelompokId,
            nik: jamaah.nik || '',
            nama: jamaah.nama,
            gender: jamaah.gender,
            tanggal_lahir: jamaah.tanggal_lahir || '',
            pekerjaan: jamaah.pekerjaan || '',
            pekerjaan_id: jamaah.pekerjaan_id || null,
            dapukan_ids: withJamaahKelompokDapukan(
              jamaah.dapukan_ids ?? jamaah.dapukan?.map((item) => item.id),
              kelompokId,
              lockedDapukanId,
            ),
            pendidikan: jamaah.pendidikan || '',
            golongan_darah: jamaah.golongan_darah || '',
            status_pernikahan: jamaah.status_pernikahan || '',
            alamat: jamaah.alamat || '',
            rt: jamaah.rt || '',
            rw: jamaah.rw || '',
            no_hp: jamaah.no_hp,
            email: jamaah.email || '',
            adm_desa_kelurahan_id: jamaah.adm_desa_kelurahan_id,
            kode_pos: jamaah.kode_pos || '',
            status: jamaah.status,
          })

          if (jamaah.adm_desa_kelurahan_id) {
            await resolveAdmChain(jamaah.adm_desa_kelurahan_id, active)
          }
        } else if (loadedKelompok.length > 0) {
          const kelompokId = loadedKelompok[0].id
          setForm((prev) => ({
            ...prev,
            kelompok_id: kelompokId,
            dapukan_ids: withJamaahKelompokDapukan(prev.dapukan_ids, kelompokId, lockedDapukanId),
          }))
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat data')
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
      setProvinsiList(await loadProvinsiForNegara(provinsi.negara_id))
      setSelectedProvinsiId(provinsi.id)
      setKabupatenKotaList(await loadKabupatenKotaForProvinsi(provinsi.id))
      setSelectedKabupatenKotaId(kabupatenKota.id)
      setKecamatanList(await loadKecamatanForKabupatenKota(kabupatenKota.id))
      setSelectedKecamatanId(kecamatan.id)
      setDesaKelurahanList(await loadDesaKelurahanForKecamatan(kecamatan.id))
    } catch {
      // Rantai wilayah administratif tidak lengkap; biarkan kode pos tersimpan apa adanya.
    }
  }

  async function loadProvinsiForNegara(negaraId: number) {
    return (await admProvinsiService.list({ negara_id: negaraId || undefined, per_page: 100 })).items
  }

  async function loadKabupatenKotaForProvinsi(provinsiId: number) {
    return (
      await admKabupatenKotaService.list({ provinsi_id: provinsiId || undefined, per_page: 100 })
    ).items
  }

  async function loadKecamatanForKabupatenKota(kabupatenKotaId: number) {
    return (
      await admKecamatanService.list({ kabupaten_kota_id: kabupatenKotaId || undefined, per_page: 100 })
    ).items
  }

  async function loadDesaKelurahanForKecamatan(kecamatanId: number) {
    return (
      await admDesaKelurahanService.list({ kecamatan_id: kecamatanId || undefined, per_page: 100 })
    ).items
  }

  async function handleNegaraChange(negaraId: number) {
    setSelectedNegaraId(negaraId)
    setSelectedProvinsiId(0)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    updateField('adm_desa_kelurahan_id', null)
    setProvinsiList(negaraId > 0 ? await loadProvinsiForNegara(negaraId) : [])
  }

  async function handleProvinsiChange(provinsiId: number) {
    setSelectedProvinsiId(provinsiId)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKecamatanList([])
    setDesaKelurahanList([])
    updateField('adm_desa_kelurahan_id', null)
    setKabupatenKotaList(provinsiId > 0 ? await loadKabupatenKotaForProvinsi(provinsiId) : [])
  }

  async function handleKabupatenKotaChange(kabupatenKotaId: number) {
    setSelectedKabupatenKotaId(kabupatenKotaId)
    setSelectedKecamatanId(0)
    setDesaKelurahanList([])
    updateField('adm_desa_kelurahan_id', null)
    setKecamatanList(kabupatenKotaId > 0 ? await loadKecamatanForKabupatenKota(kabupatenKotaId) : [])
  }

  async function handleKecamatanChange(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    updateField('adm_desa_kelurahan_id', null)
    setDesaKelurahanList(kecamatanId > 0 ? await loadDesaKelurahanForKecamatan(kecamatanId) : [])
  }

  function updateField<K extends keyof JamaahInput>(key: K, value: JamaahInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  function fieldMessage(name: string): string | null {
    return fieldErrors[name]?.[0] ?? null
  }

  function isFieldInvalid(name: string): boolean {
    return Boolean(fieldErrors[name]?.length)
  }

  function handleNikChange(rawValue: string) {
    const nik = rawValue.replace(/\D/g, '').slice(0, 16)
    const birthInfo = parseBirthInfoFromNik(nik)

    setForm((prev) => ({
      ...prev,
      nik,
      ...(birthInfo
        ? {
            tanggal_lahir: birthInfo.tanggalLahir,
            gender: birthInfo.gender,
          }
        : {}),
    }))
    setFieldErrors((prev) => {
      if (!prev.nik && !prev.tanggal_lahir && !prev.gender) return prev
      const next = { ...prev }
      delete next.nik
      delete next.tanggal_lahir
      delete next.gender
      return next
    })
  }

  function toggleDapukan(id: number) {
    if (jamaahKelompokDapukanId && id === jamaahKelompokDapukanId) {
      return
    }
    setForm((prev) => {
      const current = normalizeDapukanIds(prev.dapukan_ids)
      const next = current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
      return {
        ...prev,
        dapukan_ids: withJamaahKelompokDapukan(next, prev.kelompok_id, jamaahKelompokDapukanId),
      }
    })
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})

    const assignableDapukanIds = new Set(dapukanList.map((item) => item.id))
    const dapukanIds = withJamaahKelompokDapukan(
      form.dapukan_ids,
      form.kelompok_id,
      jamaahKelompokDapukanId,
    ).filter((id) => assignableDapukanIds.has(id))
    const payload: JamaahInput = {
      ...form,
      nik: form.nik || null,
      tanggal_lahir: form.tanggal_lahir || null,
      pekerjaan_id: form.pekerjaan_id || null,
      dapukan_ids: dapukanIds,
      pekerjaan: form.pekerjaan || null,
      pendidikan: form.pendidikan || null,
      golongan_darah: form.golongan_darah || null,
      status_pernikahan: form.status_pernikahan || null,
      alamat: form.alamat || null,
      rt: form.rt || null,
      rw: form.rw || null,
      email: form.email || null,
      adm_desa_kelurahan_id: form.adm_desa_kelurahan_id || null,
      kode_pos: form.kode_pos || null,
    }

    try {
      if (isEdit && id) {
        await jamaahService.update(Number(id), payload)
      } else {
        await jamaahService.create(payload)
      }
      navigate('/jamaah')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        setFieldErrors(err.errors ?? {})
      } else {
        setError('Gagal menyimpan jamaah')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat data jamaah…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit jamaah' : 'Tambah jamaah'}</h1>
        <p>Lengkapi identitas jamaah untuk keperluan administrasi.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      {kelompokError && <div className="alert alert--error">{kelompokError}</div>}

      {kelompokList.length === 0 && !kelompokError && (
        <div className="alert alert--error">
          Belum ada kelompok tersedia dalam cakupan akses Anda. Pastikan akun Admin Kelompok sudah
          di-assign ke sebuah kelompok di master users.
        </div>
      )}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <JamaahProfileFields
          form={form}
          kelompokList={kelompokList}
          pekerjaanOptions={pekerjaanOptions}
          jenisKelaminOptions={jenisKelaminOptions}
          golonganDarahOptions={golonganDarahOptions}
          statusPernikahanOptions={statusPernikahanOptions}
          pendidikanOptions={pendidikanOptions}
          dapukanList={dapukanList}
          dapukanError={dapukanError}
          fieldMessage={fieldMessage}
          isFieldInvalid={isFieldInvalid}
          updateField={updateField}
          onKelompokChange={(kelompokId) => {
            setForm((prev) => ({
              ...prev,
              kelompok_id: kelompokId,
              dapukan_ids: withJamaahKelompokDapukan(
                prev.dapukan_ids,
                kelompokId,
                jamaahKelompokDapukanId,
              ),
            }))
            setFieldErrors((prev) => {
              if (!prev.kelompok_id) return prev
              const nextErrors = { ...prev }
              delete nextErrors.kelompok_id
              return nextErrors
            })
          }}
          onNikChange={handleNikChange}
          onToggleDapukan={toggleDapukan}
          onPekerjaanChange={(pekerjaanId) => {
            const selected = pekerjaanOptions.find((item) => item.id === pekerjaanId)
            setForm((prev) => ({
              ...prev,
              pekerjaan_id: pekerjaanId,
              pekerjaan: selected?.name || '',
            }))
          }}
        />

        <JamaahAddressFields
          form={form}
          negaraList={negaraList}
          provinsiList={provinsiList}
          kabupatenKotaList={kabupatenKotaList}
          kecamatanList={kecamatanList}
          desaKelurahanList={desaKelurahanList}
          selectedNegaraId={selectedNegaraId}
          selectedProvinsiId={selectedProvinsiId}
          selectedKabupatenKotaId={selectedKabupatenKotaId}
          selectedKecamatanId={selectedKecamatanId}
          updateField={updateField}
          onNegaraChange={handleNegaraChange}
          onProvinsiChange={handleProvinsiChange}
          onKabupatenKotaChange={handleKabupatenKotaChange}
          onKecamatanChange={handleKecamatanChange}
        />

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || kelompokList.length === 0}
          >
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/jamaah" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
