/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:28:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:00:00
 */
import { useEffect, useId, useRef, useState } from 'react'
import { useAppSettings } from '../auth/AppSettingsContext'
import { useAuth } from '../auth/AuthContext'
import { prepareExportPayload } from '../lib/exportPayload'
import {
  downloadCsv,
  downloadExcel,
  printTable,
  type ExportTablePayload,
} from '../lib/tableExport'
import { ShareExportActions } from './ShareExportActions'

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
  /** Tampilkan tombol bagikan media sosial. Default true. */
  showShare?: boolean
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
  showShare = true,
}: ExportPrintActionsProps) {
  const { settings, refreshSettings } = useAppSettings()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
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

  if (!hasAnyVisible && !showShare) {
    return null
  }

  async function run(action: 'print' | 'csv' | 'excel') {
    if (busy) return
    setBusy(true)
    try {
      const media = action === 'print' ? 'pdf' : action === 'excel' ? 'excel' : 'csv'
      const { payload, filename } = await prepareExportPayload({
        media,
        getPayload,
        dokumenKey,
        settings,
        refreshSettings,
        user,
        fallbackTitle: title,
      })
      if (action === 'print') await printTable(payload)
      if (action === 'csv') downloadCsv(filename, payload)
      if (action === 'excel') await downloadExcel(filename, payload)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`page-header__export-group ${className}`.trim()}>
      {hasAnyVisible && (
        <div className="export-print" ref={rootRef}>
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
      )}
      {showShare && (
        <ShareExportActions
          title={title}
          getPayload={getPayload}
          dokumenKey={dokumenKey}
          disabled={disabled || busy}
          canPrint={canPrint}
          canCsv={canCsv}
          canExcel={canExcel}
          showPrint={showPrint}
          showCsv={showCsv}
          showExcel={showExcel}
        />
      )}
    </div>
  )
}
