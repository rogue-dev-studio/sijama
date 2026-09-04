/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 21:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 21:00:00
 */

import type { LookupOption } from '../api/types'

export function hariMingguLabel(dayOfWeek: number | null | undefined, options: LookupOption[]): string {
  if (!dayOfWeek) return '—'
  const match = options.find((item) => item.value === String(dayOfWeek))
  return match?.name ?? '—'
}

export function hariMingguSelectOptions(options: LookupOption[]) {
  return options.map((item) => ({
    value: item.value ?? '',
    label: item.name,
  }))
}
