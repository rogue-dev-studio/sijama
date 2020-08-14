/**
 * @Author: rogue-dev-studio
 * @Date:   2026-08-01 16:51:00
 * @Last Modified by:   rogue-dev-studio
 * @Last Modified time: 2026-08-01 16:51:00
 */

import type { PaginationMeta } from '../api/types'

export const DEFAULT_PER_PAGE = 10

export const PER_PAGE_OPTIONS = [5, 10, 25, 50] as const

export const DEFAULT_PAGINATION_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: DEFAULT_PER_PAGE,
  total: 0,
}
