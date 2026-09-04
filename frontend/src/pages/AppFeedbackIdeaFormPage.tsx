/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:21:00
 */

import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { appFeedbackService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { MultiImagePicker } from '../components/MultiImagePicker'
import { useToast } from '../components/ToastProvider'
import { createFeedbackFormData, defaultContactFromUser } from '../lib/feedbackForm'

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const first = Object.values(err.errors).flat()[0]
      if (first) return first
    }
    return err.message
  }
  return 'Gagal mengirim ide & saran'
}

export function AppFeedbackIdeaFormPage() {
  const { user } = useAuth()
  const { notifySuccess, notifyError } = useToast()
  const [reporterName, setReporterName] = useState('')
  const [contact, setContact] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setReporterName(user?.name?.trim() || '')
    setContact(defaultContactFromUser(user))
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const formData = createFeedbackFormData(
        {
          reporter_name: reporterName.trim(),
          title: title.trim(),
          body: body.trim(),
          contact: contact.trim() || null,
        },
        images,
      )
      await appFeedbackService.createIdea(formData)
      notifySuccess('Ide & saran berhasil dikirim. Terima kasih.')
      setTitle('')
      setBody('')
      setImages([])
      setReporterName(user?.name?.trim() || '')
      setContact(defaultContactFromUser(user))
    } catch (err) {
      notifyError(formatApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>Ide & Saran</h1>
        <p>Sampaikan ide perbaikan atau saran fitur untuk aplikasi.</p>
      </div>

      {user?.jamaah_id ? (
        <p className="form-hint" style={{ marginBottom: '0.75rem' }}>
          Akun Anda terhubung ke data jamaah (ID {user.jamaah_id}).
        </p>
      ) : null}

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="idea-username">Username</label>
            <input id="idea-username" value={user?.username || '—'} readOnly disabled />
          </div>
          <div className="field">
            <label htmlFor="idea-reporter-name">Nama pengirim</label>
            <input
              id="idea-reporter-name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              required
              maxLength={150}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="idea-contact">Kontak (opsional)</label>
            <input
              id="idea-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              placeholder="Email / no. HP"
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="idea-title">Judul</label>
            <input
              id="idea-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              placeholder="Ringkasan ide"
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="idea-body">Uraian</label>
            <textarea
              id="idea-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Jelaskan ide atau saran Anda"
            />
          </div>
          <MultiImagePicker files={images} onChange={setImages} disabled={submitting} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim ide'}
          </button>
        </div>
      </form>
    </section>
  )
}
