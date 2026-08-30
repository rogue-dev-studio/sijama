/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 16:58:00
 */
import { useEffect, useId, useRef, useState } from 'react'
import {
  shareLink,
  supportsNativeShare,
  visibleShareChannels,
  type ShareChannel,
} from '../lib/socialShare'

type ShareSocialActionsProps = {
  title: string
  url: string
  body?: string
  disabled?: boolean
  className?: string
  buttonLabel?: string
  size?: 'default' | 'small'
}

export function ShareSocialActions({
  title,
  url,
  body,
  disabled = false,
  className = '',
  buttonLabel = 'Bagikan',
  size = 'default',
}: ShareSocialActionsProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const channels = visibleShareChannels(supportsNativeShare())
  const sizeClass = size === 'small' ? ' btn--small' : ''

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!url.trim()) {
    return null
  }

  async function runShare(channel: ShareChannel) {
    if (busy) return
    setBusy(true)
    try {
      await shareLink({
        channel,
        title,
        url,
        body,
      })
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`share-social export-print ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className={`btn btn--secondary${sizeClass}`.trim()}
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {busy ? 'Membuka…' : buttonLabel}
      </button>
      {open && (
        <div className="export-print__menu share-social__menu share-social__menu--compact" id={menuId} role="menu">
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              role="menuitem"
              className="share-social__item"
              disabled={busy}
              onClick={() => void runShare(channel.id)}
            >
              {channel.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
