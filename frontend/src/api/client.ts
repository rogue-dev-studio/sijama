/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

import { API_BASE, TOKEN_KEY, type ApiEnvelope } from './types'
import { getOrCreateDeviceId } from '../lib/trustedAdminDevice'

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]> | null

  constructor(status: number, message: string, errors: Record<string, string[]> | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
}

function readFromStorage(storage: Storage): string | null {
  try {
    return storage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function writeToStorage(storage: Storage, token: string): void {
  try {
    storage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore quota / private mode */
  }
}

function removeFromStorage(storage: Storage): void {
  try {
    storage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function getToken(): string | null {
  return readFromStorage(sessionStorage) ?? readFromStorage(localStorage)
}

export function setToken(token: string, persistent = true): void {
  if (persistent) {
    writeToStorage(localStorage, token)
    removeFromStorage(sessionStorage)
    return
  }

  writeToStorage(sessionStorage, token)
  removeFromStorage(localStorage)
}

export function clearToken(): void {
  removeFromStorage(sessionStorage)
  removeFromStorage(localStorage)
}

function storageRelativePath(path: string): string | null {
  const trimmed = path.trim().replace(/^\/+/, '')
  if (trimmed.startsWith('storage/')) {
    return trimmed.slice('storage/'.length)
  }
  if (trimmed.startsWith('users/')) {
    return trimmed
  }

  return null
}

export async function fetchAuthenticatedMediaBlob(storedPath: string): Promise<Blob | null> {
  const relative = storageRelativePath(storedPath)
  if (!relative?.startsWith('users/')) {
    return null
  }

  const headers = new Headers()
  headers.set('Accept', '*/*')
  applyDeviceHeaders(headers)

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${API_BASE}/api/media/${relative}`, { headers })
    if (!response.ok) {
      return null
    }

    return await response.blob()
  } catch {
    return null
  }
}

function applyDeviceHeaders(headers: Headers): void {
  const deviceId = getOrCreateDeviceId()
  if (deviceId && deviceId !== 'anonymous') {
    headers.set('X-Device-Key', deviceId)
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers: customHeaders, ...rest } = options

  const headers = new Headers(customHeaders)
  headers.set('Accept', 'application/json')
  applyDeviceHeaders(headers)

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE}/api${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload: ApiEnvelope<T>

  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError(response.status, 'Respons server tidak valid')
  }

  if (!payload.success) {
    throw new ApiError(response.status, payload.message || 'Permintaan gagal', payload.errors)
  }

  return payload.data
}

export async function apiUploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  applyDeviceHeaders(headers)

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  let payload: ApiEnvelope<T>

  try {
    payload = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError(response.status, 'Respons server tidak valid')
  }

  if (!payload.success) {
    throw new ApiError(response.status, payload.message || 'Permintaan gagal', payload.errors)
  }

  return payload.data
}
