/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { laporanService } from '../api/services'
import type { LaporanKehadiranRow, PaginationMeta } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ListFilterBar } from '../components/ListFilterBar'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { Pagination, rowNumber } from '../components/Pagination'
import { SearchableSelect } from '../components/SearchableSelect'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import { listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'

const PREFIX = 'laporan_kehadiran'

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function methodLabel(method: string) {
  return method === 'face' ? 'Wajah' : method === 'manual' ? 'Manual' : method
}

function typeLabel(type?: string | null) {
  if (type === 'pengajian') return 'Pengajian'
  if (type === 'kegiatan') return 'Kegiatan'
  return type || '—'
}

type ColumnDef = {
  key: string
  label: string
  sortKey?: string
  sortable?: boolean
  cell: (item: LaporanKehadiranRow) => ReactNode
  exportValue: (item: LaporanKehadiranRow) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'recorded_at',
    cell: (item) => formatDateTime(item.recorded_at),
    exportValue: (item) => formatDateTime(item.recorded_at),
  },
  {
    key: 'nama',
    label: 'Nama',
    sortable: false,
    cell: (item) => item.jamaah_nama || `Jamaah #${item.jamaah_id}`,
    exportValue: (item) => item.jamaah_nama || `Jamaah #${item.jamaah_id}`,
  },
  {
    key: 'kelompok',
    label: 'Kelompok',
    sortable: false,
    cell: (item) => item.kelompok_nama || '—',
    exportValue: (item) => item.kelompok_nama || '—',
  },
  {
    key: 'sesi',
    label: 'Sesi',
    sortable: false,
    cell: (item) => item.session_title || '—',
    exportValue: (item) => item.session_title || '—',
  },
  {
    key: 'jenis',
    label: 'Jenis',
    sortable: false,
    cell: (item) => typeLabel(item.session_type),
    exportValue: (item) => typeLabel(item.session_type),
  },
  {
    key: 'metode',
    label: 'Metode',
    sortKey: 'method',
    cell: (item) => methodLabel(item.method),
    exportValue: (item) => methodLabel(item.method),
  },
]

export function LaporanKehadiranPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<LaporanKehadiranRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'recorded_at', sortDir: 'desc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await laporanService.kehadiran({
        q: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        type: typeFilter || undefined,
        method: methodFilter || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat laporan kehadiran')
    } finally {
      setLoading(false)
    }
  }, [search, dateFrom, dateTo, typeFilter, methodFilter, page, perPage, sort])

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
    setDateFrom('')
    setDateTo('')
    setTypeFilter('')
    setMethodFilter('')
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)
  const hasActiveFilters =
    search !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    typeFilter !== '' ||
    methodFilter !== ''

  const title = [
    'Laporan Kehadiran',
    dateFrom || dateTo ? `(${dateFrom || '…'} s/d ${dateTo || '…'})` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Laporan Kehadiran</h1>
            <p>Rekap absensi jamaah per periode, jenis sesi, dan metode.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title={title}
              dokumenKey="laporan_kehadiran"
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
          placeholder: 'Cari nama jamaah…',
          ariaLabel: 'Cari kehadiran',
        }}
        primaryFilters={[
          <div className="field" key="from">
            <label htmlFor="lap-hadir-from">Dari</label>
            <input
              id="lap-hadir-from"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value)
                setPage(1)
              }}
            />
          </div>,
          <div className="field" key="to">
            <label htmlFor="lap-hadir-to">Sampai</label>
            <input
              id="lap-hadir-to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value)
                setPage(1)
              }}
            />
          </div>,
          <div className="field" key="type">
            <label htmlFor="lap-hadir-type">Jenis sesi</label>
            <SearchableSelect
              id="lap-hadir-type"
              value={typeFilter}
              onChange={(next) => {
                setTypeFilter(next)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'pengajian', label: 'Pengajian' },
                { value: 'kegiatan', label: 'Kegiatan' },
              ]}
            />
          </div>,
        ]}
        secondaryContent={
          <div className="field">
            <label htmlFor="lap-hadir-method">Metode</label>
            <SearchableSelect
              id="lap-hadir-method"
              value={methodFilter}
              onChange={(next) => {
                setMethodFilter(next)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'face', label: 'Wajah' },
                { value: 'manual', label: 'Manual' },
              ]}
            />
          </div>
        }
        secondaryActive={methodFilter !== ''}
        hasActiveFilters={hasActiveFilters}
        onReset={clearFilters}
        resetLabel="Reset"
      />

      {loading ? (
        <div className="loading-state">Memuat laporan…</div>
      ) : items.length === 0 ? (
        <p className="empty-state">Tidak ada data kehadiran untuk filter ini.</p>
      ) : visibleColumns.length === 0 ? (
        <p className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</p>
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
