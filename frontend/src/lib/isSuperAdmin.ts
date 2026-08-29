/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

import type { User } from '../api/types'

export function isSuperAdminUser(user: User | null | undefined): boolean {
  if (!user) {
    return false
  }

  if (user.dapukan?.slug === 'superadmin') {
    return true
  }

  return user.dapukan_list?.some((item) => item.slug === 'superadmin') ?? false
}
