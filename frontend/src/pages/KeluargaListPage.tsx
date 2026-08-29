/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:35:00
 */

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { jamaahService, keluargaService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import type { Kelompok, Keluarga, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'
import { SearchableSelect } from '../components/SearchableSelect'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { PermissionLink } from '../components/PermissionLink'
import { useToast } from '../components/ToastProvider'
import { listButtonAccess, listColumnPerm, listExportAccess } from '../lib/listUiAccess'

type KeluargaColumnKey = 'kepala' | 'no_kk' | 'anggota' | 'alamat' | 'kelompok' | 'status'

type KeluargaColumnDef = {
  key: KeluargaColumnKey
  label: string
  permission: string
  sortKey: string
  cell: (item: Keluarga) => ReactNode
  exportValue: (item: Keluarga) => string | number
}

function formatAlamat(item: Keluarga): string {
  const parts = [
    item.alamat,
    item.rt ? `RT ${item.rt}` : null,
    item.rw ? `RW ${item.rw}` : null,
    item.adm_desa_kelurahan?.nama,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const KELUARGA_COLUMNS: KeluargaColumnDef[] = [
  {
    key: 'kepala',
    label: 'Kepala Keluarga',
    permission: listColumnPerm('keluarga', 'kepala'),
    sortKey: 'kepala',
    cell: (item) => (
      <div className="data-table__stack">
        <span className="data-table__primary">{item.kepala_jamaah?.nama || '—'}</span>
        {item.kepala_jamaah?.nik ? (
          <span className="data-table__meta">NIK {item.kepala_jamaah.nik}</span>
        ) : null}
      </div>
    ),
    exportValue: (item) => item.kepala_jamaah?.nama || '—',
  },
  {
    key: 'no_kk',
    label: 'No. KK',
    permission: listColumnPerm('keluarga', 'no_kk'),
    sortKey: 'no_kk',
    cell: (item) => item.no_kk || '—',
    exportValue: (item) => item.no_kk || '—',
  },
  {
    key: 'anggota',
    label: 'Anggota',
    permission: listColumnPerm('keluarga', 'anggota'),
    sortKey: 'anggota',
    cell: (item) => {
      const count = item.anggota_count ?? item.anggota?.length ?? 0
      return <span className="badge badge--muted">{count} orang</span>
    },
    exportValue: (item) => item.anggota_count ?? item.anggota?.length ?? 0,
  },
  {
    key: 'alamat',
    label: 'Alamat',
    permission: listColumnPerm('keluarga', 'alamat'),
    sortKey: 'alamat',
    cell: (item) => <span className="data-table__clip">{formatAlamat(item)}</span>,
    exportValue: (item) => formatAlamat(item),
  },
  {
    key: 'kelompok',
    label: 'Kelompok',
    permission: listColumnPerm('keluarga', 'kelompok'),
    sortKey: 'kelompok',
    cell: (item) => item.kelompok?.nama || '—',
    exportValue: (item) => item.kelompok?.nama || '—',
  },
  {
    key: 'status',
    label: 'Status',
    permission: listColumnPerm('keluarga', 'status'),
    sortKey: 'status',
    cell: (item) => (
      <span className={`badge ${item.status === 'aktif' ? 'badge--ok' : 'badge--muted'}`}>
        {item.status}
      </span>
    ),
    exportValue: (item) => item.status,
  },
]

export function KeluargaListPage() {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
  const [items, setItems] = useState<Keluarga[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [kelompokFilter, setKelompokFilter] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'kepala', sortDir: 'asc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const visibleColumns = useMemo(
    () => KELUARGA_COLUMNS.filter((col) => can(col.permission)),
    [can],
  )
  const exportAccess = listExportAccess(can, 'keluarga')
  const createAccess = listButtonAccess(can, 'keluarga', 'create')
  const updateAccess = listButtonAccess(can, 'keluarga', 'update')
  const deleteAccess = listButtonAccess(can, 'keluarga', 'delete')
  const showActions = updateAccess.visible || deleteAccess.visible

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await keluargaService.list({
        q: search || undefined,
        status: statusFilter || undefined,
        kelompok_id: kelompokFilter || undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      })
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat data keluarga')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, kelompokFilter, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    let active = true
    void jamaahService.kelompokOptions().then((options) => {
      if (active) setKelompokList(options)
    })
    return () => {
      active = false
    }
  }, [])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query.trim())
    setPage(1)
  }

  function handleFilterChange(key: 'status' | 'kelompok', value: string | number) {
    if (key === 'status') setStatusFilter(String(value))
    if (key === 'kelompok') setKelompokFilter(Number(value))
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setStatusFilter('')
    setKelompokFilter(0)
    setPage(1)
  }

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)

  const hasActiveFilters = search !== '' || statusFilter !== '' || kelompokFilter > 0

  async function handleDelete(id: number, nama: string) {
    if (!window.confirm(`Hapus keluarga "${nama}"? Anggota jamaah tidak ikut dihapus.`)) return
    setDeletingId(id)
    try {
      await keluargaService.remove(id)
      notifyDeleted('keluarga')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus keluarga')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Keluarga</h1>
            <p>Kelola kepala keluarga dan anggota rumah tangga jamaah.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Daftar Keluarga"
              dokumenKey="keluarga"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Daftar Keluarga',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
            {createAccess.visible && (
              <PermissionLink
                to="/keluarga/new"
                enabled={createAccess.enabled}
                className="btn btn--primary"
              >
                Tambah keluarga
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
            placeholder="Cari no. KK, alamat, atau nama kepala…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari keluarga"
          />
        </form>
        <div className="filter-bar__fields">
          <div className="field">
            <label htmlFor="filter_status">Status</label>
            <SearchableSelect
              id="filter_status"
              value={statusFilter}
              onChange={(next) => handleFilterChange('status', next)}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                { value: 'aktif', label: 'Aktif' },
                { value: 'nonaktif', label: 'Nonaktif' },
              ]}
            />
          </div>
          <div className="field">
            <label htmlFor="filter_kelompok">Kelompok</label>
            <SearchableSelect
              id="filter_kelompok"
              value={kelompokFilter ? String(kelompokFilter) : ''}
              onChange={(next) => handleFilterChange('kelompok', next)}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                ...kelompokList.map((item) => ({ value: String(item.id), label: item.nama })),
              ]}
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="filter-bar__actions">
            <button type="button" className="btn btn--secondary" onClick={clearFilters}>
              Hapus filter
            </button>
          </div>
        )}
      </div>

      {loading && <div className="loading-state">Memuat data keluarga…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada keluarga yang cocok.' : 'Belum ada data keluarga.'}
          {!hasActiveFilters && createAccess.visible && (
            <div className="empty-state__actions">
              <PermissionLink
                to="/keluarga/new"
                enabled={createAccess.enabled}
                className="btn btn--primary"
              >
                Tambah keluarga pertama
              </PermissionLink>
            </div>
          )}
        </div>
      )}

      {!loading && items.length > 0 && visibleColumns.length === 0 && !showActions && (
        <div className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</div>
      )}

      {!loading && items.length > 0 && (visibleColumns.length > 0 || showActions) && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  {visibleColumns.map((col) => (
                    <SortableTh
                      key={col.key}
                      label={col.label}
                      column={col.sortKey}
                      {...sortBind}
                    />
                  ))}
                  {showActions && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    {visibleColumns.map((col) => (
                      <td key={col.key}>{col.cell(item)}</td>
                    ))}
                    {showActions && (
                      <td>
                        <div className="data-table__actions">
                          {updateAccess.visible && (
                            <PermissionLink
                              to={`/keluarga/${item.id}/edit`}
                              enabled={updateAccess.enabled}
                              className="btn btn--secondary btn--small"
                            >
                              Edit
                            </PermissionLink>
                          )}
                          {deleteAccess.visible && (
                            <button
                              type="button"
                              className="btn btn--danger btn--small"
                              disabled={!deleteAccess.enabled || deletingId === item.id}
                              onClick={() =>
                                void handleDelete(item.id, item.kepala_jamaah?.nama || 'Keluarga')
                              }
                            >
                              {deletingId === item.id ? 'Menghapus…' : 'Hapus'}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            meta={meta}
            onPageChange={setPage}
            onPerPageChange={(next) => {
              setPerPage(next)
              setPage(1)
            }}
          />
        </>
      )}
    </>
  )
}
