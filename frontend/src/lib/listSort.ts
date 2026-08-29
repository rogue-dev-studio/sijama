/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:46:50
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:46:50
 */

export type SortDir = 'asc' | 'desc'

export type ListSortState = {
  sortBy: string
  sortDir: SortDir
}

export type ListSortParams = {
  sort_by?: string
  sort_dir?: SortDir
}

export function toggleSort(current: ListSortState, nextKey: string): ListSortState {
  if (current.sortBy === nextKey) {
    return {
      sortBy: nextKey,
      sortDir: current.sortDir === 'asc' ? 'desc' : 'asc',
    }
  }
  return { sortBy: nextKey, sortDir: 'asc' }
}

export function toSortParams(state: ListSortState): ListSortParams {
  return {
    sort_by: state.sortBy,
    sort_dir: state.sortDir,
  }
}
