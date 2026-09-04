/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:36:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:36:00
 */

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { appFeedbackService } from '../api/services'
import type { AppFeedbackRow, PaginationMeta } from '../api/types'
import { ListFilterBar } from '../components/ListFilterBar'
import { SearchableSelect } from '../components/SearchableSelect'
import { Pagination } from '../components/Pagination'
import { useToast } from '../components/ToastProvider'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const first = Object.values(err.errors).flat()[0]
      if (first) return first
    }
    return err.message
  }
  return 'Permintaan gagal'
}

export function AppTestimonialAdminPage() {
  const { notifySuccess, notifyError } = useToast()
  const [items, setItems] = useState<AppFeedbackRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AppFeedbackRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await appFeedbackService.testimonialAdminList({
        q: search || undefined,
        is_published: publishedFilter === '' ? undefined : publishedFilter === '1',
        page,
        per_page: perPage,
        sort_by: 'created_at',
        sort_dir: 'desc',
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(formatApiError(err))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [search, publishedFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  async function handleTogglePublish(row: AppFeedbackRow) {
    const next = !row.is_published
    setTogglingId(row.id)
    try {
      await appFeedbackService.testimonialAdminUpdate(row.id, { is_published: next })
      notifySuccess(next ? 'Testimoni ditampilkan di galeri.' : 'Testimoni disembunyikan dari galeri.')
      await load()
    } catch (err) {
      notifyError(formatApiError(err))
    } finally {
      setTogglingId(null)
    }
  }

  const hasActiveFilters = Boolean(search || publishedFilter)

  return (
    <section className="page">
      <div className="page-header">
        <h1>Daftar Testimoni & Apresiasi</h1>
        <p>Kelola tampilan testimoni di galeri (superadmin).</p>
      </div>

      <ListFilterBar
        search={{
          value: query,
          onChange: setQuery,
          onSubmit: () => {
            setPage(1)
            setSearch(query.trim())
          },
          placeholder: 'Judul / nama / isi…',
          ariaLabel: 'Cari testimoni',
        }}
        primaryFilters={[
          <div className="field" key="published">
            <label htmlFor="testimonial-admin-published">Tampilan galeri</label>
            <SearchableSelect
              id="testimonial-admin-published"
              value={publishedFilter}
              onChange={(value) => {
                setPublishedFilter(value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: '1', label: 'Ditampilkan' },
                { value: '0', label: 'Disembunyikan' },
              ]}
            />
          </div>,
        ]}
        hasActiveFilters={hasActiveFilters}
        onReset={() => {
          setQuery('')
          setSearch('')
          setPublishedFilter('')
          setPage(1)
        }}
      />

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Memuat…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada testimoni.</p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pengirim</th>
                <th>Judul</th>
                <th>Rating</th>
                <th>Galeri</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td>
                    {item.reporter_name}
                    {item.reporter_username ? (
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                        @{item.reporter_username}
                      </span>
                    ) : null}
                  </td>
                  <td>{item.title}</td>
                  <td>{item.rating ? `${item.rating}/5` : '—'}</td>
                  <td>{item.is_published ? 'Ditampilkan' : 'Disembunyikan'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        onClick={() => setDetail(item)}
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--small"
                        disabled={togglingId === item.id}
                        onClick={() => void handleTogglePublish(item)}
                      >
                        {togglingId === item.id
                          ? 'Menyimpan…'
                          : item.is_published
                            ? 'Sembunyikan'
                            : 'Tampilkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <Pagination
        meta={meta}
        onPageChange={setPage}
        onPerPageChange={(value) => {
          setPerPage(value)
          setPage(1)
        }}
      />

      {detail && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setDetail(null)}>
          <div
            className="app-confirm__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="testimonial-admin-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="testimonial-admin-detail-title" className="app-confirm__title">
              Testimoni #{detail.id}
            </h2>
            <div className="form-grid form-grid--1" style={{ marginTop: '0.75rem' }}>
              <div className="field">
                <label>Pengirim</label>
                <p style={{ margin: 0 }}>
                  {detail.reporter_name}
                  {detail.reporter_username ? ` (@${detail.reporter_username})` : ''}
                  {detail.role_label ? (
                    <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                      {detail.role_label}
                    </span>
                  ) : null}
                  {detail.contact ? (
                    <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                      {detail.contact}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="field">
                <label>Judul</label>
                <p style={{ margin: 0 }}>{detail.title}</p>
              </div>
              <div className="field">
                <label>Rating</label>
                <p style={{ margin: 0 }}>{detail.rating ? `${detail.rating}/5` : '—'}</p>
              </div>
              <div className="field">
                <label>Isi</label>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{detail.body}</p>
              </div>
              {detail.images && detail.images.length > 0 ? (
                <div className="field">
                  <label>Lampiran</label>
                  <ul className="multi-image-picker__list">
                    {detail.images.map((path) => {
                      const src = resolveKonfigAssetUrl(path)
                      return src ? (
                        <li key={path} className="multi-image-picker__item">
                          <a href={src} target="_blank" rel="noreferrer">
                            <img src={src} alt="" className="multi-image-picker__thumb" />
                          </a>
                        </li>
                      ) : null
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="app-confirm__actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn--secondary" onClick={() => setDetail(null)}>
                Tutup
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={togglingId === detail.id}
                onClick={() => void handleTogglePublish(detail).then(() => setDetail(null))}
              >
                {detail.is_published ? 'Sembunyikan dari galeri' : 'Tampilkan di galeri'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
