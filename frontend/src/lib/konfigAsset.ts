/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 14:25:00
 */

import { API_BASE } from '../api/types'

const LEGACY_DEFAULT_PATHS = new Set(['/logo.svg', '/favicon.svg'])

const STORAGE_PREFIXES = ['konfig/', 'jamaah/', 'users/', 'share/']

function rewriteExternalStorageUrl(value: string): string | null {
  const pubMatch = value.match(/^https?:\/\/pub-[a-z0-9]+\.r2\.dev\/(.+)$/i)
  if (pubMatch?.[1]) {
    return `${API_BASE}/storage/${pubMatch[1]}`
  }

  const r2ApiMatch = value.match(/^https?:\/\/[^/]+\.r2\.cloudflarestorage\.com\/(?:[^/]+\/)?(.+)$/i)
  if (r2ApiMatch?.[1]) {
    return `${API_BASE}/storage/${r2ApiMatch[1]}`
  }

  try {
    const parsed = new URL(value)
    const path = parsed.pathname.replace(/^\/+/, '')
    for (const prefix of STORAGE_PREFIXES) {
      if (path.startsWith(prefix)) {
        return `${API_BASE}/storage/${path}`
      }
    }
  } catch {
    return null
  }

  return null
}

function buildStorageUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/storage/${path.replace(/^\/+/, '')}`

  if (typeof window === 'undefined') {
    return `${API_BASE}${normalized}`
  }

  try {
    const apiOrigin = new URL(API_BASE).origin
    if (apiOrigin === window.location.origin) {
      return normalized
    }
  } catch {
    return `${API_BASE}${normalized}`
  }

  return `${API_BASE}${normalized}`
}

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
    const rewritten = rewriteExternalStorageUrl(value)
    if (rewritten) {
      return rewritten
    }

    return value
  }

  if (value.startsWith('/storage/')) {
    return buildStorageUrl(value)
  }

  return value
}

export async function fetchAssetAsDataUrl(pathOrUrl?: string | null): Promise<string | null> {
  const url = resolveKonfigAssetUrl(pathOrUrl)
  if (!url) return null
  if (url.startsWith('data:')) return url

  try {
    const response = await fetch(url, {
      credentials: 'omit',
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
