/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 16:57:14
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { SearchableSelect } from './SearchableSelect'
import { useToast } from './ToastProvider'

export type NamaDeskripsiForm = {
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

type SimpleMasterNamaFormPageProps<TForm extends NamaDeskripsiForm, TItem> = {
  entityLabel: string
  description: string
  listPath: string
  emptyForm: TForm
  get: (id: number) => Promise<TItem>
  create: (data: TForm) => Promise<unknown>
  update: (id: number, data: Partial<TForm>) => Promise<unknown>
  toForm: (item: TItem) => TForm
  toPayload?: (form: TForm) => TForm
  renderExtraFields?: (
    form: TForm,
    setForm: (next: TForm) => void,
  ) => ReactNode
}

export function SimpleMasterNamaFormPage<TForm extends NamaDeskripsiForm, TItem>({
  entityLabel,
  description,
  listPath,
  emptyForm,
  get,
  create,
  update,
  toForm,
  toPayload,
  renderExtraFields,
}: SimpleMasterNamaFormPageProps<TForm, TItem>) {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<TForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (id) {
          const item = await get(Number(id))
          if (!active) return
          setForm(toForm(item))
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : `Gagal memuat ${entityLabel}`)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [id, get, toForm, entityLabel])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const payload = toPayload
      ? toPayload(form)
      : ({
          ...form,
          deskripsi: form.deskripsi || null,
        } as TForm)

    try {
      if (isEdit && id) {
        await update(Number(id), payload)
      } else {
        await create(payload)
      }
      notifySaved(entityLabel, isEdit ? 'update' : 'create')
      navigate(listPath)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Gagal menyimpan ${entityLabel}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat {entityLabel}…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}</h1>
        <p>{description}</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
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
          {renderExtraFields?.(form, setForm)}
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
          <Link to={listPath} className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
