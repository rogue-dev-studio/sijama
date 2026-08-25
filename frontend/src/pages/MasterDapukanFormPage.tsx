/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:00:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterDapukanService } from '../api/services'
import type { DapukanInput } from '../api/types'
import { SearchableSelect } from '../components/SearchableSelect'

const emptyForm: DapukanInput = {
  slug: '',
  nama: '',
  deskripsi: '',
  urutan: 0,
  is_active: true,
}

export function MasterDapukanFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<DapukanInput>(emptyForm)
  const [isSystem, setIsSystem] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (id) {
          const item = await masterDapukanService.get(Number(id))
          if (!active) return
          setIsSystem(item.is_system)
          setForm({
            slug: item.slug,
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            urutan: item.urutan,
            is_active: item.is_active,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat dapukan')
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload: DapukanInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (isEdit && id) {
        await masterDapukanService.update(Number(id), payload)
      } else {
        await masterDapukanService.create(payload)
      }
      navigate('/master/dapukan')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan dapukan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat dapukan…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit dapukan' : 'Tambah dapukan'}</h1>
        <p>Kelola peran dan tingkat akses pengguna.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              required
              disabled={isEdit && isSystem}
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
            <label htmlFor="urutan">Urutan</label>
            <input
              id="urutan"
              type="number"
              min={0}
              value={form.urutan ?? 0}
              onChange={(event) => setForm({ ...form, urutan: Number(event.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="is_active">Status</label>
            <SearchableSelect
              id="is_active"
              value={form.is_active ? '1' : '0'}
              onChange={(next) => setForm({ ...form, is_active: next === '1' })}
              options={[
                { value: '1', label: 'Aktif' },
                { value: '0', label: 'Nonaktif' },
              ]}
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="deskripsi">Deskripsi</label>
            <textarea
              id="deskripsi"
              value={form.deskripsi || ''}
              onChange={(event) => setForm({ ...form, deskripsi: event.target.value })}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/master/dapukan" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
