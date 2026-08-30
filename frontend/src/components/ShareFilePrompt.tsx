/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:30:00
 */
import { useEffect, useRef, useState } from 'react'
import {
  shareChannelLabel,
  shareFileViaClipboard,
  shareNativeFile,
  supportsNativeFileShare,
  type ShareChannel,
} from '../lib/socialShare'

type ShareFilePromptProps = {
  file: File
  channel: ShareChannel
  title: string
  message: string
  onClose: () => void
  onShared: () => void
  onClipboardShare: () => void
  onShareFailed: () => void
}

export function ShareFilePrompt({
  file,
  channel,
  title,
  message,
  onClose,
  onShared,
  onClipboardShare,
  onShareFailed,
}: ShareFilePromptProps) {
  const primaryRef = useRef<HTMLButtonElement>(null)
  const [busy, setBusy] = useState(false)
  const channelLabel = shareChannelLabel(channel)
  const nativeFileSupported = supportsNativeFileShare(file)

  useEffect(() => {
    primaryRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleNativeShare() {
    if (busy) return
    setBusy(true)
    try {
      const result = await shareNativeFile(file, title, message)
      if (result === 'shared') {
        onShared()
        return
      }
      if (result === 'cancelled') {
        onClose()
        return
      }
      const pasted = await shareFileViaClipboard({ channel, file })
      if (pasted) {
        onClipboardShare()
        return
      }
      onShareFailed()
    } finally {
      setBusy(false)
    }
  }

  async function handleClipboardShare() {
    if (busy) return
    setBusy(true)
    try {
      const pasted = await shareFileViaClipboard({ channel, file })
      if (pasted) {
        onClipboardShare()
        return
      }
      onShareFailed()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="share-file-prompt" role="presentation" onMouseDown={onClose}>
      <div
        className="share-file-prompt__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-file-prompt-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="share-file-prompt-title">Lampirkan berkas ke {channelLabel}</h2>
        <p>
          {nativeFileSupported ? (
            <>
              Ketuk <strong>Bagikan file</strong>, lalu pilih <strong>{channelLabel}</strong> di menu
              perangkat. File PDF/Excel/CSV terlampir otomatis.
            </>
          ) : (
            <>
              Browser ini tidak mendukung lampiran langsung. Gunakan <strong>Salin &amp; tempel</strong>:
              file disalin, {channelLabel} terbuka, lalu tempel sekali (<kbd>Ctrl</kbd>+<kbd>V</kbd>) di
              chat.
            </>
          )}
        </p>
        <div className="share-file-prompt__actions">
          <button
            ref={primaryRef}
            type="button"
            className="btn btn--primary"
            disabled={busy}
            onClick={() => void handleNativeShare()}
          >
            {busy ? 'Membuka…' : `Bagikan file ke ${channelLabel}`}
          </button>
          {!nativeFileSupported && (
            <button
              type="button"
              className="btn btn--secondary"
              disabled={busy}
              onClick={() => void handleClipboardShare()}
            >
              Salin file &amp; buka {channelLabel}
            </button>
          )}
          <button type="button" className="btn btn--secondary" disabled={busy} onClick={onClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
