/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 17:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:35:00
 */

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { appFeedbackService } from '../api/services'
import type { AppFeedbackRow, PaginationMeta } from '../api/types'
import { ListFilterBar } from '../components/ListFilterBar'
import { SearchableSelect } from '../components/SearchableSelect'
import { Pagination } from '../components/Pagination'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const STATUS_LABEL: Record<string, string> = {
  baru: 'Baru',
  diproses: 'Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function truncateNote(value?: string | null, max = 48) {
  if (!value?.trim()) return '—'
  const text = value.trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  return 'Gagal memuat ide & saran'
}

export function AppFeedbackIdeaStatusPage() {
  const [items, setItems] = useState<AppFeedbackRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AppFeedbackRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await appFeedbackService.mineIdeas({
        q: search || undefined,
        status: statusFilter || undefined,
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
  }, [search, statusFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  const hasActiveFilters = Boolean(search || statusFilter)

  return (
    <section className="page">
      <div className="page-header">
        <h1>Status Ide & Saran Saya</h1>
        <p>Daftar ide dan saran yang Anda kirim beserta status penanganan.</p>
      </div>

      <ListFilterBar
        search={{
          value: query,
          onChange: setQuery,
          onSubmit: () => {
            setPage(1)
            setSearch(query.trim())
          },
          placeholder: 'Judul / isi…',
          ariaLabel: 'Cari ide & saran saya',
        }}
        primaryFilters={[
          <div className="field" key="status">
            <label htmlFor="idea-status-filter">Status</label>
            <SearchableSelect
              id="idea-status-filter"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'baru', label: 'Baru' },
                { value: 'diproses', label: 'Diproses' },
                { value: 'selesai', label: 'Selesai' },
                { value: 'ditolak', label: 'Ditolak' },
              ]}
            />
          </div>,
        ]}
        hasActiveFilters={hasActiveFilters}
        onReset={() => {
          setQuery('')
          setSearch('')
          setStatusFilter('')
          setPage(1)
        }}
      />

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Memuat…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada ide & saran yang Anda kirim.</p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Judul</th>
                <th>Status</th>
                <th>Catatan admin</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td>{item.title}</td>
                  <td>{STATUS_LABEL[item.status] || item.status}</td>
                  <td>{item.admin_notes?.trim() ? truncateNote(item.admin_notes) : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={() => setSelected(item)}
                    >
                      Lihat
                    </button>
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

      {selected && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setSelected(null)}>
          <div
            className="app-confirm__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="idea-status-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="idea-status-detail-title" className="app-confirm__title">
              Detail ide #{selected.id}
            </h2>
            <div className="form-grid form-grid--1" style={{ marginTop: '0.75rem' }}>
              <p>
                <strong>Waktu:</strong> {formatDateTime(selected.created_at)}
              </p>
              <p>
                <strong>Status:</strong> {STATUS_LABEL[selected.status] || selected.status}
              </p>
              <p>
                <strong>Judul:</strong> {selected.title}
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                <strong>Isi:</strong>
                <br />
                {selected.body}
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                <strong>Catatan admin:</strong>
                <br />
                {selected.admin_notes?.trim() || '—'}
              </p>
              {selected.images && selected.images.length > 0 ? (
                <div className="multi-image-picker__previews">
                  {selected.images.map((src) => (
                    <a key={src} href={resolveKonfigAssetUrl(src) ?? undefined} target="_blank" rel="noreferrer">
                      <img src={resolveKonfigAssetUrl(src) ?? undefined} alt="" className="multi-image-picker__thumb" />
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="app-confirm__actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn--secondary" onClick={() => setSelected(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
