/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:21:51
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:29:10
 */

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { SearchableSelect } from './SearchableSelect'
import { useToast } from './ToastProvider'

export type KodeNamaForm = {
  kode: string
  nama: string
  deskripsi?: string | null
  is_active?: boolean
}

export type ParentSelectConfig<TForm> = {
  field: keyof TForm & string
  label: string
  loadOptions: () => Promise<Array<{ id: number; nama: string }>>
  emptyMessage: string
  allowEmptyOptions?: boolean
}

type SimpleMasterKodeFormPageProps<TForm extends KodeNamaForm, TItem> = {
  entityLabel: string
  description: string
  listPath: string
  emptyForm: TForm
  get: (id: number) => Promise<TItem>
  create: (data: TForm) => Promise<unknown>
  update: (id: number, data: Partial<TForm>) => Promise<unknown>
  toForm: (item: TItem) => TForm
  toPayload?: (form: TForm) => TForm
  showDeskripsi?: boolean
  parentSelect?: ParentSelectConfig<TForm>
  renderExtraFields?: (form: TForm, setForm: (next: TForm) => void, isEdit: boolean) => ReactNode
}

export function SimpleMasterKodeFormPage<TForm extends KodeNamaForm, TItem>({
  entityLabel,
  description,
  listPath,
  emptyForm,
  get,
  create,
  update,
  toForm,
  toPayload,
  showDeskripsi = true,
  parentSelect,
  renderExtraFields,
}: SimpleMasterKodeFormPageProps<TForm, TItem>) {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<TForm>(emptyForm)
  const [parentOptions, setParentOptions] = useState<Array<{ id: number; nama: string }>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        let options: Array<{ id: number; nama: string }> = []
        if (parentSelect) {
          options = await parentSelect.loadOptions()
          if (!active) return
          setParentOptions(options)
        }

        if (id) {
          const item = await get(Number(id))
          if (!active) return
          setForm(toForm(item))
        } else if (parentSelect && options.length > 0) {
          setForm({
            ...emptyForm,
            [parentSelect.field]: options[0].id,
          } as TForm)
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
  }, [id, get, toForm, entityLabel, parentSelect, emptyForm])

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

  if (parentSelect && parentOptions.length === 0 && !parentSelect.allowEmptyOptions) {
    return (
      <>
        <header className="page-header">
          <h1>{isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}</h1>
          <p>{description}</p>
        </header>
        <div className="empty-state">{parentSelect.emptyMessage}</div>
        <div className="form-actions">
          <Link to={listPath} className="btn btn--secondary">
            Kembali
          </Link>
        </div>
      </>
    )
  }

  const parentValue = parentSelect
    ? String((form as Record<string, unknown>)[parentSelect.field] || '')
    : ''

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? `Edit ${entityLabel}` : `Tambah ${entityLabel}`}</h1>
        <p>{description}</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          {parentSelect && (
            <div className="field">
              <label htmlFor={parentSelect.field}>{parentSelect.label}</label>
              <SearchableSelect
                id={parentSelect.field}
                value={parentValue}
                onChange={(next) =>
                  setForm({
                    ...form,
                    [parentSelect.field]: Number(next) || 0,
                  } as TForm)
                }
                placeholder={`Pilih ${parentSelect.label.toLowerCase()}`}
                required={!parentSelect.allowEmptyOptions}
                options={[
                  {
                    value: '',
                    label: parentSelect.allowEmptyOptions
                      ? `Tanpa ${parentSelect.label.toLowerCase()}`
                      : `Pilih ${parentSelect.label.toLowerCase()}`,
                  },
                  ...parentOptions.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="kode">Kode</label>
            <input
              id="kode"
              value={form.kode}
              onChange={(event) => setForm({ ...form, kode: event.target.value })}
              required
              disabled={isEdit}
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
          {renderExtraFields?.(form, setForm, isEdit)}
          {showDeskripsi && (
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea
                id="deskripsi"
                value={form.deskripsi || ''}
                onChange={(event) => setForm({ ...form, deskripsi: event.target.value })}
              />
            </div>
          )}
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
