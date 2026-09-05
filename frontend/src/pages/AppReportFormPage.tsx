/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:21:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { appReportService } from '../api/services'
import type { AppReportCategory } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { MultiImagePicker } from '../components/MultiImagePicker'
import { useToast } from '../components/ToastProvider'
import { createFeedbackFormData, defaultContactFromUser } from '../lib/feedbackForm'

type AppReportFormPageProps = {
  category?: AppReportCategory
}

const CATEGORY_META: Record<AppReportCategory, { title: string; description: string }> = {
  teknis: {
    title: 'Laporkan Masalah Teknis & Sistem',
    description: 'Laporkan bug, error aplikasi, atau gangguan teknis yang Anda alami.',
  },
  nonteknis: {
    title: 'Laporkan Masalah Non-Teknis / Layanan',
    description: 'Laporkan kendala layanan, proses, atau kebutuhan non-teknis lainnya.',
  },
}

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const first = Object.values(err.errors).flat()[0]
      if (first) return first
    }
    return err.message
  }
  return 'Gagal mengirim laporan'
}

function resolveCategory(prop?: AppReportCategory, param?: string, pathname?: string): AppReportCategory | null {
  if (prop === 'teknis' || prop === 'nonteknis') return prop
  if (param === 'teknis' || param === 'nonteknis') return param
  if (pathname?.includes('/laporkan/nonteknis')) return 'nonteknis'
  if (pathname?.includes('/laporkan/teknis')) return 'teknis'
  return null
}

export function AppReportFormPage({ category: categoryProp }: AppReportFormPageProps = {}) {
  const { category: categoryParam } = useParams<{ category?: string }>()
  const { pathname } = useLocation()
  const category = resolveCategory(categoryProp, categoryParam, pathname)
  const { user } = useAuth()
  const { notifySuccess, notifyError } = useToast()
  const [reporterName, setReporterName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    setReporterName(user?.name?.trim() || '')
    setContact(defaultContactFromUser(user))
  }, [user])

  if (!category) {
    return (
      <section className="page">
        <div className="page-header">
          <h1>Kategori laporan tidak valid</h1>
          <p>Gunakan menu Laporkan Masalah teknis atau non-teknis.</p>
        </div>
      </section>
    )
  }

  const meta = CATEGORY_META[category]

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!reporterName.trim() || !subject.trim() || !description.trim()) {
      notifyError('Nama, subjek, dan deskripsi wajib diisi.')
      return
    }
    setSubmitting(true)

    try {
      const formData = createFeedbackFormData(
        {
          reporter_name: reporterName.trim(),
          subject: subject.trim(),
          description: description.trim(),
          contact: contact.trim() || null,
        },
        images,
      )
      await appReportService.create(category!, formData)
      notifySuccess('Laporan berhasil dikirim. Terima kasih.')
      setSubject('')
      setDescription('')
      setImages([])
      setReporterName(user?.name?.trim() || '')
      setContact(defaultContactFromUser(user))
      setFormKey((value) => value + 1)
    } catch (err) {
      notifyError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>

      {user?.jamaah_id ? (
        <p className="form-hint" style={{ marginBottom: '0.75rem' }}>
          Akun Anda terhubung ke data jamaah (ID {user.jamaah_id}). Laporan akan tercatat dengan tautan
          tersebut.
        </p>
      ) : null}

      <form key={formKey} className="form-panel" onSubmit={handleSubmit} noValidate>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="report-username">Username</label>
            <input id="report-username" value={user?.username || '—'} readOnly disabled />
          </div>
          <div className="field">
            <label htmlFor="report-reporter-name">Nama pelapor</label>
            <input
              id="report-reporter-name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              required
              maxLength={150}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="report-contact">Kontak (opsional)</label>
            <input
              id="report-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              placeholder="Email / no. HP"
              autoComplete="tel"
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="report-subject">Subjek</label>
            <input
              id="report-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={255}
              placeholder="Ringkasan singkat masalah"
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="report-description">Deskripsi</label>
            <textarea
              id="report-description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Jelaskan langkah, waktu kejadian, dan dampaknya"
            />
          </div>
          <MultiImagePicker files={images} onChange={setImages} disabled={submitting} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim laporan'}
          </button>
        </div>
      </form>
    </section>
  )
}
