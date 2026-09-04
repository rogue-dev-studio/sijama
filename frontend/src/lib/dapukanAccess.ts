/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 17:40:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 17:40:00
 */

import type { User } from '../api/types'
import { isSuperAdminUser } from './isSuperAdmin'

const TINGKAT_ORDER: Record<string, number> = {
  global: 0,
  pusat: 1,
  daerah: 2,
  desa: 3,
  kelompok: 4,
}

function tingkatRank(tingkat?: string | null): number | null {
  if (!tingkat) return null
  return TINGKAT_ORDER[tingkat] ?? null
}

function primaryTingkat(user: User | null | undefined): string | null {
  if (!user) return null
  if (user.dapukan?.tingkat) return user.dapukan.tingkat
  const list = user.dapukan_list ?? []
  if (list.length === 0) return null
  return list.reduce((best, item) => {
    const rank = tingkatRank(item.tingkat)
    const bestRank = tingkatRank(best)
    if (rank === null) return best
    if (bestRank === null || rank < bestRank) return item.tingkat
    return best
  }, list[0].tingkat)
}

export function canManageDapukanByTingkat(
  actor: User | null | undefined,
  target?: { slug?: string; tingkat?: string } | null,
): boolean {
  if (!actor || !target) return false
  if (target.slug === 'superadmin') return isSuperAdminUser(actor)
  if (isSuperAdminUser(actor)) return true

  const actorRank = tingkatRank(primaryTingkat(actor))
  const targetRank = tingkatRank(target.tingkat)
  if (actorRank === null || targetRank === null) return false

  return targetRank >= actorRank
}

export function canManageUserAccount(
  actor: User | null | undefined,
  target?: User | { is_demo?: boolean; dapukan?: { slug?: string; tingkat?: string } | null; dapukan_list?: Array<{ slug?: string; tingkat?: string }> } | null,
): boolean {
  if (!actor || !target) return false
  if ((target as User)?.is_demo) return false
  if (isSuperAdminUser(target as User) && !isSuperAdminUser(actor)) return false
  if (isSuperAdminUser(actor)) return true

  const targetDapukan =
    (target as User).dapukan ??
    (target as User).dapukan_list?.reduce(
      (best, item) => {
        const rank = tingkatRank(item.tingkat)
        const bestRank = tingkatRank(best?.tingkat)
        if (rank === null) return best
        if (bestRank === null || rank < bestRank) return item
        return best
      },
      undefined as { slug?: string; tingkat?: string } | undefined,
    )

  return canManageDapukanByTingkat(actor, targetDapukan)
}

export function canDeactivateUserAccount(
  actor: User | null | undefined,
  target?: User | { is_demo?: boolean; dapukan?: { slug?: string; tingkat?: string } | null; dapukan_list?: Array<{ slug?: string; tingkat?: string }> } | null,
): boolean {
  if ((target as User)?.is_demo) {
    return false
  }

  return canManageUserAccount(actor, target as User)
}

export function canEditDapukanRecord(
  actor: User | null | undefined,
  target?: { is_system?: boolean; slug?: string; tingkat?: string } | null,
): boolean {
  if (!actor || !target) return false
  if (target.is_system) return false
  return canManageDapukanByTingkat(actor, target)
}
