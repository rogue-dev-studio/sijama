/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 16:57:14
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import type { Paginated, PaginationMeta } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { listButtonAccess, listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { ExportPrintActions } from './ExportPrintActions'
import { PermissionLink } from './PermissionLink'
import { Pagination, rowNumber } from './Pagination'
import { SearchableSelect } from './SearchableSelect'
import { SortableTh, bindSortableTh } from './SortableTh'
import { useToast } from './ToastProvider'
import type { ExportTablePayload } from '../lib/tableExport'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'
import { toggleSort, toSortParams, type ListSortState } from '../lib/listSort'

export type SimpleMasterListItem = {
  id: number
  nama: string
  is_active?: boolean
}

export type MasterListParams = {
  q?: string
  is_active?: boolean
  page?: number
  per_page?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  [key: string]: string | number | boolean | undefined
}

export type ParentFilterConfig = {
  label: string
  paramKey: string
  loadOptions: () => Promise<Array<{ id: number; nama: string }>>
  allLabel?: string
}

export type SelectFilterConfig = {
  label: string
  paramKey: string
  options: Array<{ value: string; label: string }>
  allLabel?: string
}

export type SortColumnDef = { key: string; label: string }

export type SortColumnsConfig = {
  leading?: SortColumnDef[]
  nama?: SortColumnDef | false
  extra?: SortColumnDef[]
  status?: SortColumnDef | false
}

export type GatedColumn<T> = {
  key: string
  label: string
  sortKey?: string
  sortable?: boolean
  cell: (item: T) => ReactNode
  exportValue: (item: T) => string | number
}

type SimpleMasterListPageProps<T extends SimpleMasterListItem> = {
  title: string
  description: string
  entityLabel: string
  basePath: string
  permissionPrefix: string
  createLabel: string
  list: (params: MasterListParams) => Promise<Paginated<T>>
  remove: (id: number) => Promise<unknown>
  searchPlaceholder?: string
  showStatusFilter?: boolean
  showStatusColumn?: boolean
  parentFilter?: ParentFilterConfig
  selectFilter?: SelectFilterConfig
  /** Filter tambahan (mis. cascade wilayah) — digabung ke params list. */
  extraFilterParams?: Record<string, string | number | boolean | undefined>
  renderExtraFilters?: (helpers: { setPage: (page: number) => void }) => ReactNode
  hasExtraFilters?: boolean
  onClearExtraFilters?: () => void
  requireParentOptionsForCreate?: boolean
  canDeleteItem?: (item: T) => boolean
  columns?: GatedColumn<T>[]
  renderLeadingHeaders?: () => ReactNode
  renderLeadingCells?: (item: T) => ReactNode
  renderExtraHeaders?: () => ReactNode
  renderExtraCells?: (item: T) => ReactNode
  renderStatusExtra?: (item: T) => ReactNode
  itemLabel?: (item: T) => string
  actionsHeaderLabel?: string
  /** Tombol Ekspor / Cetak di header (default: true). */
  enableExport?: boolean
  /** Kunci cetakan = lookup_value tipe konfig_dokumen. */
  dokumenKey?: string
  getExportPayload?: (items: T[], meta: PaginationMeta) => ExportTablePayload
  sortColumns?: SortColumnsConfig
  defaultSortBy?: string
}

export function SimpleMasterListPage<T extends SimpleMasterListItem>({
  title,
  description,
  entityLabel,
  basePath,
  permissionPrefix,
  createLabel,
  list,
  remove,
  searchPlaceholder = 'Cari nama…',
  showStatusFilter = true,
  showStatusColumn = true,
  parentFilter,
  selectFilter,
  extraFilterParams,
  renderExtraFilters,
  hasExtraFilters = false,
  onClearExtraFilters,
  requireParentOptionsForCreate = false,
  canDeleteItem,
  columns,
  renderLeadingHeaders,
  renderLeadingCells,
  renderExtraHeaders,
  renderExtraCells,
  renderStatusExtra,
  itemLabel,
  actionsHeaderLabel = 'Aksi',
  enableExport = true,
  dokumenKey = 'master_list',
  getExportPayload,
  sortColumns,
  defaultSortBy = 'nama',
}: SimpleMasterListPageProps<T>) {
  const { can } = useAuth()
  const { notifyDeleted } = useToast()
  const [items, setItems] = useState<T[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION_META)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'' | '1' | '0'>('')
  const [parentId, setParentId] = useState(0)
  const [selectValue, setSelectValue] = useState('')
  const [parentOptions, setParentOptions] = useState<Array<{ id: number; nama: string }>>([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)
  const [sort, setSort] = useState<ListSortState>({ sortBy: defaultSortBy, sortDir: 'asc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const useGatedColumns = columns !== undefined
  const visibleColumns = useGatedColumns
    ? columns.filter((column) => can(listColumnPerm(permissionPrefix, column.key)))
    : []
  const exportAccess = listExportAccess(can, permissionPrefix)
  const createAccess = listButtonAccess(can, permissionPrefix, 'create')
  const updateAccess = listButtonAccess(can, permissionPrefix, 'update')
  const deleteAccess = listButtonAccess(can, permissionPrefix, 'delete')
  const showActions = useGatedColumns
    ? updateAccess.visible || deleteAccess.visible
    : true

  const namaColumn =
    sortColumns?.nama === false ? null : (sortColumns?.nama ?? { key: 'nama', label: 'Nama' })
  const statusColumn =
    showStatusColumn && sortColumns?.status !== false
      ? (sortColumns?.status ?? { key: 'is_active', label: 'Status' })
      : null

  useEffect(() => {
    if (!parentFilter) return
    let active = true
    const loadOptions = parentFilter.loadOptions
    const label = parentFilter.label
    void (async () => {
      try {
        const options = await loadOptions()
        if (active) setParentOptions(options)
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : `Gagal memuat ${label}`)
        }
      }
    })()
    return () => {
      active = false
    }
  }, [parentFilter?.paramKey, parentFilter?.loadOptions, parentFilter?.label])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: MasterListParams = {
        q: search || undefined,
        is_active:
          showStatusFilter && isActiveFilter !== '' ? isActiveFilter === '1' : undefined,
        page,
        per_page: perPage,
        ...toSortParams(sort),
      }
      if (parentFilter && parentId > 0) {
        params[parentFilter.paramKey] = parentId
      }
      if (selectFilter && selectValue) {
        params[selectFilter.paramKey] = selectValue
      }
      if (extraFilterParams) {
        for (const [key, value] of Object.entries(extraFilterParams)) {
          if (value !== undefined && value !== '' && value !== 0) {
            params[key] = value
          }
        }
      }
      const result = await list(params)
      setItems(result.items)
      setMeta(result.meta)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Gagal memuat ${entityLabel}`)
    } finally {
      setLoading(false)
    }
  }, [
    search,
    isActiveFilter,
    page,
    perPage,
    sort,
    list,
    entityLabel,
    showStatusFilter,
    parentFilter,
    parentId,
    selectFilter,
    selectValue,
    extraFilterParams,
  ])

  useEffect(() => {
    void load()
  }, [load])

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
    setPage(1)
  }

  const sortBind = bindSortableTh(sort, handleSort)

  async function handleDelete(item: T) {
    const label = itemLabel?.(item) ?? item.nama
    if (!window.confirm(`Hapus ${entityLabel} "${label}"?`)) return
    setError(null)
    try {
      await remove(item.id)
      notifyDeleted(entityLabel)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Gagal menghapus ${entityLabel}`)
    }
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    setSearch(query)
    setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setSearch('')
    setIsActiveFilter('')
    setParentId(0)
    setSelectValue('')
    onClearExtraFilters?.()
    setPage(1)
  }

  const hasActiveFilters =
    search !== '' ||
    (showStatusFilter && isActiveFilter !== '') ||
    (parentFilter !== undefined && parentId > 0) ||
    (selectFilter !== undefined && selectValue !== '') ||
    hasExtraFilters

  const createEnabled =
    createAccess.enabled && (!requireParentOptionsForCreate || parentOptions.length > 0)

  function defaultGatedExportPayload(): ExportTablePayload {
    return {
      title,
      headers: ['No', ...visibleColumns.map((column) => column.label)],
      rows: items.map((item, index) => [
        rowNumber(meta, index),
        ...visibleColumns.map((column) => column.exportValue(item)),
      ]),
    }
  }

  function defaultLegacyExportPayload(): ExportTablePayload {
    return {
      title,
      headers: showStatusColumn ? ['No', 'Nama', 'Status'] : ['No', 'Nama'],
      rows: items.map((item, index) => {
        const no = String(rowNumber(meta, index))
        const nama = itemLabel?.(item) ?? item.nama
        if (!showStatusColumn) return [no, nama]
        return [no, nama, item.is_active !== false ? 'Aktif' : 'Nonaktif']
      }),
    }
  }

  function renderColumnHeader(column: GatedColumn<T>) {
    const sortable = column.sortable !== false
    if (!sortable) {
      return <th key={column.key}>{column.label}</th>
    }
    return (
      <SortableTh
        key={column.key}
        label={column.label}
        column={column.sortKey ?? column.key}
        {...sortBind}
      />
    )
  }

  const showTable =
    !loading &&
    items.length > 0 &&
    (!useGatedColumns || visibleColumns.length > 0 || showActions)

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="page-header__actions">
            {enableExport && (
              <ExportPrintActions
                title={title}
                dokumenKey={dokumenKey}
                disabled={
                  loading ||
                  items.length === 0 ||
                  (useGatedColumns && visibleColumns.length === 0)
                }
                {...exportAccess}
                getPayload={() => {
                  if (getExportPayload) return getExportPayload(items, meta)
                  if (useGatedColumns) return defaultGatedExportPayload()
                  return defaultLegacyExportPayload()
                }}
              />
            )}
            {createAccess.visible && (
              <PermissionLink
                to={`${basePath}/new`}
                enabled={createEnabled}
                className="btn btn--primary"
              >
                {createLabel}
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
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={`Cari ${entityLabel}`}
          />
        </form>
        <div className="filter-bar__fields">
          {parentFilter && (
            <div className="field">
              <label htmlFor="filter_parent">{parentFilter.label}</label>
              <SearchableSelect
                id="filter_parent"
                value={parentId ? String(parentId) : ''}
                onChange={(next) => {
                  setParentId(Number(next) || 0)
                  setPage(1)
                }}
                placeholder={parentFilter.allLabel || 'Semua'}
                options={[
                  { value: '', label: parentFilter.allLabel || 'Semua' },
                  ...parentOptions.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>
          )}
          {selectFilter && (
            <div className="field">
              <label htmlFor="filter_select">{selectFilter.label}</label>
              <SearchableSelect
                id="filter_select"
                value={selectValue}
                onChange={(next) => {
                  setSelectValue(next)
                  setPage(1)
                }}
                placeholder={selectFilter.allLabel || 'Semua'}
                options={[
                  { value: '', label: selectFilter.allLabel || 'Semua' },
                  ...selectFilter.options,
                ]}
              />
            </div>
          )}
          {renderExtraFilters?.({ setPage })}
          {showStatusFilter && (
            <div className="field">
              <label htmlFor="filter_status">Status</label>
              <SearchableSelect
                id="filter_status"
                value={isActiveFilter}
                onChange={(next) => {
                  setIsActiveFilter(next as '' | '1' | '0')
                  setPage(1)
                }}
                placeholder="Semua"
                options={[
                  { value: '', label: 'Semua' },
                  { value: '1', label: 'Aktif' },
                  { value: '0', label: 'Nonaktif' },
                ]}
              />
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <div className="filter-bar__actions">
            <button type="button" className="btn btn--secondary" onClick={clearFilters}>
              Hapus filter
            </button>
          </div>
        )}
      </div>

      {loading && <div className="loading-state">Memuat {entityLabel}…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          {hasActiveFilters
            ? `Tidak ada ${entityLabel} yang cocok.`
            : `Belum ada data ${entityLabel}.`}
        </div>
      )}

      {!loading &&
        items.length > 0 &&
        useGatedColumns &&
        visibleColumns.length === 0 &&
        !showActions && (
          <div className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</div>
        )}

      {showTable && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  {useGatedColumns ? (
                    <>
                      {visibleColumns.map((column) => renderColumnHeader(column))}
                      {showActions && <th>{actionsHeaderLabel}</th>}
                    </>
                  ) : (
                    <>
                      {sortColumns?.leading
                        ? sortColumns.leading.map((col) => (
                            <SortableTh
                              key={col.key}
                              label={col.label}
                              column={col.key}
                              {...sortBind}
                            />
                          ))
                        : renderLeadingHeaders?.()}
                      {namaColumn ? (
                        <SortableTh
                          label={namaColumn.label}
                          column={namaColumn.key}
                          {...sortBind}
                        />
                      ) : (
                        <th>Nama</th>
                      )}
                      {sortColumns?.extra
                        ? sortColumns.extra.map((col) => (
                            <SortableTh
                              key={col.key}
                              label={col.label}
                              column={col.key}
                              {...sortBind}
                            />
                          ))
                        : null}
                      {renderExtraHeaders?.()}
                      {showStatusColumn &&
                        (statusColumn ? (
                          <SortableTh
                            label={statusColumn.label}
                            column={statusColumn.key}
                            {...sortBind}
                          />
                        ) : (
                          <th>Status</th>
                        ))}
                      <th>{actionsHeaderLabel}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
                    {useGatedColumns ? (
                      <>
                        {visibleColumns.map((column) => (
                          <td key={column.key}>{column.cell(item)}</td>
                        ))}
                        {showActions && (
                          <td>
                            <div className="data-table__actions">
                              {updateAccess.visible && (
                                <PermissionLink
                                  to={`${basePath}/${item.id}/edit`}
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
                                  disabled={
                                    !deleteAccess.enabled ||
                                    (canDeleteItem ? !canDeleteItem(item) : false)
                                  }
                                  onClick={() => void handleDelete(item)}
                                >
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </>
                    ) : (
                      <>
                        {renderLeadingCells?.(item)}
                        <td>{item.nama}</td>
                        {renderExtraCells?.(item)}
                        {showStatusColumn && (
                          <td>
                            <span
                              className={`badge ${item.is_active !== false ? 'badge--ok' : 'badge--muted'}`}
                            >
                              {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
                            </span>
                            {renderStatusExtra?.(item)}
                          </td>
                        )}
                        <td>
                          <div className="data-table__actions">
                            {updateAccess.visible && (
                              <PermissionLink
                                to={`${basePath}/${item.id}/edit`}
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
                                disabled={
                                  !deleteAccess.enabled ||
                                  (canDeleteItem ? !canDeleteItem(item) : false)
                                }
                                onClick={() => void handleDelete(item)}
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </>
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
