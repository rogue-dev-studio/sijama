/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 16:44:59
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { profileService } from '../api/services'
import type { Jamaah, OwnProfileInput, ProfileResult } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import {
  PENDIDIKAN_OPTIONS,
  STATUS_PERNIKAHAN_OPTIONS,
  type Pendidikan,
  type StatusPernikahan,
} from '../lib/jamaahOptions'

type ProfileForm = {
  nama: string
  gender: 'L' | 'P'
  tanggal_lahir: string
  pekerjaan_id: number | null
  pendidikan: Pendidikan | ''
  status_pernikahan: StatusPernikahan | ''
  alamat: string
  rt: string
  rw: string
  no_hp: string
  email: string
  kode_pos: string
}

function toForm(jamaah: Jamaah): ProfileForm {
  return {
    nama: jamaah.nama || '',
    gender: jamaah.gender || 'L',
    tanggal_lahir: jamaah.tanggal_lahir || '',
    pekerjaan_id: jamaah.pekerjaan_id || null,
    pendidikan: (jamaah.pendidikan as Pendidikan | null) || '',
    status_pernikahan: (jamaah.status_pernikahan as StatusPernikahan | null) || '',
    alamat: jamaah.alamat || '',
    rt: jamaah.rt || '',
    rw: jamaah.rw || '',
    no_hp: jamaah.no_hp || '',
    email: jamaah.email || '',
    kode_pos: jamaah.kode_pos || '',
  }
}

export function ProfilePage() {
  const { refresh } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const editing = searchParams.get('edit') === '1'
  const [profile, setProfile] = useState<ProfileResult | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await profileService.get()
        if (!active) return
        setProfile(result)
        if (result.jamaah) setForm(toForm(result.jamaah))
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

  const dapukanLabel = useMemo(() => {
    if (!profile?.jamaah?.dapukan?.length) return profile?.user?.dapukan?.nama || '—'
    return profile.jamaah.dapukan.map((item) => item.nama).join(', ')
  }, [profile])

  function setEditMode(next: boolean) {
    if (next) setSearchParams({ edit: '1' })
    else setSearchParams({})
    setSuccess(null)
    setError(null)
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
      status_pernikahan: form.status_pernikahan || null,
      alamat: form.alamat || null,
      rt: form.rt,
      rw: form.rw,
      no_hp: form.no_hp,
      email: form.email || null,
      kode_pos: form.kode_pos || null,
    }

    try {
      const result = await profileService.update(payload)
      setProfile(result)
      if (result.jamaah) setForm(toForm(result.jamaah))
      await refresh()
      setSuccess('Profil jamaah berhasil diperbarui.')
      setEditMode(false)
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
      <header className="page-header page-header__row">
        <div>
          <h1>Profil saya</h1>
          <p>Akun login dan data jamaah yang tertaut.</p>
        </div>
        {profile.can_edit_jamaah && !editing && (
          <button type="button" className="btn btn--primary" onClick={() => setEditMode(true)}>
            Ubah profil jamaah
          </button>
        )}
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
        </dl>
      </section>

      {!jamaah && (
        <div className="alert alert--info">
          Akun ini belum ditautkan ke master jamaah, sehingga profil jamaah tidak dapat diubah.
        </div>
      )}

      {jamaah && !editing && (
        <section className="form-panel profile-card">
          <h2 className="profile-card__title">Data jamaah</h2>
          <dl className="profile-dl">
            <div>
              <dt>Nama</dt>
              <dd>{jamaah.nama}</dd>
            </div>
            <div>
              <dt>NIK</dt>
              <dd>{jamaah.nik || '—'}</dd>
            </div>
            <div>
              <dt>Jenis kelamin</dt>
              <dd>{jamaah.gender === 'P' ? 'Perempuan' : 'Laki-laki'}</dd>
            </div>
            <div>
              <dt>Tanggal lahir</dt>
              <dd>{jamaah.tanggal_lahir || '—'}</dd>
            </div>
            <div>
              <dt>Kategori umur</dt>
              <dd>{jamaah.kategori_umur_label || '—'}</dd>
            </div>
            <div>
              <dt>Pekerjaan</dt>
              <dd>{jamaah.pekerjaan || '—'}</dd>
            </div>
            <div>
              <dt>Pendidikan</dt>
              <dd>{jamaah.pendidikan || '—'}</dd>
            </div>
            <div>
              <dt>Status pernikahan</dt>
              <dd>{jamaah.status_pernikahan || '—'}</dd>
            </div>
            <div>
              <dt>No. HP</dt>
              <dd>{jamaah.no_hp || '—'}</dd>
            </div>
            <div>
              <dt>Email jamaah</dt>
              <dd>{jamaah.email || '—'}</dd>
            </div>
            <div>
              <dt>Alamat</dt>
              <dd>
                {[jamaah.alamat, jamaah.rt ? `RT ${jamaah.rt}` : null, jamaah.rw ? `RW ${jamaah.rw}` : null]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </dd>
            </div>
            <div>
              <dt>Kelompok</dt>
              <dd>{jamaah.kelompok?.nama || '—'}</dd>
            </div>
          </dl>
        </section>
      )}

      {jamaah && editing && form && (
        <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
          <h2 className="profile-card__title">Ubah profil jamaah</h2>
          <p className="field-hint">
            NIK, kelompok, dapukan, dan status dikelola admin — tidak dapat diubah di sini.
          </p>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="nama">Nama *</label>
              <input
                id="nama"
                value={form.nama}
                onChange={(event) => setForm({ ...form, nama: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="gender">Jenis kelamin *</label>
              <select
                id="gender"
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value as 'L' | 'P' })}
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
                value={form.tanggal_lahir}
                onChange={(event) => setForm({ ...form, tanggal_lahir: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="status_pernikahan">Status pernikahan</label>
              <select
                id="status_pernikahan"
                value={form.status_pernikahan}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status_pernikahan: (event.target.value || '') as StatusPernikahan | '',
                  })
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
                onChange={(event) =>
                  setForm({ ...form, pekerjaan_id: Number(event.target.value) || null })
                }
              >
                <option value={0}>Pilih pekerjaan</option>
                {profile.lookups.pekerjaan.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pendidikan">Pendidikan</label>
              <select
                id="pendidikan"
                value={form.pendidikan}
                onChange={(event) =>
                  setForm({ ...form, pendidikan: (event.target.value || '') as Pendidikan | '' })
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
              <label htmlFor="no_hp">No. HP *</label>
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
              <label htmlFor="rt">RT *</label>
              <input
                id="rt"
                value={form.rt}
                onChange={(event) => setForm({ ...form, rt: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="rw">RW *</label>
              <input
                id="rw"
                value={form.rw}
                onChange={(event) => setForm({ ...form, rw: event.target.value })}
                required
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
            <div className="field form-grid__full">
              <label htmlFor="alamat">Alamat</label>
              <textarea
                id="alamat"
                value={form.alamat}
                onChange={(event) => setForm({ ...form, alamat: event.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                if (jamaah) setForm(toForm(jamaah))
                setEditMode(false)
              }}
            >
              Batal
            </button>
          </div>
        </form>
      )}
    </>
  )
}
