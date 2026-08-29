/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:28:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:55:00
 */
import { useEffect, useId, useRef, useState } from 'react'
import { useAppSettings } from '../auth/AppSettingsContext'
import type { AppDokumenSettings } from '../api/types'
import {
  downloadCsv,
  downloadExcel,
  printTable,
  slugFilename,
  type ExportDokumenBrand,
  type ExportTablePayload,
} from '../lib/tableExport'
import {
  layoutUsesLogos,
  normalizeDokumenLayout,
  resolveLayoutLogos,
} from '../lib/dokumenLayout'

type ExportPrintActionsProps = {
  title: string
  /** Data yang akan diekspor / dicetak (biasanya baris yang tampil di tabel). */
  getPayload: () => ExportTablePayload
  /** Kunci cetakan = lookup_value dari tipe konfig_dokumen. */
  dokumenKey?: string
  disabled?: boolean
  className?: string
  /** Izin cetak/PDF. Default true (halaman tanpa gate matriks). */
  canPrint?: boolean
  /** Izin unduh CSV. Default true. */
  canCsv?: boolean
  /** Izin unduh Excel. Default true. */
  canExcel?: boolean
  /** Tampilkan item Cetak. Default true. */
  showPrint?: boolean
  /** Tampilkan item CSV. Default true. */
  showCsv?: boolean
  /** Tampilkan item Excel. Default true. */
  showExcel?: boolean
}

function brandForMedia(
  dokumen: AppDokumenSettings | undefined,
  media: 'pdf' | 'excel' | 'csv',
): ExportDokumenBrand | null {
  if (!dokumen) return null
  const enabled =
    media === 'pdf' ? dokumen.apply_pdf : media === 'excel' ? dokumen.apply_excel : dokumen.apply_csv
  if (!enabled) return null

  const layout_mode = normalizeDokumenLayout(dokumen.layout_mode)
  const logos = resolveLayoutLogos(layout_mode, dokumen.path_logo_kiri, dokumen.path_logo_kanan)

  return {
    header: dokumen.header,
    header_detail: dokumen.header_detail,
    footer: dokumen.footer,
    footer_detail: dokumen.footer_detail,
    path_logo_kiri: layoutUsesLogos(layout_mode) ? logos.left : null,
    path_logo_kanan: layoutUsesLogos(layout_mode) ? logos.right : null,
    layout_mode,
    header_style: dokumen.header_style,
  }
}

export function ExportPrintActions({
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
}: ExportPrintActionsProps) {
  const { settings, refreshSettings } = useAppSettings()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const dokumenSettings = dokumenKey ? settings.dokumen?.items?.[dokumenKey] : undefined
  const hasAnyVisible = showPrint || showCsv || showExcel

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

  if (!hasAnyVisible) {
    return null
  }

  async function run(action: 'print' | 'csv' | 'excel') {
    if (busy) return
    setBusy(true)
    try {
      let dokumen = dokumenSettings
      try {
        const fresh = await refreshSettings()
        dokumen = dokumenKey ? fresh.dokumen?.items?.[dokumenKey] : undefined
      } catch {
        // pakai settings yang sudah ada di memori
      }

      const base = getPayload()
      const media = action === 'print' ? 'pdf' : action === 'excel' ? 'excel' : 'csv'
      const payload: ExportTablePayload = {
        ...base,
        dokumen: brandForMedia(dokumen, media),
      }
      const filename = slugFilename(payload.title || title)
      if (action === 'print') await printTable(payload)
      if (action === 'csv') downloadCsv(filename, payload)
      if (action === 'excel') downloadExcel(filename, payload)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`export-print ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={disabled || busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {busy ? 'Menyiapkan…' : 'Ekspor / Cetak'}
      </button>
      {open && (
        <div className="export-print__menu" id={menuId} role="menu">
          {showPrint && (
            <button
              type="button"
              role="menuitem"
              disabled={!canPrint || busy}
              onClick={() => void run('print')}
            >
              Cetak / PDF
            </button>
          )}
          {showCsv && (
            <button
              type="button"
              role="menuitem"
              disabled={!canCsv || busy}
              onClick={() => void run('csv')}
            >
              Unduh CSV
            </button>
          )}
          {showExcel && (
            <button
              type="button"
              role="menuitem"
              disabled={!canExcel || busy}
              onClick={() => void run('excel')}
            >
              Unduh Excel (.xlsx)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
