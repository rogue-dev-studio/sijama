/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 13:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 13:30:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { masterKategoriKegiatanService } from '../api/services'
import type { KategoriKegiatanInput } from '../api/types'

const emptyForm: KategoriKegiatanInput = {
  kode: '',
  nama: '',
  deskripsi: '',
  calendar_color: '#2563eb',
  is_active: true,
}

export function MasterKategoriKegiatanFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<KategoriKegiatanInput>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (id) {
          const item = await masterKategoriKegiatanService.get(Number(id))
          if (!active) return
          setForm({
            kode: item.kode,
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            calendar_color: item.calendar_color || '#2563eb',
            is_active: item.is_active,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat kategori kegiatan')
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

    const payload: KategoriKegiatanInput = {
      ...form,
      deskripsi: form.deskripsi || null,
    }

    try {
      if (isEdit && id) {
        await masterKategoriKegiatanService.update(Number(id), payload)
      } else {
        await masterKategoriKegiatanService.create(payload)
      }
      navigate('/master/kategori-kegiatan')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan kategori kegiatan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading-state">Memuat kategori kegiatan…</div>
  }

  return (
    <>
      <header className="page-header">
        <h1>{isEdit ? 'Edit kategori kegiatan' : 'Tambah kategori kegiatan'}</h1>
        <p>Kelola kategori untuk klasifikasi kegiatan jamaah.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-panel" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-grid form-grid--2">
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
            <select
              id="is_active"
              value={form.is_active ? '1' : '0'}
              onChange={(event) => setForm({ ...form, is_active: event.target.value === '1' })}
            >
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="calendar_color">Warna kalender</label>
            <div className="field-color">
              <input
                id="calendar_color"
                type="color"
                value={form.calendar_color || '#2563eb'}
                onChange={(event) => setForm({ ...form, calendar_color: event.target.value })}
              />
              <input
                type="text"
                value={form.calendar_color || '#2563eb'}
                onChange={(event) => setForm({ ...form, calendar_color: event.target.value })}
                pattern="^#[0-9A-Fa-f]{6}$"
                aria-label="Kode hex warna kalender"
              />
            </div>
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
          <Link to="/master/kategori-kegiatan" className="btn btn--secondary">
            Batal
          </Link>
        </div>
      </form>
    </>
  )
}
