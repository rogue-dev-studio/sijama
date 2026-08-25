/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:40:00
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { jamaahService, masterUserService } from '../api/services'
import type { Jamaah, MasterUserInput } from '../api/types'

import { SearchableSelect } from '../components/SearchableSelect'
type UserForm = {
  username: string
  password: string
  jamaah_id: number
  is_active: boolean
}

const emptyForm: UserForm = {
  username: '',
  password: '',
  jamaah_id: 0,
  is_active: true,
}

export function MasterUsersFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [jamaahList, setJamaahList] = useState<Jamaah[]>([])
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [previewName, setPreviewName] = useState('')
  const [previewEmail, setPreviewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedJamaah = useMemo(
    () => jamaahList.find((item) => item.id === form.jamaah_id) || null,
    [jamaahList, form.jamaah_id],
  )

  const dapukanLabels =
    selectedJamaah?.dapukan?.map((item) => `${item.nama} (${item.tingkat})`).join(', ') ||
    '—'

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const jamaahResult = await jamaahService.list({ status: 'aktif', per_page: 200 })
        if (!active) return
        setJamaahList(jamaahResult.items)

        if (id) {
          const item = await masterUserService.get(Number(id))
          if (!active) return
          setForm({
            username: item.username,
            password: '',
            jamaah_id: item.jamaah_id || 0,
            is_active: item.is_active,
          })
          setPreviewName(item.name)
          setPreviewEmail(item.email || '')
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat pengguna')
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

  function handleJamaahChange(jamaahId: number) {
    const jamaah = jamaahList.find((item) => item.id === jamaahId)
    setForm((prev) => ({ ...prev, jamaah_id: jamaahId }))
    setPreviewName(jamaah?.nama || '')
    setPreviewEmail(jamaah?.email || '')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.jamaah_id) {
      setError('Pilih jamaah. Dapukan dan cakupan wilayah diambil otomatis dari jamaah.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isEdit && id) {
        const payload: Partial<MasterUserInput> = {
          username: form.username,
          jamaah_id: form.jamaah_id,
          is_active: form.is_active,
        }
        if (form.password) payload.password = form.password
        await masterUserService.update(Number(id), payload)
      } else {
        await masterUserService.create({
          username: form.username,
          password: form.password,
          jamaah_id: form.jamaah_id,
          is_active: form.is_active,
        })
      }
      navigate('/master/users')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan pengguna')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat pengguna…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit pengguna' : 'Tambah pengguna'}</h1>
        <p>Akun login ditautkan ke jamaah; dapukan dan cakupan wilayah mengikuti master jamaah.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="jamaah_id">Jamaah</label>
            <SearchableSelect
              id="jamaah_id"
              value={form.jamaah_id ? String(form.jamaah_id) : ''}
              onChange={(next) => handleJamaahChange(Number(next))}
              placeholder="Pilih jamaah"
              required
              options={[
                { value: '', label: 'Pilih jamaah' },
                ...jamaahList.map((item) => ({
                  value: String(item.id),
                  label: item.nama + (item.email ? ` · ${item.email}` : ''),
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="name_preview">Nama (dari jamaah)</label>
            <input id="name_preview" value={previewName} readOnly />
          </div>
          <div className="field">
            <label htmlFor="email_preview">Email (dari jamaah)</label>
            <input id="email_preview" value={previewEmail || '—'} readOnly />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="dapukan_preview">Dapukan (dari jamaah)</label>
            <input id="dapukan_preview" value={dapukanLabels} readOnly />
          </div>
          <div className="field">
            <label htmlFor="password">
              Password{isEdit ? ' (kosongkan jika tidak diubah)' : ''}
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required={!isEdit}
              minLength={isEdit ? undefined : 8}
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
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : isEdit ? 'Perbarui' : 'Simpan'}
          </button>
          <Link to="/master/users" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
