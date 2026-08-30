/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:35:00
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ConfirmTone = 'danger' | 'default'

export type ConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
}

type ConfirmRequest = ConfirmOptions & {
  resolve: (value: boolean) => void
}

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

function normalizeConfirmOptions(input: ConfirmOptions | string): ConfirmOptions {
  if (typeof input === 'string') {
    return {
      title: 'Konfirmasi hapus',
      message: input.trim(),
      confirmLabel: 'Ya, hapus',
      cancelLabel: 'Batal',
      tone: 'danger',
    }
  }

  const tone = input.tone ?? 'danger'
  return {
    title: input.title?.trim() || (tone === 'danger' ? 'Konfirmasi hapus' : 'Konfirmasi'),
    message: input.message.trim(),
    confirmLabel:
      input.confirmLabel?.trim() || (tone === 'danger' ? 'Ya, hapus' : 'Ya, lanjutkan'),
    cancelLabel: input.cancelLabel?.trim() || 'Batal',
    tone,
  }
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback((options: ConfirmOptions | string) => {
    const normalized = normalizeConfirmOptions(options)
    if (!normalized.message) return Promise.resolve(false)

    return new Promise<boolean>((resolve) => {
      setRequest({
        ...normalized,
        resolve,
      })
    })
  }, [])

  const close = useCallback((value: boolean) => {
    setRequest((current) => {
      current?.resolve(value)
      return null
    })
  }, [])

  useEffect(() => {
    if (!request) return

    const focusTarget = request.tone === 'danger' ? cancelRef.current : confirmRef.current
    focusTarget?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [request, close])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {request && (
        <div
          className="app-confirm"
          role="presentation"
          onMouseDown={() => close(false)}
        >
          <div
            className={`app-confirm__panel app-confirm__panel--${request.tone}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-confirm-title"
            aria-describedby="app-confirm-message"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="app-confirm-title" className="app-confirm__title">
              {request.title}
            </h2>
            <p id="app-confirm-message" className="app-confirm__message">
              {request.message}
            </p>
            <div className="app-confirm__actions">
              <button
                ref={cancelRef}
                type="button"
                className="btn btn--secondary"
                onClick={() => close(false)}
              >
                {request.cancelLabel}
              </button>
              <button
                ref={confirmRef}
                type="button"
                className={`btn ${request.tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
                onClick={() => close(true)}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider')
  }
  return ctx
}
