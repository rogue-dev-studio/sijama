/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:14:05
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { aplikasiKonfigDokumenService } from '../api/services'
import type { KonfigDokumen, PaginationMeta } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { PermissionLink } from '../components/PermissionLink'
import { Pagination, rowNumber } from '../components/Pagination'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import { listButtonAccess, listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'

const PREFIX = 'konfig_dokumen'

function mediaLabel(item: KonfigDokumen): string {
  const parts: string[] = []
  if (item.apply_pdf) parts.push('PDF')
  if (item.apply_excel) parts.push('Excel')
  if (item.apply_csv) parts.push('CSV')
  return parts.length > 0 ? parts.join(', ') : '—'
}

type ColumnDef = {
  key: string
  label: string
  sortKey?: string
  sortable?: boolean
  cell: (item: KonfigDokumen) => ReactNode
  exportValue: (item: KonfigDokumen) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'nama_cetakan',
    label: 'Nama cetakan',
    sortKey: 'lookup_name',
    cell: (item) => item.lookup_name || item.nama || '—',
    exportValue: (item) => item.lookup_name || item.nama || '—',
  },
  {
    key: 'value',
    label: 'Value',
    sortKey: 'lookup_value',
    cell: (item) => <code>{item.lookup_value || '—'}</code>,
    exportValue: (item) => item.lookup_value || '—',
  },
  {
    key: 'header',
    label: 'Header',
    sortable: false,
    cell: (item) => item.header || '—',
    exportValue: (item) => item.header || '—',
  },
  {
    key: 'media',
    label: 'Media',
    sortable: false,
    cell: (item) => mediaLabel(item),
    exportValue: (item) => mediaLabel(item),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    cell: (item) => (
      <span className={`badge ${item.is_configured ? 'badge--ok' : 'badge--muted'}`}>
        {item.is_configured ? 'Terkonfigurasi' : 'Belum'}
      </span>
    ),
    exportValue: (item) => (item.is_configured ? 'Terkonfigurasi' : 'Belum'),
  },
]

export function AplikasiKonfigDokumenPage() {
  const { can } = useAuth()
  const updateAccess = listButtonAccess(can, PREFIX, 'update')
  const createLookupAccess = listButtonAccess(can, 'lookup', 'create')
  const [items, setItems] = useState<KonfigDokumen[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'lookup_urutan', sortDir: 'asc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)
  const showActions = updateAccess.visible

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await aplikasiKonfigDokumenService.list({
        q: search || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat konfigurasi dokumen')
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Konfigurasi Dokumen</h1>
            <p>
              Header/footer per cetakan dari lookup tipe <code>konfig_dokumen</code>.
            </p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Konfigurasi Dokumen"
              dokumenKey="master_list"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Konfigurasi Dokumen',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
            {createLookupAccess.visible && (
              <PermissionLink
                to="/master/lookup/new"
                enabled={createLookupAccess.enabled}
                className="btn btn--secondary"
              >
                Tambah lookup
              </PermissionLink>
            )}
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari nama / value cetakan…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari konfigurasi dokumen"
          />
          <button type="submit" className="btn btn--secondary">
            Cari
          </button>
        </form>
        <div className="filter-bar__actions">
          <button type="button" className="btn btn--secondary" onClick={clearFilters}>
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Memuat konfigurasi dokumen…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>
            Belum ada lookup tipe <code>konfig_dokumen</code>. Tambahkan di Master Lookup (tipe
            manual).
          </p>
          {createLookupAccess.visible && (
            <PermissionLink
              to="/master/lookup/new"
              enabled={createLookupAccess.enabled}
              className="btn btn--secondary"
            >
              Tambah lookup
            </PermissionLink>
          )}
        </div>
      ) : visibleColumns.length === 0 && !showActions ? (
        <div className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</div>
      ) : (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">No</th>
                  {visibleColumns.map((column) =>
                    column.sortable === false ? (
                      <th key={column.key} scope="col">
                        {column.label}
                      </th>
                    ) : (
                      <SortableTh
                        key={column.key}
                        label={column.label}
                        column={column.sortKey ?? column.key}
                        {...sortBind}
                      />
                    ),
                  )}
                  {showActions && <th scope="col">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.lookup_id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{column.cell(item)}</td>
                    ))}
                    {showActions && (
                      <td>
                        <PermissionLink
                          to={`/aplikasi/konfig-dokumen/${item.lookup_id}/edit`}
                          enabled={updateAccess.enabled}
                          className="btn btn--secondary btn--small"
                        >
                          Ubah
                        </PermissionLink>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={setPage} onPerPageChange={setPerPage} />
        </>
      )}
    </>
  )
}
