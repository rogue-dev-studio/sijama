/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-24 18:25:00
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { profileService } from '../api/services'
import type {
  Jamaah,
  OwnProfileInput,
  ProfileAdmChain,
  ProfileResult,
  ProfileWilayahOption,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { SearchableSelect } from '../components/SearchableSelect'

type ProfileForm = {
  nama: string
  gender: 'L' | 'P'
  tanggal_lahir: string
  pekerjaan_id: number | null
  pendidikan: string
  golongan_darah: string
  status_pernikahan: string
  alamat: string
  rt: string
  rw: string
  no_hp: string
  email: string
  adm_desa_kelurahan_id: number | null
  kode_pos: string
}

function toForm(jamaah: Jamaah): ProfileForm {
  return {
    nama: jamaah.nama || '',
    gender: jamaah.gender || 'L',
    tanggal_lahir: jamaah.tanggal_lahir || '',
    pekerjaan_id: jamaah.pekerjaan_id || null,
    pendidikan: jamaah.pendidikan || '',
    golongan_darah: jamaah.golongan_darah || '',
    status_pernikahan: jamaah.status_pernikahan || '',
    alamat: jamaah.alamat || '',
    rt: jamaah.rt || '',
    rw: jamaah.rw || '',
    no_hp: jamaah.no_hp || '',
    email: jamaah.email || '',
    adm_desa_kelurahan_id: jamaah.adm_desa_kelurahan_id || null,
    kode_pos: jamaah.kode_pos || '',
  }
}

function formatScope(profile: ProfileResult): string {
  const scope = profile.user.scope
  if (!scope) return '—'
  const parts = [scope.pusat?.nama, scope.daerah?.nama, scope.desa?.nama, scope.kelompok?.nama].filter(
    Boolean,
  )
  return parts.length > 0 ? parts.join(' · ') : '—'
}

export function ProfilePage() {
  const { refresh } = useAuth()
  const [profile, setProfile] = useState<ProfileResult | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [selectedNegaraId, setSelectedNegaraId] = useState(0)
  const [selectedProvinsiId, setSelectedProvinsiId] = useState(0)
  const [selectedKabupatenKotaId, setSelectedKabupatenKotaId] = useState(0)
  const [selectedKecamatanId, setSelectedKecamatanId] = useState(0)
  const [provinsiList, setProvinsiList] = useState<ProfileWilayahOption[]>([])
  const [kabupatenKotaList, setKabupatenKotaList] = useState<ProfileWilayahOption[]>([])
  const [kecamatanList, setKecamatanList] = useState<ProfileWilayahOption[]>([])
  const [desaKelurahanList, setDesaKelurahanList] = useState<ProfileWilayahOption[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await profileService.get()
        if (!active) return
        setProfile(result)
        if (result.jamaah) {
          setForm(toForm(result.jamaah))
          await hydrateAdmChain(result.adm_chain, active)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat profil')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  async function hydrateAdmChain(chain: ProfileAdmChain | null, active = true) {
    if (!chain?.desa_kelurahan_id) {
      setSelectedNegaraId(0)
      setSelectedProvinsiId(0)
      setSelectedKabupatenKotaId(0)
      setSelectedKecamatanId(0)
      setProvinsiList([])
      setKabupatenKotaList([])
      setKecamatanList([])
      setDesaKelurahanList([])
      return
    }

    const negaraId = chain.negara_id || 0
    const provinsiId = chain.provinsi_id || 0
    const kabupatenId = chain.kabupaten_kota_id || 0
    const kecamatanId = chain.kecamatan_id || 0

    const [provinsi, kabupaten, kecamatan, desa] = await Promise.all([
      negaraId ? profileService.wilayahOptions('provinsi', negaraId) : Promise.resolve({ items: [] }),
      provinsiId
        ? profileService.wilayahOptions('kabupaten_kota', provinsiId)
        : Promise.resolve({ items: [] }),
      kabupatenId
        ? profileService.wilayahOptions('kecamatan', kabupatenId)
        : Promise.resolve({ items: [] }),
      kecamatanId
        ? profileService.wilayahOptions('desa_kelurahan', kecamatanId)
        : Promise.resolve({ items: [] }),
    ])

    if (!active) return

    setSelectedNegaraId(negaraId)
    setSelectedProvinsiId(provinsiId)
    setSelectedKabupatenKotaId(kabupatenId)
    setSelectedKecamatanId(kecamatanId)
    setProvinsiList(provinsi.items)
    setKabupatenKotaList(kabupaten.items)
    setKecamatanList(kecamatan.items)
    setDesaKelurahanList(desa.items)
  }

  const dapukanLabel = useMemo(() => {
    if (profile?.jamaah?.dapukan?.length) {
      return profile.jamaah.dapukan.map((item) => item.nama).join(', ')
    }
    if (profile?.user?.dapukan_list?.length) {
      return profile.user.dapukan_list.map((item) => item.nama).join(', ')
    }
    return profile?.user?.dapukan?.nama || '—'
  }, [profile])

  const dapukanJamaahLabel = useMemo(() => {
    if (!profile?.jamaah?.dapukan?.length) return '—'
    return profile.jamaah.dapukan.map((item) => item.nama).join(', ')
  }, [profile])

  async function handleNegaraChange(negaraId: number) {
    setSelectedNegaraId(negaraId)
    setSelectedProvinsiId(0)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKabupatenKotaList([])
    setKecamatanList([])
    setDesaKelurahanList([])
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null } : prev))
    setProvinsiList(
      negaraId > 0 ? (await profileService.wilayahOptions('provinsi', negaraId)).items : [],
    )
  }

  async function handleProvinsiChange(provinsiId: number) {
    setSelectedProvinsiId(provinsiId)
    setSelectedKabupatenKotaId(0)
    setSelectedKecamatanId(0)
    setKecamatanList([])
    setDesaKelurahanList([])
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null } : prev))
    setKabupatenKotaList(
      provinsiId > 0
        ? (await profileService.wilayahOptions('kabupaten_kota', provinsiId)).items
        : [],
    )
  }

  async function handleKabupatenKotaChange(kabupatenKotaId: number) {
    setSelectedKabupatenKotaId(kabupatenKotaId)
    setSelectedKecamatanId(0)
    setDesaKelurahanList([])
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null } : prev))
    setKecamatanList(
      kabupatenKotaId > 0
        ? (await profileService.wilayahOptions('kecamatan', kabupatenKotaId)).items
        : [],
    )
  }

  async function handleKecamatanChange(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null } : prev))
    setDesaKelurahanList(
      kecamatanId > 0
        ? (await profileService.wilayahOptions('desa_kelurahan', kecamatanId)).items
        : [],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form || !profile?.can_edit_jamaah) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const payload: OwnProfileInput = {
      nama: form.nama,
      gender: form.gender,
      tanggal_lahir: form.tanggal_lahir || null,
      pekerjaan_id: form.pekerjaan_id,
      pendidikan: form.pendidikan || null,
      golongan_darah: form.golongan_darah || null,
      status_pernikahan: form.status_pernikahan || null,
      alamat: form.alamat || null,
      rt: form.rt,
      rw: form.rw,
      no_hp: form.no_hp,
      email: form.email || null,
      adm_desa_kelurahan_id: form.adm_desa_kelurahan_id,
      kode_pos: form.kode_pos || null,
    }

    try {
      const result = await profileService.update(payload)
      setProfile(result)
      if (result.jamaah) setForm(toForm(result.jamaah))
      await hydrateAdmChain(result.adm_chain)
      await refresh()
      setSuccess('Profil jamaah berhasil diperbarui.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan profil')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat profil…</div>
  }

  if (!profile) {
    return <div className="alert alert--error">{error || 'Profil tidak tersedia.'}</div>
  }

  const { user, jamaah } = profile

  return (
    <>
      <header className="page-header">
        <h1>Profil saya</h1>
        <p>Akun login dan data jamaah yang tertaut. Ubah data diri lalu simpan.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      <section className="form-panel profile-card">
        <h2 className="profile-card__title">Akun</h2>
        <dl className="profile-dl">
          <div>
            <dt>Nama tampilan</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Username</dt>
            <dd>{user.username}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email || '—'}</dd>
          </div>
          <div>
            <dt>Dapukan</dt>
            <dd>{dapukanLabel}</dd>
          </div>
          <div>
            <dt>Cakupan wilayah</dt>
            <dd>{formatScope(profile)}</dd>
          </div>
        </dl>
      </section>

      {!jamaah && (
        <div className="alert alert--info">
          Akun ini belum ditautkan ke master jamaah, sehingga profil jamaah tidak dapat diubah.
        </div>
      )}

      {jamaah && form && (
        <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
          <h2 className="profile-card__title">Data jamaah</h2>
          <p className="field-hint">
            NIK, kategori umur, kelompok, dapukan jamaah, dan status dikelola sistem/admin — tidak
            dapat diubah.
          </p>

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
              <label htmlFor="nik">NIK</label>
              <input id="nik" value={jamaah.nik || '—'} disabled />
            </div>
            <div className="field">
              <label htmlFor="gender">Jenis kelamin</label>
              <SearchableSelect
                id="gender"
                value={form.gender}
                onChange={(next) => setForm({ ...form, gender: next as 'L' | 'P' })}
                required
                options={
                  (profile.lookups.jenis_kelamin ?? []).length > 0
                    ? (profile.lookups.jenis_kelamin ?? [])
                        .filter((item) => item.value)
                        .map((item) => ({
                          value: String(item.value),
                          label: item.name || String(item.value),
                        }))
                    : [
                        { value: 'L', label: 'Laki-laki' },
                        { value: 'P', label: 'Perempuan' },
                      ]
                }
              />
            </div>
            <div className="field">
              <label htmlFor="tanggal_lahir">Tanggal lahir</label>
              <input
                id="tanggal_lahir"
                type="date"
                value={form.tanggal_lahir}
                onChange={(event) => setForm({ ...form, tanggal_lahir: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="kategori_umur">Kategori umur</label>
              <input
                id="kategori_umur"
                value={jamaah.kategori_umur_label || '—'}
                disabled
              />
            </div>
            <div className="field">
              <label htmlFor="status_pernikahan">Status pernikahan</label>
              <SearchableSelect
                id="status_pernikahan"
                value={form.status_pernikahan}
                onChange={(next) => setForm({ ...form, status_pernikahan: next || '' })}
                placeholder="Pilih status"
                options={[
                  { value: '', label: 'Pilih status' },
                  ...(profile.lookups.status_pernikahan ?? [])
                    .filter((item) => item.value)
                    .map((item) => ({
                      value: String(item.value),
                      label: item.name || String(item.value),
                    })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="pekerjaan_id">Pekerjaan</label>
              <SearchableSelect
                id="pekerjaan_id"
                value={form.pekerjaan_id ? String(form.pekerjaan_id) : ''}
                onChange={(next) => setForm({ ...form, pekerjaan_id: Number(next) || null })}
                placeholder="Pilih pekerjaan"
                options={[
                  { value: '', label: 'Pilih pekerjaan' },
                  ...(profile.lookups.pekerjaan ?? []).map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="golongan_darah">Golongan darah</label>
              <SearchableSelect
                id="golongan_darah"
                value={form.golongan_darah}
                onChange={(next) => setForm({ ...form, golongan_darah: next || '' })}
                placeholder="Pilih golongan darah"
                options={[
                  { value: '', label: 'Pilih golongan darah' },
                  ...(profile.lookups.golongan_darah ?? [])
                    .filter((item) => item.value)
                    .map((item) => ({
                      value: String(item.value),
                      label: item.name || String(item.value),
                    })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="pendidikan">Pendidikan</label>
              <SearchableSelect
                id="pendidikan"
                value={form.pendidikan}
                onChange={(next) => setForm({ ...form, pendidikan: next || '' })}
                placeholder="Pilih pendidikan"
                options={[
                  { value: '', label: 'Pilih pendidikan' },
                  ...(profile.lookups.pendidikan ?? [])
                    .filter((item) => item.value)
                    .map((item) => ({
                      value: String(item.value),
                      label: item.name || String(item.value),
                    })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="no_hp">No. HP</label>
              <input
                id="no_hp"
                value={form.no_hp}
                onChange={(event) => setForm({ ...form, no_hp: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="kelompok">Kelompok</label>
              <input id="kelompok" value={jamaah.kelompok?.nama || '—'} disabled />
            </div>
            <div className="field">
              <label htmlFor="dapukan_jamaah">Dapukan jamaah</label>
              <input id="dapukan_jamaah" value={dapukanJamaahLabel} disabled />
              <p className="field-hint">Otomatis dari kelompok / ditetapkan admin.</p>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <input
                id="status"
                value={jamaah.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                disabled
              />
            </div>
          </div>

          <h2 className="form-section-title">Alamat administratif (opsional)</h2>
          <div className="form-grid form-grid--2">
            <div className="field form-grid__full">
              <label htmlFor="alamat">Alamat</label>
              <textarea
                id="alamat"
                value={form.alamat}
                onChange={(event) => setForm({ ...form, alamat: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="rt">RT</label>
              <input
                id="rt"
                value={form.rt}
                onChange={(event) => setForm({ ...form, rt: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="rw">RW</label>
              <input
                id="rw"
                value={form.rw}
                onChange={(event) => setForm({ ...form, rw: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="negara_id">Negara</label>
              <SearchableSelect
                id="negara_id"
                value={selectedNegaraId ? String(selectedNegaraId) : ''}
                onChange={(next) => void handleNegaraChange(Number(next) || 0)}
                placeholder="Pilih negara"
                options={[
                  { value: '', label: 'Pilih negara' },
                  ...(profile.lookups.negara ?? []).map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="provinsi_id">Provinsi</label>
              <SearchableSelect
                id="provinsi_id"
                value={selectedProvinsiId ? String(selectedProvinsiId) : ''}
                onChange={(next) => void handleProvinsiChange(Number(next) || 0)}
                disabled={provinsiList.length === 0}
                placeholder="Pilih provinsi"
                options={[
                  { value: '', label: 'Pilih provinsi' },
                  ...provinsiList.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="kabupaten_kota_id">Kabupaten/Kota</label>
              <SearchableSelect
                id="kabupaten_kota_id"
                value={selectedKabupatenKotaId ? String(selectedKabupatenKotaId) : ''}
                onChange={(next) => void handleKabupatenKotaChange(Number(next) || 0)}
                disabled={kabupatenKotaList.length === 0}
                placeholder="Pilih kabupaten/kota"
                options={[
                  { value: '', label: 'Pilih kabupaten/kota' },
                  ...kabupatenKotaList.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="kecamatan_id">Kecamatan</label>
              <SearchableSelect
                id="kecamatan_id"
                value={selectedKecamatanId ? String(selectedKecamatanId) : ''}
                onChange={(next) => void handleKecamatanChange(Number(next) || 0)}
                disabled={kecamatanList.length === 0}
                placeholder="Pilih kecamatan"
                options={[
                  { value: '', label: 'Pilih kecamatan' },
                  ...kecamatanList.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="adm_desa_kelurahan_id">Desa/Kelurahan</label>
              <SearchableSelect
                id="adm_desa_kelurahan_id"
                value={form.adm_desa_kelurahan_id ? String(form.adm_desa_kelurahan_id) : ''}
                onChange={(next) =>
                  setForm({ ...form, adm_desa_kelurahan_id: Number(next) || null })
                }
                disabled={desaKelurahanList.length === 0}
                placeholder="Pilih desa/kelurahan"
                options={[
                  { value: '', label: 'Pilih desa/kelurahan' },
                  ...desaKelurahanList.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="kode_pos">Kode pos</label>
              <input
                id="kode_pos"
                value={form.kode_pos}
                onChange={(event) => setForm({ ...form, kode_pos: event.target.value })}
                maxLength={5}
              />
            </div>
          </div>

          {profile.can_edit_jamaah && (
            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          )}
        </form>
      )}
    </>
  )
}
