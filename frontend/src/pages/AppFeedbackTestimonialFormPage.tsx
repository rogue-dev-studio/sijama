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
  return 'Gagal mengirim testimoni'
}

export function AppFeedbackTestimonialFormPage() {
  const { user } = useAuth()
  const { notifySuccess, notifyError } = useToast()
  const [reporterName, setReporterName] = useState('')
  const [contact, setContact] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [roleLabel, setRoleLabel] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [images, setImages] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    setReporterName(user?.name?.trim() || '')
    setContact(defaultContactFromUser(user))
  }, [user])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!reporterName.trim() || !title.trim() || !body.trim()) {
      notifyError('Nama, judul, dan isi testimoni wajib diisi.')
      return
    }
    setSubmitting(true)

    try {
      const formData = createFeedbackFormData(
        {
          reporter_name: reporterName.trim(),
          title: title.trim(),
          body: body.trim(),
          rating,
          role_label: roleLabel.trim() || null,
          contact: contact.trim() || null,
        },
        images,
      )
      await appFeedbackService.createTestimonial(formData)
      notifySuccess('Testimoni berhasil dikirim dan langsung tampil di galeri. Terima kasih.')
      setTitle('')
      setBody('')
      setRoleLabel('')
      setRating(5)
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

  const displayRating = hoverRating || rating

  return (
    <section className="page">
      <div className="page-header">
        <h1>Testimoni & Apresiasi</h1>
        <p>Bagikan apresiasi atau pengalaman positif Anda memakai aplikasi.</p>
      </div>

      <form key={formKey} className="form-panel" onSubmit={handleSubmit} noValidate>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="testi-username">Username</label>
            <input id="testi-username" value={user?.username || '—'} readOnly disabled />
          </div>
          <div className="field">
            <label htmlFor="testi-reporter-name">Nama</label>
            <input
              id="testi-reporter-name"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              required
              maxLength={150}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="testi-contact">Kontak (opsional)</label>
            <input
              id="testi-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={120}
              placeholder="Email / no. HP"
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="testi-role">Jabatan / relasi (opsional)</label>
            <input
              id="testi-role"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
              maxLength={120}
              placeholder="Mis. Jamaah / Pengurus"
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="testi-title">Judul / headline</label>
            <input
              id="testi-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              placeholder="Kalimat singkat apresiasi"
            />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label id="testi-rating-label">Rating</label>
            <div
              className="testimonial-rating"
              role="radiogroup"
              aria-labelledby="testi-rating-label"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    value <= displayRating
                      ? 'testimonial-rating__star testimonial-rating__star--filled'
                      : 'testimonial-rating__star'
                  }
                  aria-label={`${value} bintang`}
                  aria-checked={rating === value}
                  role="radio"
                  onMouseEnter={() => setHoverRating(value)}
                  onClick={() => setRating(value)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="testi-body">Isi testimoni</label>
            <textarea
              id="testi-body"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder="Ceritakan pengalaman Anda"
            />
          </div>
          <MultiImagePicker files={images} onChange={setImages} disabled={submitting} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Mengirim…' : 'Kirim testimoni'}
          </button>
        </div>
      </form>
    </section>
  )
}
