/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:24:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 15:05:00
 */

import { API_BASE } from '../api/types'

const LEGACY_DEFAULT_PATHS = new Set(['/logo.svg', '/favicon.svg'])

const STORAGE_PREFIXES = ['konfig/', 'jamaah/', 'users/', 'share/', 'app-feedback/', 'app-reports/']

export function isProtectedStoragePath(path?: string | null): boolean {
  const value = path?.trim()
  if (!value) {
    return false
  }

  const relative = value.startsWith('/storage/')
    ? value.slice('/storage/'.length)
    : value.replace(/^\/+/, '')

  return relative.startsWith('users/')
}

function normalizeStoragePath(path: string): string {
  const trimmed = path.replace(/^\/+/, '')
  if (trimmed.startsWith('storage/')) {
    return `/${trimmed}`
  }

  return `/storage/${trimmed}`
}

function extractStorageRelativePath(value: string): string | null {
  const pubMatch = value.match(/^https?:\/\/pub-[a-z0-9]+\.r2\.dev\/(.+)$/i)
  if (pubMatch?.[1]) {
    return pubMatch[1]
  }

  const r2ApiMatch = value.match(/^https?:\/\/[^/]+\.r2\.cloudflarestorage\.com\/(?:[^/]+\/)?(.+)$/i)
  if (r2ApiMatch?.[1]) {
    return r2ApiMatch[1]
  }

  try {
    const parsed = new URL(value)
    const path = parsed.pathname.replace(/^\/+/, '')
    for (const prefix of STORAGE_PREFIXES) {
      if (path.startsWith(prefix)) {
        return path
      }
    }

    if (path.startsWith('storage/')) {
      return path.slice('storage/'.length)
    }
  } catch {
    return null
  }

  return null
}

/**
 * Browser: same-origin `/storage/...` (Vite/nginx/Render proxy ke API).
 * SSR/build: full URL ke API_BASE.
 */
function buildStorageUrl(relativePath: string): string {
  const normalized = normalizeStoragePath(relativePath)

  if (typeof window !== 'undefined') {
    return normalized
  }

  return `${API_BASE}${normalized}`
}

/**
 * Resolve path aset konfig ke URL yang bisa dimuat browser.
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
    const relative = extractStorageRelativePath(value)
    if (relative) {
      return buildStorageUrl(relative)
    }

    return value
  }

  if (value.startsWith('/storage/')) {
    return buildStorageUrl(value.slice('/storage/'.length))
  }

  return value
}

export async function fetchAssetAsDataUrl(pathOrUrl?: string | null): Promise<string | null> {
  const url = resolveKonfigAssetUrl(pathOrUrl)
  if (!url) return null
  if (url.startsWith('data:')) return url

  try {
    const sameOrigin =
      typeof window !== 'undefined' &&
      (url.startsWith('/') || url.startsWith(window.location.origin))
    const response = await fetch(url, {
      credentials: sameOrigin ? 'same-origin' : 'omit',
      mode: sameOrigin ? 'same-origin' : 'cors',
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
