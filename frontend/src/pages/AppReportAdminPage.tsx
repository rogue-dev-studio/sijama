/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:21:00
 */

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { appReportService } from '../api/services'
import type { AppReportRow, AppReportStatus, PaginationMeta } from '../api/types'
import { ListFilterBar } from '../components/ListFilterBar'
import { SearchableSelect } from '../components/SearchableSelect'
import { Pagination } from '../components/Pagination'
import { useToast } from '../components/ToastProvider'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

const CATEGORY_LABEL: Record<string, string> = {
  teknis: 'Teknis',
  nonteknis: 'Non-teknis',
}

const STATUS_OPTIONS: Array<{ value: AppReportStatus; label: string }> = [
  { value: 'baru', label: 'Baru' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
]

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

export function AppReportAdminPage() {
  const { notifySuccess, notifyError } = useToast()
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
  const [editing, setEditing] = useState<AppReportRow | null>(null)
  const [editStatus, setEditStatus] = useState<AppReportStatus>('baru')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await appReportService.adminList({
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

  function openEdit(row: AppReportRow) {
    setEditing(row)
    setEditStatus(row.status || 'baru')
    setEditNotes(row.admin_notes || '')
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      await appReportService.adminUpdate(editing.id, {
        status: editStatus,
        admin_notes: editNotes.trim() || null,
      })
      notifySuccess('Status laporan diperbarui.')
      setEditing(null)
      await load()
    } catch (err) {
      notifyError(formatApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const hasActiveFilters = Boolean(search || categoryFilter || statusFilter)

  return (
    <section className="page">
      <div className="page-header">
        <h1>Informasi Laporan</h1>
        <p>Kelola seluruh laporan masalah dari pengguna (superadmin).</p>
      </div>

      <ListFilterBar
        search={{
          value: query,
          onChange: setQuery,
          onSubmit: () => {
            setPage(1)
            setSearch(query.trim())
          },
          placeholder: 'Subjek / nama / deskripsi…',
          ariaLabel: 'Cari laporan',
        }}
        primaryFilters={[
          <div className="field" key="category">
            <label htmlFor="report-admin-category">Kategori</label>
            <SearchableSelect
              id="report-admin-category"
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
            <label htmlFor="report-admin-status">Status</label>
            <SearchableSelect
              id="report-admin-status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
              options={[{ value: '', label: 'Semua' }, ...STATUS_OPTIONS]}
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
                <th>Pelapor</th>
                <th>Subjek</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.created_at)}</td>
                  <td>{CATEGORY_LABEL[item.category] || item.category}</td>
                  <td>
                    {item.reporter_name}
                    {item.reporter_username ? (
                      <span style={{ display: 'block', color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                        @{item.reporter_username}
                      </span>
                    ) : null}
                  </td>
                  <td>{item.subject}</td>
                  <td>{STATUS_OPTIONS.find((o) => o.value === item.status)?.label || item.status}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={() => openEdit(item)}
                    >
                      Ubah
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

      {editing && (
        <div className="app-confirm" role="presentation" onMouseDown={() => setEditing(null)}>
          <div
            className="app-confirm__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-admin-edit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="report-admin-edit-title" className="app-confirm__title">
              Ubah laporan #{editing.id}
            </h2>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-muted)' }}>
              {editing.subject} — {editing.reporter_name}
              {editing.reporter_username ? ` (@${editing.reporter_username})` : ''}
            </p>
            <div className="form-grid form-grid--1" style={{ marginTop: '0.75rem' }}>
              <div className="field">
                <label htmlFor="report-admin-edit-status">Status</label>
                <SearchableSelect
                  id="report-admin-edit-status"
                  value={String(editStatus)}
                  onChange={(value) => setEditStatus(value)}
                  options={STATUS_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                />
              </div>
              <div className="field">
                <label htmlFor="report-admin-edit-notes">Catatan admin</label>
                <textarea
                  id="report-admin-edit-notes"
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Opsional"
                />
              </div>
              <div className="field">
                <label>Deskripsi pelapor</label>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{editing.description}</p>
              </div>
              {editing.images && editing.images.length > 0 ? (
                <div className="field">
                  <label>Lampiran</label>
                  <ul className="multi-image-picker__list">
                    {editing.images.map((path) => {
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
              <button type="button" className="btn btn--secondary" onClick={() => setEditing(null)}>
                Batal
              </button>
              <button type="button" className="btn btn--primary" disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Menyimpan…' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
