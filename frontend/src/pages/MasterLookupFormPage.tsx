/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:06:32
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterLookupService } from '../api/services'
import type { LookupMInput } from '../api/types'
import { SearchableSelect } from '../components/SearchableSelect'
import { useToast } from '../components/ToastProvider'
import { LOOKUP_TYPE, LOOKUP_TYPE_OPTIONS } from '../lib/lookupTypes'

const emptyForm: LookupMInput = {
  lookup_type: '',
  lookup_name: '',
  lookup_value: '',
  lookup_urutan: null,
  lookup_kode: '',
  additional_data: '',
  is_active: true,
}

const TYPE_HINTS = [
  ...LOOKUP_TYPE_OPTIONS.map((item) => item.value),
  LOOKUP_TYPE.KONFIG_DOKUMEN,
]

export function MasterLookupFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notifySaved } = useToast()
  const [form, setForm] = useState<LookupMInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (id) {
          const item = await masterLookupService.get(Number(id))
          if (!active) return
          setForm({
            lookup_type: item.lookup_type,
            lookup_name: item.lookup_name || '',
            lookup_value: item.lookup_value || '',
            lookup_urutan: item.lookup_urutan,
            lookup_kode: item.lookup_kode || '',
            additional_data: item.additional_data || '',
            is_active: item.is_active,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat lookup')
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

    const resolvedType = form.lookup_type.trim()
    if (!resolvedType) {
      setError('Tipe lookup wajib diisi.')
      setSubmitting(false)
      return
    }

    const payload: LookupMInput = {
      lookup_type: resolvedType,
      lookup_name: form.lookup_name?.trim() || null,
      lookup_value: form.lookup_value?.trim() || null,
      lookup_urutan: form.lookup_urutan,
      lookup_kode: form.lookup_kode?.trim() || null,
      additional_data: form.additional_data?.trim() || null,
      is_active: form.is_active,
    }

    try {
      if (isEdit && id) {
        await masterLookupService.update(Number(id), payload)
      } else {
        await masterLookupService.create(payload)
      }
      notifySaved('lookup', isEdit ? 'update' : 'create')
      navigate('/master/lookup')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan lookup')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat lookup…</div>
  }

  const isKonfigDokumen = form.lookup_type.trim() === LOOKUP_TYPE.KONFIG_DOKUMEN

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit lookup' : 'Tambah lookup'}</h1>
        <p>
          Tipe lookup diisi manual. Untuk cetakan dokumen gunakan tipe{' '}
          <code>{LOOKUP_TYPE.KONFIG_DOKUMEN}</code> — nama = label cetakan, value = kunci cetakan.
        </p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="lookup_type">Tipe</label>
            <input
              id="lookup_type"
              list="lookup-type-hints"
              value={form.lookup_type}
              onChange={(event) => setForm({ ...form, lookup_type: event.target.value })}
              required
              maxLength={100}
              placeholder="contoh: konfig_dokumen"
            />
            <datalist id="lookup-type-hints">
              {TYPE_HINTS.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
            <p className="field-hint">
              Diisi manual (bukan dari daftar lookup yang sudah ada). Saran: pekerjaan,
              jenis_kelamin, golongan_darah, status_pernikahan, pendidikan, hubungan_keluarga,
              konfig_dokumen.
            </p>
          </div>
          <div className="field">
            <label htmlFor="lookup_name">Nama</label>
            <input
              id="lookup_name"
              value={form.lookup_name || ''}
              onChange={(event) => setForm({ ...form, lookup_name: event.target.value })}
              maxLength={200}
              placeholder={isKonfigDokumen ? 'Cetakan Laporan Jamaah' : undefined}
            />
          </div>
          <div className="field">
            <label htmlFor="lookup_value">Value</label>
            <input
              id="lookup_value"
              value={form.lookup_value || ''}
              onChange={(event) => setForm({ ...form, lookup_value: event.target.value })}
              maxLength={200}
              placeholder={isKonfigDokumen ? 'laporan_jamaah' : undefined}
            />
            {isKonfigDokumen && (
              <p className="field-hint">
                Value dipakai sebagai kunci di halaman Ekspor/Cetak (
                <code>dokumenKey</code>).
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="lookup_kode">Kode</label>
            <input
              id="lookup_kode"
              value={form.lookup_kode || ''}
              onChange={(event) => setForm({ ...form, lookup_kode: event.target.value })}
              maxLength={50}
            />
          </div>
          <div className="field">
            <label htmlFor="lookup_urutan">Urutan</label>
            <input
              id="lookup_urutan"
              type="number"
              value={form.lookup_urutan ?? ''}
              onChange={(event) =>
                setForm({
                  ...form,
                  lookup_urutan: event.target.value === '' ? null : Number(event.target.value),
                })
              }
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
            <label htmlFor="additional_data">Additional data</label>
            <textarea
              id="additional_data"
              rows={4}
              value={form.additional_data || ''}
              onChange={(event) => setForm({ ...form, additional_data: event.target.value })}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </button>
          <Link to="/master/lookup" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
