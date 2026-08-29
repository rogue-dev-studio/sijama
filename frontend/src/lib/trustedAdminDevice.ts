/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

const TRUSTED_ADMIN_DEVICE_KEY = 'sijama_trusted_admin_device'
const DEVICE_ID_KEY = 'sijama_device_id'

type TrustedAdminDeviceRecord = {
  marked_at: string
  username?: string
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)?.trim()
    if (existing) return existing

    const next =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    localStorage.setItem(DEVICE_ID_KEY, next)
    return next
  } catch {
    return 'anonymous'
  }
}

export function hasTrustedAdminDevice(): boolean {
  const record = readJson<TrustedAdminDeviceRecord>(TRUSTED_ADMIN_DEVICE_KEY)
  return Boolean(record?.marked_at)
}

export function markTrustedAdminDevice(username?: string | null): void {
  try {
    getOrCreateDeviceId()
    const payload: TrustedAdminDeviceRecord = {
      marked_at: new Date().toISOString(),
      username: username?.trim() || undefined,
    }
    localStorage.setItem(TRUSTED_ADMIN_DEVICE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore private mode / quota */
  }
}
