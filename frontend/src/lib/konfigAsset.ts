/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 18:10:00
 */

import { API_BASE } from '../api/types'

const LEGACY_DEFAULT_PATHS = new Set(['/logo.svg', '/favicon.svg'])

/**
 * Resolve path aset konfig ke URL yang bisa dimuat browser.
 * Path `/storage/...` dilayani backend API (Vite/Nginx proxy hanya di dev/Docker lokal).
 */
export function resolveKonfigAssetUrl(path?: string | null): string | null {
  const value = path?.trim()
  if (!value || LEGACY_DEFAULT_PATHS.has(value)) {
    return null
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value
  }

  if (value.startsWith('/storage/')) {
    const apiUrl = `${API_BASE}${value}`

    if (typeof window === 'undefined') {
      return apiUrl
    }

    try {
      const apiOrigin = new URL(API_BASE).origin
      if (apiOrigin === window.location.origin) {
        return value
      }
    } catch {
      return apiUrl
    }

    return apiUrl
  }

  return value
}

export async function fetchAssetAsDataUrl(pathOrUrl?: string | null): Promise<string | null> {
  const url = resolveKonfigAssetUrl(pathOrUrl)
  if (!url) return null
  if (url.startsWith('data:')) return url

  try {
    const sameOrigin =
      typeof window !== 'undefined' && url.startsWith(window.location.origin)
    const response = await fetch(url, {
      credentials: sameOrigin ? 'same-origin' : 'omit',
      mode: 'cors',
    })
    if (!response.ok) return null
    const blob = await response.blob()
    if (!blob.type.startsWith('image/') && !blob.type.includes('svg')) {
      return null
    }
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export type KonfigAssetKind = 'logo-header' | 'favicon' | 'logo-footer' | 'background' | 'maintenance-background'
export type KonfigDokumenAssetKind = 'logo-kiri' | 'logo-kanan'
export type ImageUploadAssetKind = KonfigAssetKind | KonfigDokumenAssetKind

export type KonfigAssetField =
  | 'path_logoheader'
  | 'path_favicon'
  | 'path_logofooter'
  | 'path_background'
  | 'path_maintenance_background'

export const KONFIG_ASSET_FIELD: Record<KonfigAssetKind, KonfigAssetField> = {
  'logo-header': 'path_logoheader',
  favicon: 'path_favicon',
  'logo-footer': 'path_logofooter',
  background: 'path_background',
  'maintenance-background': 'path_maintenance_background',
}

export function isStoredKonfigAsset(path?: string | null): boolean {
  return Boolean(path?.trim().startsWith('/storage/'))
}
