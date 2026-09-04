/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:00:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterFiturService, masterMenuService } from '../api/services'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { FormPageLoading } from '../components/FormPageLoading'
import type { FiturInput, Menu } from '../api/types'

const emptyForm: FiturInput = {
  menu_id: 0,
  slug: '',
  nama: '',
  deskripsi: '',
  is_active: true,
}

export function MasterFiturFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<FiturInput>(emptyForm)
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const menusResult = await masterMenuService.list({ per_page: 100 })
        if (!active) return
        setMenus(menusResult.items)

        if (id) {
          const item = await masterFiturService.get(Number(id))
          if (!active) return
          setForm({
            menu_id: item.menu_id,
            slug: item.slug,
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            is_active: item.is_active,
          })
        } else {
          setForm({ ...emptyForm, menu_id: menusResult.items[0]?.id ?? 0 })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat fitur')
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

    const payload: FiturInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (isEdit && id) {
        await masterFiturService.update(Number(id), payload)
      } else {
        await masterFiturService.create(payload)
      }
      notifySaved('fitur', isEdit ? 'update' : 'create')
      navigate('/master/fitur')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan fitur')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <FormPageLoading
        title={isEdit ? 'Edit fitur' : 'Tambah fitur'}
        description="Kelola fitur per menu navigasi."
        message="Memuat fitur…"
      />
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit fitur' : 'Tambah fitur'}</h1>
        <p>Kelola fitur per menu navigasi.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="menu_id">Menu</label>
            <SearchableSelect
              id="menu_id"
              value={form.menu_id ? String(form.menu_id) : ''}
              onChange={(next) => setForm({ ...form, menu_id: Number(next) })}
              placeholder="Pilih menu"
              required
              options={[
                { value: '', label: 'Pilih menu' },
                ...menus.map((menu) => ({ value: String(menu.id), label: menu.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input
              id="slug"
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              required
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
          <Link to="/master/fitur" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
