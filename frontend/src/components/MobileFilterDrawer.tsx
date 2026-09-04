/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:28:00
 */

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MenuIcon } from './MenuIcon'

type MobileFilterDrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  doneLabel?: string
  children: ReactNode
}

export function MobileFilterDrawer({
  open,
  onClose,
  title = 'Filter',
  doneLabel = 'Selesai',
  children,
}: MobileFilterDrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    const closeButton = panelRef.current?.querySelector<HTMLButtonElement>('[data-filter-drawer-close]')
    closeButton?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="filter-drawer" role="presentation">
      <button
        type="button"
        className="filter-drawer__backdrop"
        aria-label="Tutup filter"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="filter-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="filter-drawer__head">
          <h2 id={titleId} className="filter-drawer__title">
            {title}
          </h2>
          <button
            type="button"
            className="filter-drawer__close"
            data-filter-drawer-close
            aria-label="Tutup"
            onClick={onClose}
          >
            <MenuIcon name="x" size={18} />
          </button>
        </div>
        <div className="filter-drawer__body">{children}</div>
        <div className="filter-drawer__foot">
          <button type="button" className="btn btn--primary filter-drawer__done" onClick={onClose}>
            {doneLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
