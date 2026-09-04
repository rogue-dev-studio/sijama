/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:21:00
 */

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { appReportService } from '../api/services'
import type { AppReportRow, PaginationMeta } from '../api/types'
import { ListFilterBar } from '../components/ListFilterBar'
import { SearchableSelect } from '../components/SearchableSelect'
import { Pagination } from '../components/Pagination'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const CATEGORY_LABEL: Record<string, string> = {
  teknis: 'Teknis',
  nonteknis: 'Non-teknis',
}

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
  return 'Gagal memuat laporan'
}

export function AppReportStatusPage() {
  const [items, setItems] = useState<AppReportRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AppReportRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await appReportService.mine({
        q: search || undefined,
        category: categoryFilter || undefined,
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
  }, [search, categoryFilter, statusFilter, page, perPage])

  useEffect(() => {
    void load()
  }, [load])

  const hasActiveFilters = Boolean(search || categoryFilter || statusFilter)

  return (
    <section className="page">
      <div className="page-header">
        <h1>Status Laporan Saya</h1>
        <p>Daftar laporan yang Anda kirim beserta status penanganan.</p>
      </div>

      <ListFilterBar
        search={{
          value: query,
          onChange: setQuery,
          onSubmit: () => {
            setPage(1)
            setSearch(query.trim())
          },
          placeholder: 'Subjek / deskripsi…',
          ariaLabel: 'Cari laporan saya',
        }}
        primaryFilters={[
          <div className="field" key="category">
            <label htmlFor="report-status-category">Kategori</label>
            <SearchableSelect
              id="report-status-category"
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'teknis', label: 'Teknis' },
                { value: 'nonteknis', label: 'Non-teknis' },
              ]}
            />
          </div>,
          <div className="field" key="status">
            <label htmlFor="report-status-status">Status</label>
            <SearchableSelect
              id="report-status-status"
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
          setCategoryFilter('')
          setStatusFilter('')
          setPage(1)
        }}
      />

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Memuat…</p> : null}

      {!loading && items.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada laporan.</p>
        </div>
      ) : null}

      {!loading && items.length > 0 ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Kategori</th>
                <th>Subjek</th>
                <th>Status</th>
                <th>Catatan admin</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td>{CATEGORY_LABEL[item.category] || item.category}</td>
                  <td>{item.subject}</td>
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
            aria-labelledby="report-status-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="app-error-detail__header">
              <h2 id="report-status-detail-title" className="app-confirm__title">
                Detail laporan #{selected.id}
              </h2>
              <button type="button" className="btn btn--secondary btn--small" onClick={() => setSelected(null)}>
                Tutup
              </button>
            </div>
            <div className="app-error-detail__fields" style={{ marginTop: '0.75rem' }}>
              <p>
                <strong>Waktu:</strong> {formatDateTime(selected.created_at)}
              </p>
              <p>
                <strong>Kategori:</strong> {CATEGORY_LABEL[selected.category] || selected.category}
              </p>
              <p>
                <strong>Status:</strong> {STATUS_LABEL[selected.status] || selected.status}
              </p>
              <p>
                <strong>Subjek:</strong> {selected.subject}
              </p>
              <p>
                <strong>Deskripsi:</strong> {selected.description}
              </p>
              <p>
                <strong>Kontak:</strong> {selected.contact || '—'}
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                <strong>Catatan admin:</strong>
                <br />
                {selected.admin_notes?.trim() || '—'}
              </p>
              {selected.images && selected.images.length > 0 ? (
                <div>
                  <strong>Lampiran:</strong>
                  <ul className="multi-image-picker__list" style={{ marginTop: '0.5rem' }}>
                    {selected.images.map((path) => {
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
          </div>
        </div>
      )}
    </section>
  )
}
