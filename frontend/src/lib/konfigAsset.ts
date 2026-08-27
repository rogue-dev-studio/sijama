/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:24:00
 */

import { API_BASE } from '../api/types'

const LEGACY_DEFAULT_PATHS = new Set(['/logo.svg', '/favicon.svg'])

export function resolveKonfigAssetUrl(path?: string | null): string | null {
  const value = path?.trim()
  if (!value || LEGACY_DEFAULT_PATHS.has(value)) {
    return null
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  if (value.startsWith('/storage/')) {
    return `${API_BASE}${value}`
  }

  return value
}

export type KonfigAssetKind = 'logo-header' | 'favicon' | 'logo-footer' | 'background'

export const KONFIG_ASSET_FIELD: Record<
  KonfigAssetKind,
  'path_logoheader' | 'path_favicon' | 'path_logofooter' | 'path_background'
> = {
  'logo-header': 'path_logoheader',
  favicon: 'path_favicon',
  'logo-footer': 'path_logofooter',
  background: 'path_background',
}

export function isStoredKonfigAsset(path?: string | null): boolean {
  return Boolean(path?.trim().startsWith('/storage/'))
}
