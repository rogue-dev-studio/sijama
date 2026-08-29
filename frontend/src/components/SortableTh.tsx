/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:46:50
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:46:50
 */

import type { ListSortState, SortDir } from '../lib/listSort'

type SortableThProps = {
  label: string
  column: string
  sortBy: string
  sortDir: SortDir
  onSort: (column: string) => void
  className?: string
}

export function SortableTh({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  className = '',
}: SortableThProps) {
  const active = sortBy === column
  const ariaSort = active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'

  return (
    <th scope="col" className={`sortable-th ${className}`.trim()} aria-sort={ariaSort}>
      <button
        type="button"
        className={`sortable-th__btn${active ? ' is-active' : ''}`}
        onClick={() => onSort(column)}
      >
        <span>{label}</span>
        <span className="sortable-th__icon" aria-hidden="true">
          {active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  )
}

export function bindSortableTh(
  state: ListSortState,
  onSort: (column: string) => void,
): Pick<SortableThProps, 'sortBy' | 'sortDir' | 'onSort'> {
  return {
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    onSort,
  }
}
