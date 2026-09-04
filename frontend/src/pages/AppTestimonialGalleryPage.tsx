/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:36:00
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { appFeedbackService } from '../api/services'
import type { AppFeedbackRow } from '../api/types'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'

const AVATAR_PALETTE = [
  'var(--color-accent)',
  '#2a6f6a',
  '#8a6a2b',
  '#5a4d8a',
  '#3d6b8a',
  '#6b4d5a',
]

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

function normalizeGalleryRows(payload: unknown): AppFeedbackRow[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: AppFeedbackRow[] }).items
  }
  return []
}

function StarRow({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating || 0)))
  return (
    <div className="testimonial-carousel__stars" aria-label={`${filled} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={
            value <= filled
              ? 'testimonial-carousel__star testimonial-carousel__star--filled'
              : 'testimonial-carousel__star'
          }
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function AppTestimonialGalleryPage() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const pageSize = isMobile ? 1 : 3
  const [items, setItems] = useState<AppFeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [index, setIndex] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await appFeedbackService.gallery()
      setItems(normalizeGalleryRows(rows))
      setIndex(0)
    } catch (err) {
      setItems([])
      setError(err instanceof ApiError ? err.message : 'Gagal memuat galeri testimoni')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setIndex(0)
  }, [pageSize])

  const maxIndex = Math.max(0, items.length - pageSize)

  const visible = useMemo(() => {
    return items.slice(index, index + pageSize)
  }, [items, index, pageSize])

  function goPrev() {
    setIndex((current) => Math.max(0, current - pageSize))
  }

  function goNext() {
    setIndex((current) => Math.min(maxIndex, current + pageSize))
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>Informasi Testimoni & Apresiasi</h1>
        <p>Kumpulan apresiasi pengguna yang telah dipublikasikan.</p>
      </div>

      {loading ? <p>Memuat…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error && items.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada testimoni yang dipublikasikan.</p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="testimonial-carousel">
          <button
            type="button"
            className="testimonial-carousel__nav testimonial-carousel__nav--prev"
            aria-label="Sebelumnya"
            disabled={index <= 0}
            onClick={goPrev}
          >
            ‹
          </button>

          <div className="testimonial-carousel__track">
            {visible.map((item) => {
              const name = item.reporter_name || 'Anonim'
              const imageSrc = item.images?.[0] ? resolveKonfigAssetUrl(item.images[0]) : null
              return (
                <article key={item.id} className="testimonial-carousel__card">
                  <h2 className="testimonial-carousel__title">{item.title}</h2>
                  <StarRow rating={item.rating || 0} />
                  <p className="testimonial-carousel__body">{item.body}</p>
                  {imageSrc ? (
                    <img src={imageSrc} alt="" className="testimonial-carousel__image" />
                  ) : null}
                  <div className="testimonial-carousel__author">
                    <span
                      className="testimonial-carousel__avatar"
                      style={{ background: avatarColor(name) }}
                      aria-hidden="true"
                    >
                      {initialsFromName(name)}
                    </span>
                    <div className="testimonial-carousel__meta">
                      <strong>{name}</strong>
                      {item.role_label ? <span>{item.role_label}</span> : null}
                      {item.reporter_username || item.contact ? (
                        <span className="testimonial-carousel__subtle">
                          {[item.reporter_username ? `@${item.reporter_username}` : null, item.contact]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <button
            type="button"
            className="testimonial-carousel__nav testimonial-carousel__nav--next"
            aria-label="Berikutnya"
            disabled={index >= maxIndex}
            onClick={goNext}
          >
            ›
          </button>
        </div>
      ) : null}
    </section>
  )
}
