/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-24 18:25:00
 */

import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'
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
import { LoginSessionFields } from '../components/LoginSessionFields'
import { PasswordInput } from '../components/PasswordInput'
import { ProfilePhotoUpload } from '../components/ProfilePhotoUpload'
import { ProfileSignatureUpload } from '../components/ProfileSignatureUpload'
import { useToast } from '../components/ToastProvider'
import { describeLoginSessionExpiry, parseLoginRememberMinutesInput } from '../lib/loginSession'
import { kodePosFromDesa } from '../lib/kodePosFromDesa'
import {
  syncPreferenceFromRememberMinutes,
  writeLoginSessionPreference,
} from '../lib/loginSessionPreference'

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

type ProfileTab = 'akun' | 'identitas' | 'kontak' | 'keanggotaan' | 'alamat' | 'keamanan' | 'sesi'

const PROFILE_TABS: Array<{ id: ProfileTab; label: string; requiresJamaah?: boolean }> = [
  { id: 'akun', label: 'Akun' },
  { id: 'identitas', label: 'Identitas', requiresJamaah: true },
  { id: 'kontak', label: 'Kontak', requiresJamaah: true },
  { id: 'keanggotaan', label: 'Keanggotaan', requiresJamaah: true },
  { id: 'alamat', label: 'Alamat', requiresJamaah: true },
  { id: 'keamanan', label: 'Keamanan' },
  { id: 'sesi', label: 'Sesi login' },
]

type PasswordForm = {
  current_password: string
  password: string
  password_confirmation: string
}

const EMPTY_PASSWORD_FORM: PasswordForm = {
  current_password: '',
  password: '',
  password_confirmation: '',
}

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const first = Object.values(err.errors).flat()[0]
      if (first) return first
    }
    return err.message
  }
  return 'Permintaan gagal'
}

