import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import {
  admDesaKelurahanService,
  admKabupatenKotaService,
  admKecamatanService,
  admNegaraService,
  admProvinsiService,
  jamaahService,
  masterDapukanService,
  masterKelompokService,
  masterPekerjaanService,
} from '../api/services'
import type {
  AdmDesaKelurahan,
  AdmKabupatenKota,
  AdmKecamatan,
  AdmNegara,
  AdmProvinsi,
  Dapukan,
  JamaahInput,
  Kelompok,
  Pekerjaan,
} from '../api/types'
import {
  PENDIDIKAN_OPTIONS,
  STATUS_PERNIKAHAN_OPTIONS,
  type Pendidikan,
  type StatusPernikahan,
} from '../lib/jamaahOptions'

const emptyForm: JamaahInput = {
  kelompok_id: 0,
  nik: '',
  nama: '',
  gender: 'L',
  tanggal_lahir: '',
  pekerjaan: '',
  pekerjaan_id: null,
  dapukan_ids: [],
  pendidikan: '',
  status_pernikahan: '',
  alamat: '',
  rt: '',
  rw: '',
  no_hp: '',
  email: '',
  adm_desa_kelurahan_id: null,
  kode_pos: '',
  status: 'aktif',
}

export function JamaahFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [form, setForm] = useState<JamaahInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [negaraList, setNegaraList] = useState<AdmNegara[]>([])
  const [provinsiList, setProvinsiList] = useState<AdmProvinsi[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<AdmKabupatenKota[]>([])
  const [kecamatanList, setKecamatanList] = useState<AdmKecamatan[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<AdmDesaKelurahan[]>([])
  const [selectedNegaraId, setSelectedNegaraId] = useState<number>(0)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState<number>(0)
  const [selectedKabupatenKotaId, setSelectedKabupatenKotaId] = useState<number>(0)
  const [selectedKecamatanId, setSelectedKecamatanId] = useState<number>(0)
  const [pekerjaanList, setPekerjaanList] = useState<Pekerjaan[]>([])
  const [dapukanList, setDapukanList] = useState<Dapukan[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [kelompokResult, negaraResult, pekerjaanResult, dapukanResult] = await Promise.all([
          masterKelompokService.list(),
          admNegaraService.list({ per_page: 100 }),
          masterPekerjaanService.list({ active_only: true, per_page: 200 }),
          masterDapukanService.list({ per_page: 100 }),
        ])
        if (!active) return
        setKelompokList(kelompokResult.items)
        setNegaraList(negaraResult.items)
        setPekerjaanList(pekerjaanResult.items)
        setDapukanList(dapukanResult.items.filter((item) => item.kode !== 'superadmin'))

        if (id) {
          const jamaah = await jamaahService.get(Number(id))
          if (!active) return
          setForm({
            kelompok_id: jamaah.kelompok_id ?? kelompokResult.items[0]?.id ?? 0,
            nik: jamaah.nik || '',
            nama: jamaah.nama,
            gender: jamaah.gender,
            tanggal_lahir: jamaah.tanggal_lahir || '',
            pekerjaan: jamaah.pekerjaan || '',
            pekerjaan_id: jamaah.pekerjaan_id || null,
            dapukan_ids: jamaah.dapukan_ids || jamaah.dapukan?.map((item) => item.id) || [],
            pendidikan: jamaah.pendidikan || '',
            status_pernikahan: jamaah.status_pernikahan || '',
            alamat: jamaah.alamat || '',
            rt: jamaah.rt,
            rw: jamaah.rw,
            no_hp: jamaah.no_hp,
            email: jamaah.email || '',
            adm_desa_kelurahan_id: jamaah.adm_desa_kelurahan_id,
            kode_pos: jamaah.kode_pos || '',
            status: jamaah.status,
          })

          if (jamaah.adm_desa_kelurahan_id) {
            await resolveAdmChain(jamaah.adm_desa_kelurahan_id, active)
          }
        } else if (kelompokResult.items.length > 0) {
          setForm((prev) => ({ ...prev, kelompok_id: kelompokResult.items[0].id }))
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
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: JamaahInput = {
      ...form,
      nik: form.nik || null,
      tanggal_lahir: form.tanggal_lahir || null,
      pekerjaan_id: form.pekerjaan_id || null,
      dapukan_ids: form.dapukan_ids || [],
      pekerjaan: form.pekerjaan || null,
      pendidikan: form.pendidikan || null,
      status_pernikahan: form.status_pernikahan || null,
      alamat: form.alamat || null,
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
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan jamaah')
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

      {kelompokList.length === 0 && (
        <div className="alert alert--error">
          Belum ada kelompok tersedia. Tambahkan kelompok di master wilayah terlebih dahulu.
        </div>
      )}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="kelompok_id">Kelompok *</label>
            <select
              id="kelompok_id"
              value={form.kelompok_id || ''}
              onChange={(event) => updateField('kelompok_id', Number(event.target.value))}
              required
              disabled={kelompokList.length === 0}
            >
              <option value="" disabled>
                Pilih kelompok
              </option>
              {kelompokList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                  {item.desa?.nama ? ` (${item.desa.nama})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="nama">Nama *</label>
            <input
              id="nama"
              value={form.nama}
              onChange={(event) => updateField('nama', event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="nik">NIK</label>
            <input
              id="nik"
              value={form.nik || ''}
              onChange={(event) => updateField('nik', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="gender">Jenis kelamin *</label>
            <select
              id="gender"
              value={form.gender}
              onChange={(event) => updateField('gender', event.target.value as 'L' | 'P')}
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="tanggal_lahir">Tanggal lahir</label>
            <input
              id="tanggal_lahir"
              type="date"
              value={form.tanggal_lahir || ''}
              onChange={(event) => updateField('tanggal_lahir', event.target.value)}
            />
            <p className="field-hint">
              Kategori umur dihitung otomatis dari tanggal lahir + status pernikahan (menu Informasi →
              Kategori Umur). Pra nikah hanya untuk belum menikah; sudah menikah → Dewasa; usia 60+ →
              Lansia.
            </p>
          </div>
          <div className="field">
            <label htmlFor="status_pernikahan">Status pernikahan</label>
            <select
              id="status_pernikahan"
              value={form.status_pernikahan || ''}
              onChange={(event) =>
                updateField(
                  'status_pernikahan',
                  (event.target.value || null) as StatusPernikahan | null,
                )
              }
            >
              <option value="">Pilih status</option>
              {STATUS_PERNIKAHAN_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pekerjaan_id">Pekerjaan</label>
            <select
              id="pekerjaan_id"
              value={form.pekerjaan_id || 0}
              onChange={(event) => {
                const pekerjaanId = Number(event.target.value) || null
                const selected = pekerjaanList.find((item) => item.id === pekerjaanId)
                setForm((prev) => ({
                  ...prev,
                  pekerjaan_id: pekerjaanId,
                  pekerjaan: selected?.nama || '',
                }))
              }}
            >
              <option value={0}>Pilih pekerjaan</option>
              {pekerjaanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="dapukan_ids">Dapukan (boleh lebih dari satu)</label>
            <select
              id="dapukan_ids"
              multiple
              size={Math.min(8, Math.max(4, dapukanList.length || 4))}
              value={(form.dapukan_ids || []).map(String)}
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map((option) =>
                  Number(option.value),
                )
                updateField('dapukan_ids', selected)
              }}
            >
              {dapukanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.tingkat})
                </option>
              ))}
            </select>
            <p className="field-hint">
              Dipakai akun pengguna yang ditautkan ke jamaah ini; hak akses digabung dari semua
              dapukan terpilih.
            </p>
          </div>
          <div className="field">
            <label htmlFor="pendidikan">Pendidikan</label>
            <select
              id="pendidikan"
              value={form.pendidikan || ''}
              onChange={(event) =>
                updateField('pendidikan', (event.target.value || null) as Pendidikan | null)
              }
            >
              <option value="">Pilih pendidikan</option>
              {PENDIDIKAN_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rt">RT *</label>
            <input
              id="rt"
              value={form.rt}
              onChange={(event) => updateField('rt', event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="rw">RW *</label>
            <input
              id="rw"
              value={form.rw}
              onChange={(event) => updateField('rw', event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="no_hp">No. HP *</label>
            <input
              id="no_hp"
              value={form.no_hp}
              onChange={(event) => updateField('no_hp', event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email || ''}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="alamat">Alamat</label>
            <textarea
              id="alamat"
              value={form.alamat || ''}
              onChange={(event) => updateField('alamat', event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                updateField('status', event.target.value as 'aktif' | 'nonaktif')
              }
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <h2 className="form-section-title">Alamat administratif (opsional)</h2>
        <p className="field-hint">
          Pilih wilayah administrasi resmi untuk melengkapi data desa/kelurahan dan kode pos jamaah.
        </p>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="negara_id">Negara</label>
            <select
              id="negara_id"
              value={selectedNegaraId || ''}
              onChange={(event) => void handleNegaraChange(Number(event.target.value))}
            >
              <option value="">Pilih negara</option>
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
              value={selectedProvinsiId || ''}
              onChange={(event) => void handleProvinsiChange(Number(event.target.value))}
              disabled={provinsiList.length === 0}
            >
              <option value="">Pilih provinsi</option>
              {provinsiList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="kabupaten_kota_id">Kabupaten/Kota</label>
            <select
              id="kabupaten_kota_id"
              value={selectedKabupatenKotaId || ''}
              onChange={(event) => void handleKabupatenKotaChange(Number(event.target.value))}
              disabled={kabupatenKotaList.length === 0}
            >
              <option value="">Pilih kabupaten/kota</option>
              {kabupatenKotaList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="kecamatan_id">Kecamatan</label>
            <select
              id="kecamatan_id"
              value={selectedKecamatanId || ''}
              onChange={(event) => void handleKecamatanChange(Number(event.target.value))}
              disabled={kecamatanList.length === 0}
            >
              <option value="">Pilih kecamatan</option>
              {kecamatanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="adm_desa_kelurahan_id">Desa/Kelurahan</label>
            <select
              id="adm_desa_kelurahan_id"
              value={form.adm_desa_kelurahan_id ?? ''}
              onChange={(event) =>
                updateField(
                  'adm_desa_kelurahan_id',
                  event.target.value ? Number(event.target.value) : null,
                )
              }
              disabled={desaKelurahanList.length === 0}
            >
              <option value="">Pilih desa/kelurahan</option>
              {desaKelurahanList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="kode_pos">Kode Pos</label>
            <input
              id="kode_pos"
              value={form.kode_pos || ''}
              onChange={(event) => updateField('kode_pos', event.target.value)}
              maxLength={5}
              pattern="\d{5}"
              title="5 digit angka"
              placeholder="mis. 12345"
            />
          </div>
        </div>

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
