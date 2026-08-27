/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:23:49
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:23:49
 */

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterLookupService } from '../api/services'
import type { LookupMInput } from '../api/types'
import { SearchableSelect } from '../components/SearchableSelect'
import { LOOKUP_TYPE_OPTIONS } from '../lib/lookupTypes'

const CUSTOM_TYPE_VALUE = '__custom__'

const emptyForm: LookupMInput = {
  lookup_type: '',
  lookup_name: '',
  lookup_value: '',
  lookup_urutan: null,
  lookup_kode: '',
  additional_data: '',
  is_active: true,
}

export function MasterLookupFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<LookupMInput>(emptyForm)
  const [customType, setCustomType] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const knownTypeValues = useMemo(
    () => new Set(LOOKUP_TYPE_OPTIONS.map((item) => item.value)),
    [],
  )

  const typeSelectValue = useMemo(() => {
    if (!form.lookup_type) return ''
    if (knownTypeValues.has(form.lookup_type as (typeof LOOKUP_TYPE_OPTIONS)[number]['value'])) {
      return form.lookup_type
    }
    return CUSTOM_TYPE_VALUE
  }, [form.lookup_type, knownTypeValues])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (id) {
          const item = await masterLookupService.get(Number(id))
          if (!active) return
          const lookupType = item.lookup_type
          setForm({
            lookup_type: lookupType,
            lookup_name: item.lookup_name || '',
            lookup_value: item.lookup_value || '',
            lookup_urutan: item.lookup_urutan,
            lookup_kode: item.lookup_kode || '',
            additional_data: item.additional_data || '',
            is_active: item.is_active,
          })
          if (!knownTypeValues.has(lookupType as (typeof LOOKUP_TYPE_OPTIONS)[number]['value'])) {
            setCustomType(lookupType)
          }
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
  }, [id, knownTypeValues])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const resolvedType =
      typeSelectValue === CUSTOM_TYPE_VALUE
        ? customType.trim()
        : form.lookup_type.trim()

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

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit lookup' : 'Tambah lookup'}</h1>
        <p>
          Kelola baris referensi di tabel lookup_m. Tipe baku (
          {LOOKUP_TYPE_OPTIONS.map((item) => item.value).join(', ')}) dipakai form jamaah dan
          profil.
        </p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="lookup_type">Tipe</label>
            <SearchableSelect
              id="lookup_type"
              value={typeSelectValue}
              onChange={(next) => {
                if (next === CUSTOM_TYPE_VALUE) {
                  setForm({ ...form, lookup_type: customType || '' })
                  return
                }
                setCustomType('')
                setForm({ ...form, lookup_type: next })
              }}
              required={typeSelectValue !== CUSTOM_TYPE_VALUE}
              placeholder="Pilih tipe baku"
              options={[
                ...LOOKUP_TYPE_OPTIONS.map((item) => ({
                  value: item.value,
                  label: `${item.label} (${item.value})`,
                })),
                { value: CUSTOM_TYPE_VALUE, label: 'Lainnya (ketik tipe kustom)' },
              ]}
            />
            <p className="field-hint">
              Tipe baku mengisi opsi pekerjaan, jenis kelamin, golongan darah, status pernikahan,
              dan pendidikan pada form jamaah/profil.
            </p>
          </div>
          {typeSelectValue === CUSTOM_TYPE_VALUE && (
            <div className="field">
              <label htmlFor="lookup_type_custom">Tipe kustom</label>
              <input
                id="lookup_type_custom"
                value={customType}
                onChange={(event) => {
                  const next = event.target.value
                  setCustomType(next)
                  setForm({ ...form, lookup_type: next })
                }}
                required
                maxLength={100}
                placeholder="contoh: status_kehadiran"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="lookup_name">Nama</label>
            <input
              id="lookup_name"
              value={form.lookup_name || ''}
              onChange={(event) => setForm({ ...form, lookup_name: event.target.value })}
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor="lookup_value">Value</label>
            <input
              id="lookup_value"
              value={form.lookup_value || ''}
              onChange={(event) => setForm({ ...form, lookup_value: event.target.value })}
              maxLength={200}
            />
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
