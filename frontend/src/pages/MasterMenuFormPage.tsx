/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:00:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterMenuService } from '../api/services'
import { MENU_ICON_NAMES, MenuIcon } from '../components/MenuIcon'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import type { Menu, MenuInput } from '../api/types'

const emptyForm: MenuInput = {
  parent_id: null,
  slug: '',
  nama: '',
  path: '',
  icon: '',
  urutan: 0,
  is_active: true,
}

export function MasterMenuFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<MenuInput>(emptyForm)
  const [allMenus, setAllMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const menusResult = await masterMenuService.list({ per_page: 100 })
        if (!active) return
        setAllMenus(menusResult.items)

        if (id) {
          const item = await masterMenuService.get(Number(id))
          if (!active) return
          setForm({
            parent_id: item.parent_id,
            slug: item.slug,
            nama: item.nama,
            path: item.path || '',
            icon: item.icon || '',
            urutan: item.urutan,
            is_active: item.is_active,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat menu')
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

    const payload: MenuInput = {
      ...form,
      parent_id: form.parent_id || null,
      path: form.path || null,
      icon: form.icon || null,
    }

    try {
      if (isEdit && id) {
        await masterMenuService.update(Number(id), payload)
      } else {
        await masterMenuService.create(payload)
      }
      notifySaved('menu', isEdit ? 'update' : 'create')
      navigate('/master/menu')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan menu')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat menu…</div>
  }

  const editingId = id ? Number(id) : null
  const parentOptions = allMenus.filter((item) => item.id !== editingId)

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit menu' : 'Tambah menu'}</h1>
        <p>Kelola struktur navigasi aplikasi.</p>
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
            <label htmlFor="parent_id">Parent</label>
            <SearchableSelect
              id="parent_id"
              value={form.parent_id != null ? String(form.parent_id) : ''}
              onChange={(next) =>
                setForm({
                  ...form,
                  parent_id: next ? Number(next) : null,
                })
              }
              placeholder="— Root —"
              options={[
                { value: '', label: '— Root —' },
                ...parentOptions.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="path">Path</label>
            <input
              id="path"
              value={form.path || ''}
              onChange={(event) => setForm({ ...form, path: event.target.value })}
              placeholder="/jamaah"
            />
          </div>
          <div className="field">
            <label htmlFor="icon">Icon</label>
            <div className="field-control field-control--icon-pick">
              <span className="field-control__icon" aria-hidden>
                <MenuIcon name={form.icon || 'circle'} size={16} />
              </span>
              <SearchableSelect
                id="icon"
                value={form.icon || ''}
                onChange={(next) => setForm({ ...form, icon: next })}
                placeholder="— Pilih icon —"
                options={[
                  { value: '', label: '— Pilih icon —' },
                  ...MENU_ICON_NAMES.map((name) => ({ value: String(name), label: name })),
                ]}
              />
            </div>
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
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/master/menu" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
