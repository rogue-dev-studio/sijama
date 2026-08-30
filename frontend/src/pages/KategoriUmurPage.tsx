/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { kategoriUmurService } from '../api/services'
import type { KategoriUmurRingkasanRow, PaginationMeta } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { ListFilterBar } from '../components/ListFilterBar'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { Pagination, rowNumber } from '../components/Pagination'
import { SearchableSelect } from '../components/SearchableSelect'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import { KATEGORI_UMUR_OPTIONS } from '../lib/jamaahOptions'
import { listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, type ListSortState } from '../lib/listSort'

const FILTER_BELUM = 'belum'
const PREFIX = 'kategori_umur'

type ColumnDef = {
  key: string
  label: string
  sortKey: string
  cell: (row: KategoriUmurRingkasanRow) => ReactNode
  exportValue: (row: KategoriUmurRingkasanRow) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'grup',
    label: 'Grup',
    sortKey: 'grup',
    cell: (row) => row.grup,
    exportValue: (row) => row.grup,
  },
  {
    key: 'kategori',
    label: 'Kategori',
    sortKey: 'nama',
    cell: (row) => row.nama,
    exportValue: (row) => row.nama,
  },
  {
    key: 'rentang',
    label: 'Rentang',
    sortKey: 'rentang_usia',
    cell: (row) => row.rentang_usia,
    exportValue: (row) => row.rentang_usia,
  },
  {
    key: 'jumlah',
    label: 'Jumlah',
    sortKey: 'jumlah',
    cell: (row) => row.jumlah,
    exportValue: (row) => row.jumlah,
  },
]

function emptyRingkasan(): KategoriUmurRingkasanRow[] {
  return [
    ...KATEGORI_UMUR_OPTIONS.map((option) => ({
      kode: option.value,
      nama: option.label,
      grup: option.group,
      rentang_usia: option.rentang,
      jumlah: 0,
    })),
    {
      kode: FILTER_BELUM,
      nama: 'Belum diklasifikasi',
      grup: 'Lainnya',
      rentang_usia: 'Tgl lahir kosong / usia 21–59 tanpa status nikah',
      jumlah: 0,
    },
  ]
}

function compareRows(
  a: KategoriUmurRingkasanRow,
  b: KategoriUmurRingkasanRow,
  sortBy: string,
  sortDir: 'asc' | 'desc',
): number {
  const dir = sortDir === 'asc' ? 1 : -1
  let av: string | number = ''
  let bv: string | number = ''
  if (sortBy === 'grup') {
    av = a.grup
    bv = b.grup
  } else if (sortBy === 'nama') {
    av = a.nama
    bv = b.nama
  } else if (sortBy === 'rentang_usia') {
    av = a.rentang_usia
    bv = b.rentang_usia
  } else if (sortBy === 'jumlah') {
    av = a.jumlah
    bv = b.jumlah
  } else {
    av = a.nama
    bv = b.nama
  }
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * dir
  }
  return String(av).localeCompare(String(bv), 'id') * dir
}

export function KategoriUmurPage() {
  const { can } = useAuth()
  const [ringkasan, setRingkasan] = useState<KategoriUmurRingkasanRow[]>(emptyRingkasan)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [grupFilter, setGrupFilter] = useState('')
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
      const result = await kategoriUmurService.list({ page: 1, per_page: 5 })
      setRingkasan(result.ringkasan?.length ? result.ringkasan : emptyRingkasan())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kategori umur')
      setRingkasan(emptyRingkasan())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const grupOptions = useMemo(() => {
    const groups = [...new Set(ringkasan.map((row) => row.grup))]
    return [
      { value: '', label: 'Semua grup' },
      ...groups.map((grup) => ({ value: grup, label: grup })),
    ]
  }, [ringkasan])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = ringkasan.filter((row) => {
      if (grupFilter && row.grup !== grupFilter) return false
      if (!q) return true
      return (
        row.nama.toLowerCase().includes(q) ||
        row.grup.toLowerCase().includes(q) ||
        row.rentang_usia.toLowerCase().includes(q)
      )
    })
    return [...rows].sort((a, b) => compareRows(a, b, sort.sortBy, sort.sortDir))
  }, [ringkasan, search, grupFilter, sort])

  const meta: PaginationMeta = useMemo(() => {
    const total = filteredRows.length
    const lastPage = Math.max(1, Math.ceil(total / perPage) || 1)
    const currentPage = Math.min(Math.max(1, page), lastPage)
    return {
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
    }
  }, [filteredRows.length, page, perPage])

  const pagedRows = useMemo(() => {
    const start = (meta.current_page - 1) * meta.per_page
    return filteredRows.slice(start, start + meta.per_page)
  }, [filteredRows, meta.current_page, meta.per_page])

  function submitSearch() {
    setSearch(query)
    setPage(1)
  }

  function handleGrupChange(next: string) {
    setGrupFilter(next)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setGrupFilter('')
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)

  const hasActiveFilters = search !== '' || grupFilter !== ''

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Kategori umur</h1>
            <p>
              Semua kategori tetap ditampilkan (jumlah 0 jika belum ada data). Klasifikasi dari
              tanggal lahir dan status pernikahan.
            </p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Kategori Umur"
              dokumenKey="kategori_umur"
              disabled={loading || filteredRows.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Kategori Umur',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                columnKeys: ['no', ...visibleColumns.map((column) => column.key)],
                rows: filteredRows.map((row, index) => [
                  index + 1,
                  ...visibleColumns.map((column) => column.exportValue(row)),
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
          placeholder: 'Cari kategori atau grup…',
          ariaLabel: 'Cari kategori umur',
        }}
        primaryFilters={[
          <div className="field" key="grup">
            <label htmlFor="filter_grup">Grup</label>
            <SearchableSelect
              id="filter_grup"
              value={grupFilter}
              onChange={handleGrupChange}
              placeholder="Semua grup"
              options={grupOptions}
            />
          </div>,
        ]}
        hasActiveFilters={hasActiveFilters}
        onReset={clearFilters}
      />

      {loading && <div className="loading-state">Memuat kategori umur…</div>}

      {!loading && filteredRows.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada kategori yang cocok.' : 'Belum ada master kategori umur.'}
        </div>
      )}

      {!loading && filteredRows.length > 0 && visibleColumns.length === 0 && (
        <div className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</div>
      )}

      {!loading && filteredRows.length > 0 && visibleColumns.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
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
              {pagedRows.map((row, index) => (
                <tr key={row.kode ?? FILTER_BELUM}>
                  <td className="col-no">{rowNumber(meta, index)}</td>
                  {visibleColumns.map((column) => (
                    <td key={column.key}>{column.cell(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        <Pagination
          meta={meta.total > 0 ? meta : { ...DEFAULT_PAGINATION_META, per_page: perPage }}
          showWhenEmpty
          onPageChange={setPage}
          onPerPageChange={(next) => {
            setPerPage(next)
            setPage(1)
          }}
        />
      )}
    </>
  )
}
