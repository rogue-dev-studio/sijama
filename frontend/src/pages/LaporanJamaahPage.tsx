/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:39:06
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { laporanService, masterKelompokService } from '../api/services'
import type { Jamaah, Kelompok, PaginationMeta } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { Pagination, rowNumber } from '../components/Pagination'
import { SearchableSelect } from '../components/SearchableSelect'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import { KATEGORI_UMUR_OPTIONS, kategoriUmurLabel } from '../lib/jamaahOptions'
import { listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'

const PREFIX = 'laporan_jamaah'

type ColumnDef = {
  key: string
  label: string
  sortKey: string
  cell: (item: Jamaah) => ReactNode
  exportValue: (item: Jamaah) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'nama',
    label: 'Nama',
    sortKey: 'nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'kelompok',
    label: 'Kelompok',
    sortKey: 'kelompok',
    cell: (item) => item.kelompok?.nama || '—',
    exportValue: (item) => item.kelompok?.nama || '—',
  },
  {
    key: 'kategori',
    label: 'Kategori',
    sortKey: 'kategori_umur',
    cell: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
    exportValue: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
  },
  {
    key: 'nik',
    label: 'NIK',
    sortKey: 'nik',
    cell: (item) => item.nik || '—',
    exportValue: (item) => item.nik || '—',
  },
  {
    key: 'kontak',
    label: 'Kontak',
    sortKey: 'kontak',
    cell: (item) => [item.no_hp, item.email].filter(Boolean).join(' · ') || '—',
    exportValue: (item) => [item.no_hp, item.email].filter(Boolean).join(' · ') || '—',
  },
  {
    key: 'status',
    label: 'Status',
    sortKey: 'status',
    cell: (item) => item.status,
    exportValue: (item) => item.status,
  },
  {
    key: 'wajah',
    label: 'Wajah',
    sortKey: 'face',
    cell: (item) => (item.face_enrolled ? 'Terdaftar' : 'Belum'),
    exportValue: (item) => (item.face_enrolled ? 'Terdaftar' : 'Belum'),
  },
]

export function LaporanJamaahPage() {
  const { can } = useAuth()
  const [items, setItems] = useState<Jamaah[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [faceFilter, setFaceFilter] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState(0)
  const [kategoriUmurFilter, setKategoriUmurFilter] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'nama', sortDir: 'asc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await laporanService.jamaah({
        q: search || undefined,
        status: statusFilter || undefined,
        face: faceFilter || undefined,
        kelompok_id: kelompokFilter || undefined,
        kategori_umur: kategoriUmurFilter || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat laporan jamaah')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, faceFilter, kelompokFilter, kategoriUmurFilter, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void (async () => {
      try {
        const result = await masterKelompokService.list({ per_page: 100 })
        setKelompokList(result.items)
      } catch {
        setKelompokList([])
      }
    })()
  }, [])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setStatusFilter('')
    setFaceFilter('')
    setKelompokFilter(0)
    setKategoriUmurFilter('')
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
            <h1>Laporan Jamaah</h1>
            <p>Rekap data jamaah menurut kelompok, status, kategori umur, dan enroll wajah.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Laporan Jamaah"
              dokumenKey="laporan_jamaah"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Laporan Jamaah',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
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

      <div className="filter-bar">
        <form className="filter-bar__search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Cari nama / NIK…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari jamaah"
          />
          <button type="submit" className="btn btn--secondary">
            Cari
          </button>
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="lap-jamaah-status">Status</label>
            <SearchableSelect
              id="lap-jamaah-status"
              value={statusFilter}
              onChange={(next) => {
                setStatusFilter(next)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'aktif', label: 'Aktif' },
                { value: 'nonaktif', label: 'Nonaktif' },
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="lap-jamaah-face">Wajah</label>
            <SearchableSelect
              id="lap-jamaah-face"
              value={faceFilter}
              onChange={(next) => {
                setFaceFilter(next)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                { value: 'enrolled', label: 'Terdaftar' },
                { value: 'pending', label: 'Belum' },
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="lap-jamaah-kelompok">Kelompok</label>
            <SearchableSelect
              id="lap-jamaah-kelompok"
              value={kelompokFilter ? String(kelompokFilter) : ''}
              onChange={(next) => {
                setKelompokFilter(Number(next) || 0)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                ...kelompokList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="lap-jamaah-umur">Kategori umur</label>
            <SearchableSelect
              id="lap-jamaah-umur"
              value={kategoriUmurFilter}
              onChange={(next) => {
                setKategoriUmurFilter(next)
                setPage(1)
              }}
              options={[
                { value: '', label: 'Semua' },
                ...KATEGORI_UMUR_OPTIONS.map((item) => ({ value: item.value, label: item.label })),
              ]}
            />
          </div>
        </div>
        <div className="filter-bar__actions">
          <button type="button" className="btn btn--secondary" onClick={clearFilters}>
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Memuat laporan…</div>
      ) : items.length === 0 ? (
        <p className="empty-state">Tidak ada data jamaah untuk filter ini.</p>
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
