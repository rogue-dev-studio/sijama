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
 * Path `/storage/...` memakai same-origin (Vite/Nginx proxy) agar preview & cetak andal.
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
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${value}`
    }
    return `${API_BASE}${value}`
  }

  return value
}

export async function fetchAssetAsDataUrl(pathOrUrl?: string | null): Promise<string | null> {
  const url = resolveKonfigAssetUrl(pathOrUrl)
  if (!url) return null
  if (url.startsWith('data:')) return url

  try {
    const response = await fetch(url)
    if (!response.ok) return url
    const blob = await response.blob()
    if (!blob.type.startsWith('image/') && !blob.type.includes('svg')) {
      return url
    }
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return url
  }
}

export type KonfigAssetKind = 'logo-header' | 'favicon' | 'logo-footer' | 'background' | 'maintenance-background'
export type KonfigDokumenAssetKind = 'logo-kiri' | 'logo-kanan'
export type ImageUploadAssetKind = KonfigAssetKind | KonfigDokumenAssetKind

export const KONFIG_ASSET_FIELD: Record<
  KonfigAssetKind,
  'path_logoheader' | 'path_favicon' | 'path_logofooter' | 'path_background'
> = {
  'logo-header': 'path_logoheader',
  favicon: 'path_favicon',
  'logo-footer': 'path_logofooter',
  background: 'path_background',
  'maintenance-background': 'path_maintenance_background',
}

export function isStoredKonfigAsset(path?: string | null): boolean {
  return Boolean(path?.trim().startsWith('/storage/'))
}
