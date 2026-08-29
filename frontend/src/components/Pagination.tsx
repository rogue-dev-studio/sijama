import type { PaginationMeta } from '../api/types'
import { PER_PAGE_OPTIONS } from '../lib/pagination'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  onPerPageChange?: (perPage: number) => void
  perPageOptions?: number[]
  /** Tampilkan bar pagination meskipun total = 0 (default: sembunyikan). */
  showWhenEmpty?: boolean
}

function buildPageItems(current: number, last: number): Array<number | 'ellipsis'> {
  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, last, current, current - 1, current + 1, 2, last - 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= last).sort((a, b) => a - b)
  const items: Array<number | 'ellipsis'> = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push('ellipsis')
    }
    items.push(page)
  })

  return items
}

export function rowNumber(meta: PaginationMeta, index: number): number {
  return (meta.current_page - 1) * meta.per_page + index + 1
}

export function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
  perPageOptions = [...PER_PAGE_OPTIONS],
  showWhenEmpty = false,
}: PaginationProps) {
  if (meta.total === 0 && !showWhenEmpty) {
    return null
  }

  const from = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)
  const pageItems = buildPageItems(meta.current_page, Math.max(1, meta.last_page))

  return (
    <div className="pagination">
      <p className="pagination__info">
        {meta.total === 0
          ? 'Menampilkan 0 dari 0'
          : `Menampilkan ${from}–${to} dari ${meta.total}`}
      </p>
      <div className="pagination__controls">
        {onPerPageChange && (
          <label className="pagination__per-page">
            Per halaman
            <select
              value={meta.per_page}
              onChange={(event) => onPerPageChange(Number(event.target.value))}
              aria-label="Jumlah per halaman"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="button"
          className="btn btn--secondary btn--small"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>
        <div className="pagination__numbers" role="navigation" aria-label="Nomor halaman">
          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`e-${index}`} className="pagination__ellipsis">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`pagination__num${item === meta.current_page ? ' pagination__num--active' : ''}`}
                aria-current={item === meta.current_page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          className="btn btn--secondary btn--small"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      </div>
    </div>
  )
}
