/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:58:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:30:00
 */
import { useEffect, useId, useRef, useState } from 'react'
import { useAppSettings } from '../auth/AppSettingsContext'
import { useAuth } from '../auth/AuthContext'
import { prepareExportPayload } from '../lib/exportPayload'
import {
  shareChannelLabel,
  shareExportFile,
  shouldPromptNativeFileShare,
  supportsNativeShare,
  visibleShareChannels,
  type ShareChannel,
} from '../lib/socialShare'
import { buildExportFile, type ExportMedia, type ExportTablePayload } from '../lib/tableExport'
import { ShareFilePrompt } from './ShareFilePrompt'
import { useToast } from './ToastProvider'

type ShareExportActionsProps = {
  title: string
  getPayload: () => ExportTablePayload
  dokumenKey?: string
  disabled?: boolean
  className?: string
  canPrint?: boolean
  canCsv?: boolean
  canExcel?: boolean
  showPrint?: boolean
  showCsv?: boolean
  showExcel?: boolean
}

const MEDIA_OPTIONS: Array<{ media: ExportMedia; label: string }> = [
  { media: 'pdf', label: 'PDF' },
  { media: 'excel', label: 'Excel' },
  { media: 'csv', label: 'CSV' },
]

type PendingShare = {
  file: File
  channel: ShareChannel
  title: string
  message: string
}

export function ShareExportActions({
  title,
  getPayload,
  dokumenKey,
  disabled = false,
  className = '',
  canPrint = true,
  canCsv = true,
  canExcel = true,
  showPrint = true,
  showCsv = true,
  showExcel = true,
}: ShareExportActionsProps) {
  const { settings, refreshSettings } = useAppSettings()
  const { user } = useAuth()
  const { notifySuccess, notifyError } = useToast()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pendingShare, setPendingShare] = useState<PendingShare | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const channels = visibleShareChannels(supportsNativeShare())

  const allowedMedia = MEDIA_OPTIONS.filter((option) => {
    if (option.media === 'pdf') return showPrint && canPrint
    if (option.media === 'excel') return showExcel && canExcel
    return showCsv && canCsv
  })

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

  if (allowedMedia.length === 0) {
    return null
  }

  async function runShare(media: ExportMedia, channel: ShareChannel) {
    if (busy) return
    setBusy(true)
    try {
      const { payload, filename } = await prepareExportPayload({
        media,
        getPayload,
        dokumenKey,
        settings,
        refreshSettings,
        user,
        fallbackTitle: title,
      })
      const file = await buildExportFile(media, filename, payload)
      const mediaLabel = media === 'pdf' ? 'PDF' : media === 'excel' ? 'Excel' : 'CSV'
      const shareTitle = payload.title || title
      const shareMessage = `Laporan ${shareTitle} (${mediaLabel})`

      if (shouldPromptNativeFileShare(channel)) {
        setPendingShare({ file, channel, title: shareTitle, message: shareMessage })
        setOpen(false)
        return
      }

      const outcome = await shareExportFile({
        channel,
        file,
        title: shareTitle,
        message: shareMessage,
      })

      if (outcome === 'opened') {
        notifySuccess(`Membuka ${shareChannelLabel(channel)}.`)
      }
      setOpen(false)
    } catch {
      notifyError('Gagal menyiapkan berkas untuk dibagikan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className={`share-social export-print ${className}`.trim()} ref={rootRef}>
        <button
          type="button"
          className="btn btn--secondary"
          disabled={disabled || busy}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {busy ? 'Menyiapkan…' : 'Bagikan'}
        </button>
        {open && (
          <div className="export-print__menu share-social__menu" id={menuId} role="menu">
            {allowedMedia.map((option) => (
              <div key={option.media} className="share-social__group" role="none">
                <p className="share-social__group-label" role="presentation">
                  {option.label}
                </p>
                {channels.map((channel) => (
                  <button
                    key={`${option.media}-${channel.id}`}
                    type="button"
                    role="menuitem"
                    className="share-social__item"
                    disabled={busy}
                    onClick={() => void runShare(option.media, channel.id)}
                  >
                    {channel.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      {pendingShare && (
        <ShareFilePrompt
          file={pendingShare.file}
          channel={pendingShare.channel}
          title={pendingShare.title}
          message={pendingShare.message}
          onClose={() => setPendingShare(null)}
          onShared={() => {
            notifySuccess(
              `Pilih ${shareChannelLabel(pendingShare.channel)} — file terlampir otomatis.`,
            )
            setPendingShare(null)
          }}
          onClipboardShare={() => {
            notifySuccess(
              `File disalin. Tempel di chat ${shareChannelLabel(pendingShare.channel)} (Ctrl+V).`,
            )
            setPendingShare(null)
          }}
          onShareFailed={() => {
            notifyError(
              'Lampiran otomatis tidak didukung browser ini. Gunakan Ekspor / Cetak lalu lampirkan manual.',
            )
          }}
        />
      )}
    </>
  )
}
