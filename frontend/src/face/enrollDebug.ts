/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 18:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 19:00:00
 */
import { apiRequest } from '../api/client'

export type FaceEnrollDebugEntry = {
  t: string
  event: string
  jamaah_id?: number
  data?: Record<string, unknown>
}

const LOCAL_KEY = 'sijama.faceEnrollDebug'
const MAX_LOCAL = 400

let queue: FaceEnrollDebugEntry[] = []
let flushTimer: number | null = null
let snapshot: Record<string, unknown> = {}
let flushError: string | null = null

function loadLocal(): FaceEnrollDebugEntry[] {
  try {
    const raw = sessionStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FaceEnrollDebugEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveLocal(entries: FaceEnrollDebugEntry[]) {
  try {
    sessionStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(-MAX_LOCAL)))
  } catch {
    // ignore quota
  }
}

async function flushQueue() {
  if (queue.length === 0) return
  const batch = queue.splice(0, queue.length)
  const merged = [...loadLocal(), ...batch].slice(-MAX_LOCAL)
  saveLocal(merged)

  try {
    await apiRequest<{ written: number }>('/debug/face-enroll', {
      method: 'POST',
      body: { entries: batch },
    })
    flushError = null
  } catch (err) {
    flushError = err instanceof Error ? err.message : 'flush failed'
    queue.unshift(...batch)
  }
}

export function getFaceEnrollDebugFlushError() {
  return flushError
}

export function setFaceEnrollDebugSnapshot(partial: Record<string, unknown>) {
  snapshot = { ...snapshot, ...partial }
}

export function getFaceEnrollDebugSnapshot() {
  return snapshot
}

export function getFaceEnrollDebugLocal(): FaceEnrollDebugEntry[] {
  return loadLocal()
}

export function faceEnrollDebug(
  event: string,
  data?: Record<string, unknown>,
  jamaahId?: number,
) {
  const entry: FaceEnrollDebugEntry = {
    t: new Date().toISOString(),
    event,
    jamaah_id: jamaahId,
    data: data ? { ...snapshot, ...data } : { ...snapshot },
  }
  queue.push(entry)
  const merged = [...loadLocal(), entry].slice(-MAX_LOCAL)
  saveLocal(merged)

  if (typeof window !== 'undefined') {
    ;(window as unknown as { __SIJAMA_FACE_ENROLL_DEBUG__?: FaceEnrollDebugEntry[] }).__SIJAMA_FACE_ENROLL_DEBUG__ =
      merged
  }

  if (flushTimer !== null) window.clearTimeout(flushTimer)
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    void flushQueue()
  }, 300)
}

export async function clearFaceEnrollDebug(jamaahId?: number) {
  queue = []
  saveLocal([])
  snapshot = {}
  flushError = null
  try {
    await apiRequest('/debug/face-enroll', {
      method: 'POST',
      body: {
        clear: true,
        entries: [{ t: new Date().toISOString(), event: 'session_start', jamaah_id: jamaahId }],
      },
    })
  } catch (err) {
    flushError = err instanceof Error ? err.message : 'clear failed'
  }
}

export async function flushFaceEnrollDebugNow() {
  if (flushTimer !== null) {
    window.clearTimeout(flushTimer)
    flushTimer = null
  }
  await flushQueue()
}
