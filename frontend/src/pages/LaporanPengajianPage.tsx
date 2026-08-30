/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { laporanService } from '../api/services'
import type { PaginationMeta, Pengajian } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ListFilterBar } from '../components/ListFilterBar'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { Pagination, rowNumber } from '../components/Pagination'
import { SearchableSelect } from '../components/SearchableSelect'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import { listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'

const PREFIX = 'laporan_pengajian'

function statusLabel(status: string) {
  if (status === 'scheduled') return 'Terjadwal'
  if (status === 'completed') return 'Selesai'
  if (status === 'cancelled') return 'Dibatalkan'
  return status
}

type ColumnDef = {
  key: string
  label: string
  sortKey: string
  cell: (item: Pengajian) => ReactNode
  exportValue: (item: Pengajian) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'judul',
    label: 'Judul',
    sortKey: 'judul',
    cell: (item) => item.judul,
    exportValue: (item) => item.judul,
  },
  {
    key: 'pemateri',
    label: 'Pemateri',
    sortKey: 'pemateri',
    cell: (item) => item.pemateri || item.pemateri_ref?.nama || '—',
    exportValue: (item) => item.pemateri || item.pemateri_ref?.nama || '—',
  },
  {
    key: 'lokasi',
    label: 'Lokasi',
    sortKey: 'lokasi',
    cell: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
    exportValue: (item) => item.lokasi || item.lokasi_ref?.nama || '—',
  },
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'starts_at',
    cell: (item) => new Date(item.starts_at).toLocaleString('id-ID'),
    exportValue: (item) => new Date(item.starts_at).toLocaleString('id-ID'),
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => statusLabel(item.status),
    exportValue: (item) => statusLabel(item.status),
  },
]

export function LaporanPengajianPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Pengajian[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'starts_at', sortDir: 'desc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await laporanService.pengajian({
        q: search || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat laporan pengajian')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, dateFrom, dateTo, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  function submitSearch() {
    setSearch(query)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)
  const hasActiveFilters =
    search !== '' || statusFilter !== '' || dateFrom !== '' || dateTo !== ''

  const title = [
    'Laporan Pengajian',
    dateFrom || dateTo ? `(${dateFrom || '…'} s/d ${dateTo || '…'})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Laporan Pengajian</h1>
            <p>Rekap jadwal pengajian per periode dan status.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title={title}
              dokumenKey="laporan_pengajian"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title,
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                columnKeys: ['no', ...visibleColumns.map((column) => column.key)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <ListFilterBar
        search={{
          value: query,
          onChange: setQuery,
          onSubmit: submitSearch,
          placeholder: 'Cari judul atau pemateri…',
          ariaLabel: 'Cari pengajian',
        }}
        primaryFilters={[
          <div className="field" key="status">
            <label htmlFor="lap-pengajian-status">Status</label>
            <SearchableSelect
              id="lap-pengajian-status"
              value={statusFilter}
              onChange={(next) => {
                setStatusFilter(next)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'scheduled', label: 'Terjadwal' },
                { value: 'completed', label: 'Selesai' },
                { value: 'cancelled', label: 'Dibatalkan' },
              ]}
            />
          </div>,
          <div className="field" key="from">
            <label htmlFor="lap-pengajian-from">Dari</label>
            <input
              id="lap-pengajian-from"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value)
                setPage(1)
              }}
            />
          </div>,
          <div className="field" key="to">
            <label htmlFor="lap-pengajian-to">Sampai</label>
            <input
              id="lap-pengajian-to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value)
                setPage(1)
              }}
            />
          </div>,
        ]}
        hasActiveFilters={hasActiveFilters}
        onReset={clearFilters}
        resetLabel="Reset"
      />

      {loading ? (
        <div className="loading-state">Memuat laporan…</div>
      ) : items.length === 0 ? (
        <p className="empty-state">Tidak ada data pengajian untuk filter ini.</p>
      ) : visibleColumns.length === 0 ? (
        <p className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</p>
      ) : (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">No</th>
                  {visibleColumns.map((column) => (
                    <SortableTh
                      key={column.key}
                      label={column.label}
                      column={column.sortKey}
                      {...sortBind}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{column.cell(item)}</td>
                    ))}
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
