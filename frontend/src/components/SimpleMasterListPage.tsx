/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 16:57:14
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import type { Paginated, PaginationMeta } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Pagination, rowNumber } from './Pagination'
import { SearchableSelect } from './SearchableSelect'
import { DEFAULT_PER_PAGE, DEFAULT_PAGINATION_META } from '../lib/pagination'

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
  requireParentOptionsForCreate?: boolean
  canDeleteItem?: (item: T) => boolean
  renderLeadingHeaders?: () => ReactNode
  renderLeadingCells?: (item: T) => ReactNode
  renderExtraHeaders?: () => ReactNode
  renderExtraCells?: (item: T) => ReactNode
  renderStatusExtra?: (item: T) => ReactNode
  itemLabel?: (item: T) => string
  actionsHeaderLabel?: string
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
  requireParentOptionsForCreate = false,
  canDeleteItem,
  renderLeadingHeaders,
  renderLeadingCells,
  renderExtraHeaders,
  renderExtraCells,
  renderStatusExtra,
  itemLabel,
  actionsHeaderLabel = 'Aksi',
}: SimpleMasterListPageProps<T>) {
  const { can } = useAuth()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      }
      if (parentFilter && parentId > 0) {
        params[parentFilter.paramKey] = parentId
      }
      if (selectFilter && selectValue) {
        params[selectFilter.paramKey] = selectValue
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
    list,
    entityLabel,
    showStatusFilter,
    parentFilter,
    parentId,
    selectFilter,
    selectValue,
  ])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(item: T) {
    const label = itemLabel?.(item) ?? item.nama
    if (!window.confirm(`Hapus ${entityLabel} "${label}"?`)) return
    setError(null)
    try {
      await remove(item.id)
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
    setPage(1)
  }

  const hasActiveFilters =
    search !== '' ||
    (showStatusFilter && isActiveFilter !== '') ||
    (parentFilter !== undefined && parentId > 0) ||
    (selectFilter !== undefined && selectValue !== '')

  const canCreate =
    can(`${permissionPrefix}.create`) &&
    (!requireParentOptionsForCreate || parentOptions.length > 0)

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {canCreate && (
            <Link to={`${basePath}/new`} className="btn btn--primary">
              {createLabel}
            </Link>
          )}
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
          <button type="button" className="btn btn--secondary btn--small" onClick={clearFilters}>
            Hapus filter
          </button>
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

      {!loading && items.length > 0 && (
        <>
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  {renderLeadingHeaders?.()}
                  <th>Nama</th>
                  {renderExtraHeaders?.()}
                  {showStatusColumn && <th>Status</th>}
                  <th>{actionsHeaderLabel}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="col-no">{rowNumber(meta, index)}</td>
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
                        {can(`${permissionPrefix}.update`) && (
                          <Link
                            to={`${basePath}/${item.id}/edit`}
                            className="btn btn--secondary btn--small"
                          >
                            Edit
                          </Link>
                        )}
                        {can(`${permissionPrefix}.delete`) &&
                          (canDeleteItem ? canDeleteItem(item) : true) && (
                          <button
                            type="button"
                            className="btn btn--danger btn--small"
                            onClick={() => void handleDelete(item)}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
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
