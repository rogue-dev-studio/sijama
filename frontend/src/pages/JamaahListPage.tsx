import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { jamaahService, masterKelompokService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from '../components/Pagination'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import type { Jamaah, Kelompok, PaginationMeta } from '../api/types'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { KATEGORI_UMUR_OPTIONS, kategoriUmurLabel } from '../lib/jamaahOptions'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'
import { SearchableSelect } from '../components/SearchableSelect'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { PermissionLink } from '../components/PermissionLink'
import { useToast } from '../components/ToastProvider'
import { listButtonAccess, listColumnPerm, listExportAccess } from '../lib/listUiAccess'

type JamaahColumnKey =
  | 'nama'
  | 'kelompok'
  | 'kategori'
  | 'nik'
  | 'kontak'
  | 'status'
  | 'wajah'

type JamaahColumnDef = {
  key: JamaahColumnKey
  label: string
  permission: string
  sortKey: string
  cell: (item: Jamaah) => ReactNode
  exportValue: (item: Jamaah) => string | number
}

const JAMAHA_COLUMNS: JamaahColumnDef[] = [
  {
    key: 'nama',
    label: 'Nama',
    permission: listColumnPerm('jamaah', 'nama'),
    sortKey: 'nama',
    cell: (item) => item.nama,
    exportValue: (item) => item.nama,
  },
  {
    key: 'kelompok',
    label: 'Kelompok',
    permission: listColumnPerm('jamaah', 'kelompok'),
    sortKey: 'kelompok',
    cell: (item) => item.kelompok?.nama || '—',
    exportValue: (item) => item.kelompok?.nama || '—',
  },
  {
    key: 'kategori',
    label: 'Kategori',
    permission: listColumnPerm('jamaah', 'kategori'),
    sortKey: 'kategori_umur',
    cell: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
    exportValue: (item) => item.kategori_umur_label || kategoriUmurLabel(item.kategori_umur),
  },
  {
    key: 'nik',
    label: 'NIK',
    permission: listColumnPerm('jamaah', 'nik'),
    sortKey: 'nik',
    cell: (item) => item.nik || '—',
    exportValue: (item) => item.nik || '—',
  },
  {
    key: 'kontak',
    label: 'Kontak',
    permission: listColumnPerm('jamaah', 'kontak'),
    sortKey: 'kontak',
    cell: (item) => (
      <>
        {item.no_hp}
        {item.email ? ` · ${item.email}` : ''}
      </>
    ),
    exportValue: (item) => [item.no_hp, item.email].filter(Boolean).join(' · ') || '—',
  },
  {
    key: 'status',
    label: 'Status',
    permission: listColumnPerm('jamaah', 'status'),
    sortKey: 'status',
    cell: (item) => (
      <span className={`badge ${item.status === 'aktif' ? 'badge--ok' : 'badge--muted'}`}>
        {item.status}
      </span>
    ),
    exportValue: (item) => item.status,
  },
  {
    key: 'wajah',
    label: 'Wajah',
    permission: listColumnPerm('jamaah', 'wajah'),
    sortKey: 'face',
    cell: (item) => (
      <span className={`badge ${item.face_enrolled ? 'badge--ok' : 'badge--muted'}`}>
        {item.face_enrolled ? 'Terdaftar' : 'Belum'}
      </span>
    ),
    exportValue: (item) => (item.face_enrolled ? 'Terdaftar' : 'Belum'),
  },
]

export function JamaahListPage() {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
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

  const visibleColumns = useMemo(
    () => JAMAHA_COLUMNS.filter((column) => can(column.permission)),
    [can],
  )
  const exportAccess = listExportAccess(can, 'jamaah')
  const createAccess = listButtonAccess(can, 'jamaah', 'create')
  const updateAccess = listButtonAccess(can, 'jamaah', 'update')
  const deleteAccess = listButtonAccess(can, 'jamaah', 'delete')
  const faceAccess = listButtonAccess(can, 'jamaah', 'enroll_face', 'jamaah.enroll_face')
  const showActions = updateAccess.visible || faceAccess.visible || deleteAccess.visible

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await jamaahService.list({
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
      setError(err instanceof ApiError ? err.message : 'Gagal memuat jamaah')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, faceFilter, kelompokFilter, kategoriUmurFilter, page, perPage, sort])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    async function loadKelompok() {
      try {
        const result = await masterKelompokService.list({ per_page: 100 })
        setKelompokList(result.items)
      } catch {
        setKelompokList([])
      }
    }
    void loadKelompok()
  }, [])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function handleFilterChange(
    key: 'status' | 'face' | 'kelompok' | 'kategori_umur',
    value: string | number,
  ) {
    if (key === 'status') setStatusFilter(String(value))
    if (key === 'face') setFaceFilter(String(value))
    if (key === 'kelompok') setKelompokFilter(Number(value))
    if (key === 'kategori_umur') setKategoriUmurFilter(String(value))
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

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== '' ||
    faceFilter !== '' ||
    kelompokFilter > 0 ||
    kategoriUmurFilter !== ''

  async function handleDelete(id: number, nama: string) {
    if (!window.confirm(`Hapus jamaah "${nama}"?`)) return
    try {
      await jamaahService.remove(id)
      notifyDeleted('jamaah')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus jamaah')
    }
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Jamaah</h1>
            <p>Kelola data jamaah dan pendaftaran wajah.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title="Daftar Jamaah"
              dokumenKey="jamaah"
              disabled={loading || items.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: 'Daftar Jamaah',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                rows: items.map((item, index) => [
                  rowNumber(meta, index),
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
            {createAccess.visible && (
              <PermissionLink
                to="/jamaah/new"
                enabled={createAccess.enabled}
                className="btn btn--primary"
              >
                Tambah jamaah
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
            placeholder="Cari nama, NIK, email, atau HP…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Cari jamaah"
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
            <label htmlFor="filter_face">Wajah</label>
            <SearchableSelect
              id="filter_face"
              value={faceFilter}
              onChange={(next) => handleFilterChange('face', next)}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                { value: 'enrolled', label: 'Terdaftar' },
                { value: 'pending', label: 'Belum' },
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
          <div className="field">
            <label htmlFor="filter_kategori_umur">Kategori umur</label>
            <SearchableSelect
              id="filter_kategori_umur"
              value={kategoriUmurFilter}
              onChange={(next) => handleFilterChange('kategori_umur', next)}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                ...KATEGORI_UMUR_OPTIONS.map((option) => ({
                  value: String(option.value),
                  label: option.label,
                })),
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

      {loading && <div className="loading-state">Memuat jamaah…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters ? 'Tidak ada jamaah yang cocok.' : 'Belum ada data jamaah.'}
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
                  {visibleColumns.map((column) => (
                    <SortableTh
                      key={column.key}
                      label={column.label}
                      column={column.sortKey}
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
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{column.cell(item)}</td>
                    ))}
                    {showActions && (
                      <td>
                        <div className="data-table__actions">
                          {updateAccess.visible && (
                            <PermissionLink
                              to={`/jamaah/${item.id}/edit`}
                              enabled={updateAccess.enabled}
                              className="btn btn--secondary btn--small"
                            >
                              Edit
                            </PermissionLink>
                          )}
                          {faceAccess.visible && (
                            <PermissionLink
                              to={`/jamaah/${item.id}/face`}
                              enabled={faceAccess.enabled}
                              className="btn btn--secondary btn--small"
                            >
                              Wajah
                            </PermissionLink>
                          )}
                          {deleteAccess.visible && (
                            <button
                              type="button"
                              className="btn btn--danger btn--small"
                              disabled={!deleteAccess.enabled}
                              onClick={() => void handleDelete(item.id, item.nama)}
                            >
                              Hapus
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
