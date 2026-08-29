/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:00:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterFiturService, masterHakAksesService } from '../api/services'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import type { Fitur, HakAkses, HakAksesInput } from '../api/types'

const aksiOptions: HakAkses['aksi'][] = ['view', 'create', 'update', 'delete', 'execute']

const emptyForm: HakAksesInput = {
  fitur_id: 0,
  slug: '',
  nama: '',
  aksi: 'view',
}

export function MasterHakAksesFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<HakAksesInput>(emptyForm)
  const [fiturs, setFiturs] = useState<Fitur[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const fitursResult = await masterFiturService.list({ per_page: 100 })
        if (!active) return
        setFiturs(fitursResult.items)

        if (id) {
          const item = await masterHakAksesService.get(Number(id))
          if (!active) return
          setForm({
            fitur_id: item.fitur_id,
            slug: item.slug,
            nama: item.nama,
            aksi: item.aksi,
          })
        } else {
          setForm({ ...emptyForm, fitur_id: fitursResult.items[0]?.id ?? 0 })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat hak akses')
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

    try {
      if (isEdit && id) {
        await masterHakAksesService.update(Number(id), form)
      } else {
        await masterHakAksesService.create(form)
      }
      notifySaved('hak akses', isEdit ? 'update' : 'create')
      navigate('/master/hak-akses')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan hak akses')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat hak akses…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit hak akses' : 'Tambah hak akses'}</h1>
        <p>Kelola permission per fitur.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="fitur_id">Fitur</label>
            <SearchableSelect
              id="fitur_id"
              value={form.fitur_id ? String(form.fitur_id) : ''}
              onChange={(next) => setForm({ ...form, fitur_id: Number(next) })}
              placeholder="Pilih fitur"
              required
              options={[
                { value: '', label: 'Pilih fitur' },
                ...fiturs.map((fitur) => ({
                  value: String(fitur.id),
                  label: fitur.nama,
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="aksi">Aksi</label>
            <SearchableSelect
              id="aksi"
              value={form.aksi}
              onChange={(next) => setForm({ ...form, aksi: next as HakAkses['aksi'] })}
              required
              options={aksiOptions.map((aksi) => ({ value: String(aksi), label: aksi }))}
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
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/master/hak-akses" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
