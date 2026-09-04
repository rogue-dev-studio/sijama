/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 17:59:23
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 18:12:00
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export type ToastInput = {
  title: string
  message?: string
  /** Alias for message (legacy call sites). */
  detail?: string
  tone?: ToastTone
  durationMs?: number
}

export type ToastItem = {
  id: number
  title: string
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  pushToast: (input: ToastInput | string, tone?: ToastTone, durationMs?: number) => void
  notifySuccess: (message: string, title?: string) => void
  notifySaved: (entityLabel: string, mode?: 'create' | 'update') => void
  notifyDeleted: (entityLabel: string) => void
  notifyError: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION_MS = 3500

function normalizeInput(
  input: ToastInput | string,
  tone: ToastTone = 'success',
  durationMs = DEFAULT_DURATION_MS,
): Omit<ToastItem, 'id'> & { durationMs: number } {
  if (typeof input === 'string') {
    return {
      title: tone === 'error' ? 'Gagal' : tone === 'info' ? 'Info' : 'Berhasil',
      message: input.trim(),
      tone,
      durationMs,
    }
  }
  return {
    title: input.title.trim() || (input.tone === 'error' ? 'Gagal' : 'Berhasil'),
    message: (input.message ?? input.detail ?? '').trim(),
    tone: input.tone ?? tone,
    durationMs: input.durationMs ?? durationMs,
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<number, number>>(new Map())
  const seqRef = useRef(0)

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const pushToast = useCallback(
    (input: ToastInput | string, tone: ToastTone = 'success', durationMs = DEFAULT_DURATION_MS) => {
      const next = normalizeInput(input, tone, durationMs)
      if (!next.message) return
      seqRef.current += 1
      const id = seqRef.current
      setItems((prev) => [
        ...prev,
        { id, title: next.title, message: next.message, tone: next.tone },
      ])
      const timer = window.setTimeout(() => dismiss(id), next.durationMs)
      timersRef.current.set(id, timer)
    },
    [dismiss],
  )

  const notifySuccess = useCallback(
    (message: string, title = 'Berhasil') => {
      pushToast({ title, message, tone: 'success' })
    },
    [pushToast],
  )

  const notifySaved = useCallback(
    (entityLabel: string, mode: 'create' | 'update' = 'update') => {
      const label = entityLabel.trim() || 'data'
      const verb = mode === 'create' ? 'disimpan' : 'diperbarui'
      pushToast({
        title: 'Berhasil',
        message: `Data ${label} berhasil ${verb}.`,
        tone: 'success',
      })
    },
    [pushToast],
  )

  const notifyDeleted = useCallback(
    (entityLabel: string) => {
      const label = entityLabel.trim() || 'data'
      pushToast({
        title: 'Berhasil',
        message: `Data ${label} berhasil dihapus.`,
        tone: 'success',
      })
    },
    [pushToast],
  )

  const notifyError = useCallback(
    (message: string, title = 'Gagal') => {
      pushToast({ title, message, tone: 'error' })
    },
    [pushToast],
  )

  const value = useMemo(
    () => ({ pushToast, notifySuccess, notifySaved, notifyDeleted, notifyError }),
    [pushToast, notifySuccess, notifySaved, notifyDeleted, notifyError],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="app-toast-stack" aria-live="polite" aria-relevant="additions">
        {items.map((item) => (
          <div
            key={item.id}
            className={`app-toast app-toast--${item.tone}`}
            role={item.tone === 'error' ? 'alert' : 'status'}
          >
            <div className="app-toast__body">
              <div className="app-toast__title">{item.title}</div>
              <div className="app-toast__message">{item.message}</div>
            </div>
            <button
              type="button"
              className="app-toast__close"
              aria-label="Tutup notifikasi"
              onClick={() => dismiss(item.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
