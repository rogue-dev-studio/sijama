/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:30:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { jamaahService, masterPemateriService } from '../api/services'
import type { Jamaah, PemateriInput } from '../api/types'

import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'

const emptyForm: PemateriInput = {
  jamaah_id: 0,
  is_active: true,
}

export function MasterPemateriFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [jamaahOptions, setJamaahOptions] = useState<Jamaah[]>([])
  const [form, setForm] = useState<PemateriInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedJamaah = jamaahOptions.find((item) => item.id === form.jamaah_id) || null
  const kontakPreview =
    selectedJamaah?.no_hp || selectedJamaah?.email || '—'

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const jamaahResult = await jamaahService.list({ status: 'aktif', per_page: 200 })
        if (!active) return
        setJamaahOptions(jamaahResult.items)

        if (id) {
          const pemateri = await masterPemateriService.get(Number(id))
          if (!active) return
          setForm({
            jamaah_id: pemateri.jamaah_id || 0,
            is_active: pemateri.is_active,
          })
          if (
            pemateri.jamaah &&
            !jamaahResult.items.some((item) => item.id === pemateri.jamaah_id)
          ) {
            setJamaahOptions((prev) => [...prev, pemateri.jamaah as Jamaah])
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat data pemateri')
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
    if (!form.jamaah_id) {
      setError('Pilih jamaah sebagai pemateri.')
      return
    }

    setSubmitting(true)
    setError(null)

    const payload: PemateriInput = {
      jamaah_id: form.jamaah_id,
      is_active: form.is_active,
    }

    try {
      if (isEdit && id) {
        await masterPemateriService.update(Number(id), payload)
      } else {
        await masterPemateriService.create(payload)
      }
      notifySaved('pemateri', isEdit ? 'update' : 'create')
      navigate('/master/pemateri')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan pemateri')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat data pemateri…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit pemateri' : 'Tambah pemateri'}</h1>
        <p>Pilih jamaah sebagai pemateri; nama dan kontak diambil otomatis.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      {jamaahOptions.length === 0 && (
        <div className="alert alert--error">
          Belum ada jamaah aktif tersedia. Tambahkan jamaah terlebih dahulu.
        </div>
      )}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="jamaah_id">Jamaah</label>
            <SearchableSelect
              id="jamaah_id"
              value={form.jamaah_id ? String(form.jamaah_id) : ''}
              onChange={(next) => setForm({ ...form, jamaah_id: Number(next) || 0 })}
              placeholder="Pilih jamaah"
              disabled={jamaahOptions.length === 0}
              required
              options={[
                { value: '', label: 'Pilih jamaah' },
                ...jamaahOptions.map((item) => ({
                  value: String(item.id),
                  label: item.nama + (item.no_hp ? ` · ${item.no_hp}` : ''),
                })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="nama_preview">Nama (dari jamaah)</label>
            <input id="nama_preview" value={selectedJamaah?.nama || ''} readOnly />
          </div>
          <div className="field">
            <label htmlFor="kontak_preview">Kontak (dari jamaah)</label>
            <input id="kontak_preview" value={kontakPreview} readOnly />
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
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || jamaahOptions.length === 0}
          >
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/master/pemateri" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