export function ProfilePage() {
  const { refresh } = useAuth()
  const { notifySaved, notifySuccess } = useToast()
  const [profile, setProfile] = useState<ProfileResult | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(EMPTY_PASSWORD_FORM)
  const [loginRememberMinutesInput, setLoginRememberMinutesInput] = useState('')
  const [loginUntilLogout, setLoginUntilLogout] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [sessionSubmitting, setSessionSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({})
  const [tab, setTab] = useState<ProfileTab>('akun')
  const tabsId = useId()

  const visibleTabs = useMemo(
    () => PROFILE_TABS.filter((item) => !item.requiresJamaah || Boolean(profile?.jamaah)),
    [profile?.jamaah],
  )

  useEffect(() => {
    if (visibleTabs.length === 0) return
    if (!visibleTabs.some((item) => item.id === tab)) {
      setTab(visibleTabs[0].id)
    }
  }, [visibleTabs, tab])

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
        const sessionPref = syncPreferenceFromRememberMinutes(
          result.login_session.login_remember_minutes,
          result.login_session.login_remember_until_logout,
        )
        setLoginUntilLogout(sessionPref.untilLogout)
        setLoginRememberMinutesInput(sessionPref.minutesInput)
        writeLoginSessionPreference(sessionPref)
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
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null, kode_pos: '' } : prev))
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
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null, kode_pos: '' } : prev))
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
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null, kode_pos: '' } : prev))
    setKecamatanList(
      kabupatenKotaId > 0
        ? (await profileService.wilayahOptions('kecamatan', kabupatenKotaId)).items
        : [],
    )
  }

  async function handleKecamatanChange(kecamatanId: number) {
    setSelectedKecamatanId(kecamatanId)
    setForm((prev) => (prev ? { ...prev, adm_desa_kelurahan_id: null, kode_pos: '' } : prev))
    setDesaKelurahanList(
      kecamatanId > 0
        ? (await profileService.wilayahOptions('desa_kelurahan', kecamatanId)).items
        : [],
    )
  }

  function handleDesaKelurahanChange(next: string) {
    const desaId = next ? Number(next) : null
    setForm((prev) =>
      prev
        ? {
            ...prev,
            adm_desa_kelurahan_id: desaId,
            kode_pos: kodePosFromDesa(desaKelurahanList, desaId),
          }
        : prev,
    )
  }

  async function handleProfilePhotoUpdated(result: ProfileResult) {
    setProfile(result)
    if (result.jamaah) {
      setForm(toForm(result.jamaah))
    }
    setError(null)
    notifySuccess('Foto profil berhasil diperbarui')
    await refresh()
  }

  function handleProfilePhotoError(message: string) {
    setError(message)
  }

  async function handleProfileSignatureUpdated(result: ProfileResult) {
    setProfile(result)
    setError(null)
    notifySuccess('Tanda tangan berhasil diperbarui')
    await refresh()
  }

  function handleProfileSignatureError(message: string) {
    setError(message)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form || !profile?.can_edit_jamaah) return

    setSubmitting(true)
    setError(null)

    const payload: OwnProfileInput = {
      nama: form.nama,
      gender: form.gender,
      tanggal_lahir: form.tanggal_lahir || null,
      pekerjaan_id: form.pekerjaan_id,
      pendidikan: form.pendidikan || null,
      golongan_darah: form.golongan_darah || null,
      status_pernikahan: form.status_pernikahan || null,
      alamat: form.alamat || null,
      rt: form.rt.trim() || undefined,
      rw: form.rw.trim() || undefined,
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
      notifySaved('profil jamaah', 'update')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan profil')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setPasswordSubmitting(true)
    setPasswordError(null)
    setPasswordFieldErrors({})

    try {
      await profileService.updatePassword(passwordForm)
      setPasswordForm(EMPTY_PASSWORD_FORM)
      notifySuccess('Password berhasil diperbarui.', 'Berhasil')
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const nextFieldErrors: Record<string, string> = {}
        for (const [field, messages] of Object.entries(err.errors)) {
          if (messages[0]) nextFieldErrors[field] = messages[0]
        }
        setPasswordFieldErrors(nextFieldErrors)
      }
      setPasswordError(formatApiError(err))
    } finally {
      setPasswordSubmitting(false)
    }
  }

  async function handleLoginSessionSubmit(event: FormEvent) {
    event.preventDefault()
    setSessionSubmitting(true)
    setSessionError(null)

    const minMinutes = profile?.login_session.min_minutes ?? 1
    const maxMinutes = profile?.login_session.max_minutes ?? 525_600

    let payloadMinutes: number | null = null
    if (!loginUntilLogout) {
      const trimmed = loginRememberMinutesInput.trim()
      if (trimmed !== '') {
        const parsed = parseLoginRememberMinutesInput(
          loginRememberMinutesInput,
          minMinutes,
          maxMinutes,
        )
        if (!parsed.ok) {
          setSessionError(parsed.message)
          setSessionSubmitting(false)
          return
        }
        payloadMinutes = parsed.minutes
      }
    }

    try {
      const result = await profileService.updateLoginSession({
        login_remember_minutes: payloadMinutes,
        login_remember_until_logout: loginUntilLogout,
      })
      setProfile(result)
      const sessionPref = syncPreferenceFromRememberMinutes(
        result.login_session.login_remember_minutes,
        result.login_session.login_remember_until_logout,
      )
      setLoginUntilLogout(sessionPref.untilLogout)
      setLoginRememberMinutesInput(sessionPref.minutesInput)
      writeLoginSessionPreference(sessionPref)
      notifySuccess('Preferensi sesi login berhasil disimpan.', 'Berhasil')
    } catch (err) {
      setSessionError(formatApiError(err))
    } finally {
      setSessionSubmitting(false)
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
        <p>Kelola akun login dan data jamaah yang terhubung. Simpan setelah selesai mengubah.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <section className="form-panel profile-page">
        <div className="konfig-tabs" role="tablist" aria-label="Kategori profil">
          {visibleTabs.map((item) => {
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${tabsId}-${item.id}`}
                className={`konfig-tabs__tab${selected ? ' is-active' : ''}`}
                aria-selected={selected}
                aria-controls={`${tabsId}-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`${tabsId}-panel-akun`}
          aria-labelledby={`${tabsId}-akun`}
          hidden={tab !== 'akun'}
          className="profile-tab-panel"
        >
          <h2 className="profile-card__title">Akun</h2>
          {jamaah && (
            <ProfilePhotoUpload
              fotoPath={jamaah.foto_path}
              disabled={submitting || passwordSubmitting || sessionSubmitting}
              onUpdated={(result) => void handleProfilePhotoUpdated(result)}
              onError={handleProfilePhotoError}
            />
          )}
          <ProfileSignatureUpload
            signaturePath={user.path_tanda_tangan}
            disabled={submitting || passwordSubmitting || sessionSubmitting}
            onUpdated={(result) => void handleProfileSignatureUpdated(result)}
            onError={handleProfileSignatureError}
          />
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
          {!jamaah && (
            <div className="alert alert--info">
              Akun belum terhubung ke data jamaah. Profil jamaah tidak bisa diubah.
            </div>
          )}
        </div>

        {jamaah && form && (
          <form onSubmit={(event) => void handleSubmit(event)}>
            <div
              role="tabpanel"
              id={`${tabsId}-panel-identitas`}
              aria-labelledby={`${tabsId}-identitas`}
              hidden={tab !== 'identitas'}
              className="profile-tab-panel"
            >
              <h2 className="profile-card__title">Identitas</h2>
              <p className="field-hint">
                NIK, kategori umur, dan beberapa data lain dikelola sistem/admin — tidak dapat diubah.
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
              </div>
            </div>

            <div
              role="tabpanel"
              id={`${tabsId}-panel-kontak`}
              aria-labelledby={`${tabsId}-kontak`}
              hidden={tab !== 'kontak'}
              className="profile-tab-panel"
            >
              <h2 className="profile-card__title">Kontak</h2>
              <div className="form-grid form-grid--2">
                <div className="field">
                  <label htmlFor="no_hp">No. HP</label>
                  <input
                    id="no_hp"
                    value={form.no_hp}
                    onChange={(event) => setForm({ ...form, no_hp: event.target.value })}
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
              </div>
            </div>

            <div
              role="tabpanel"
              id={`${tabsId}-panel-keanggotaan`}
              aria-labelledby={`${tabsId}-keanggotaan`}
              hidden={tab !== 'keanggotaan'}
              className="profile-tab-panel"
            >
              <h2 className="profile-card__title">Keanggotaan</h2>
              <p className="field-hint">
                Kelompok, dapukan jamaah, dan status ditetapkan admin — tidak dapat diubah dari profil.
              </p>
              <div className="form-grid form-grid--2">
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
            </div>

            <div
              role="tabpanel"
              id={`${tabsId}-panel-alamat`}
              aria-labelledby={`${tabsId}-alamat`}
              hidden={tab !== 'alamat'}
              className="profile-tab-panel"
            >
              <h2 className="profile-card__title">Alamat</h2>
              <p className="field-hint">Alamat administratif (opsional).</p>
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
                  />
                </div>
                <div className="field">
                  <label htmlFor="rw">RW</label>
                  <input
                    id="rw"
                    value={form.rw}
                    onChange={(event) => setForm({ ...form, rw: event.target.value })}
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
                    onChange={handleDesaKelurahanChange}
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
                  <p className="field-hint">
                    Terisi otomatis dari master kode pos desa/kelurahan jika ada. Bisa diubah
                    manual.
                  </p>
                </div>
              </div>
            </div>

            {profile.can_edit_jamaah && tab !== 'akun' && tab !== 'keamanan' && tab !== 'sesi' && (
              <div className="form-actions">
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Menyimpan…' : 'Simpan'}
                </button>
              </div>
            )}
          </form>
        )}

        <form
          onSubmit={(event) => void handlePasswordSubmit(event)}
          hidden={tab !== 'keamanan'}
        >
          <div
            role="tabpanel"
            id={`${tabsId}-panel-keamanan`}
            aria-labelledby={`${tabsId}-keamanan`}
            hidden={tab !== 'keamanan'}
            className="profile-tab-panel"
          >
            <h2 className="profile-card__title">Keamanan</h2>
            <p className="field-hint">Ubah password login akun Anda. Minimal 8 karakter.</p>

            {passwordError && <div className="alert alert--error">{passwordError}</div>}

            <div className="form-grid">
              <div className="field">
                <label htmlFor="current_password">Password saat ini</label>
                <PasswordInput
                  id="current_password"
                  leadingIcon
                  autoComplete="current-password"
                  value={passwordForm.current_password}
                  onChange={(event) =>
                    setPasswordForm({ ...passwordForm, current_password: event.target.value })
                  }
                  aria-invalid={Boolean(passwordFieldErrors.current_password)}
                  required
                />
                {passwordFieldErrors.current_password && (
                  <p className="field-hint field-hint--error">{passwordFieldErrors.current_password}</p>
                )}
              </div>
              <div className="field">
                <label htmlFor="password">Password baru</label>
                <PasswordInput
                  id="password"
                  leadingIcon
                  autoComplete="new-password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm({ ...passwordForm, password: event.target.value })
                  }
                  aria-invalid={Boolean(passwordFieldErrors.password)}
                  minLength={8}
                  required
                />
                {passwordFieldErrors.password && (
                  <p className="field-hint field-hint--error">{passwordFieldErrors.password}</p>
                )}
              </div>
              <div className="field">
                <label htmlFor="password_confirmation">Konfirmasi password baru</label>
                <PasswordInput
                  id="password_confirmation"
                  leadingIcon
                  autoComplete="new-password"
                  value={passwordForm.password_confirmation}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      password_confirmation: event.target.value,
                    })
                  }
                  aria-invalid={Boolean(passwordFieldErrors.password_confirmation)}
                  minLength={8}
                  required
                />
                {passwordFieldErrors.password_confirmation && (
                  <p className="field-hint field-hint--error">
                    {passwordFieldErrors.password_confirmation}
                  </p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={passwordSubmitting}>
                {passwordSubmitting ? 'Menyimpan…' : 'Ubah password'}
              </button>
            </div>
          </div>
        </form>

        <form onSubmit={(event) => void handleLoginSessionSubmit(event)} hidden={tab !== 'sesi'}>
          <div
            role="tabpanel"
            id={`${tabsId}-panel-sesi`}
            aria-labelledby={`${tabsId}-sesi`}
            hidden={tab !== 'sesi'}
            className="profile-tab-panel"
          >
            <h2 className="profile-card__title">Sesi login</h2>
            <p className="field-hint">
              Atur lama login tetap aktif saat &quot;Ingat saya&quot; dicentang. Bawaan user baru{' '}
              {profile.login_session.default_minutes} menit (1 hari). Kosongkan jika belum diatur,
              misalnya setelah login tanpa Ingat saya.
            </p>

            {sessionError && <div className="alert alert--error">{sessionError}</div>}

            <div className="form-grid">
              <LoginSessionFields
                idPrefix="profile-login-session"
                minutesInput={loginRememberMinutesInput}
                untilLogout={loginUntilLogout}
                minMinutes={profile.login_session.min_minutes}
                maxMinutes={profile.login_session.max_minutes}
                defaultMinutes={profile.login_session.default_minutes}
                disabled={sessionSubmitting}
                onMinutesInputChange={setLoginRememberMinutesInput}
                onUntilLogoutChange={(checked) => {
                  setLoginUntilLogout(checked)
                  if (checked) {
                    setLoginRememberMinutesInput('')
                  }
                }}
              />
            </div>

            <p className="field-hint profile-session-expiry">
              {describeLoginSessionExpiry(profile.login_session.current_token_expires_at)}
            </p>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={sessionSubmitting}>
                {sessionSubmitting ? 'Menyimpan…' : 'Simpan preferensi'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </>
  )
}
