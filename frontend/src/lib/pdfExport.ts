/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 16:55:00
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ExportTablePayload } from './tableExport'
import { brandLinesForExport, cellTextForExport } from './tableExport'
import { formatPrintDateMeta } from './dokumenPrintMeta'

type JsPdfWithTable = jsPDF & {
  lastAutoTable?: { finalY: number }
}

function resolveOrientation(payload: ExportTablePayload): 'portrait' | 'landscape' {
  const orientation = payload.dokumen?.paper_orientation
  return orientation === 'landscape' ? 'landscape' : 'portrait'
}

function resolveFormat(payload: ExportTablePayload): 'a4' | 'letter' | 'legal' {
  const size = payload.dokumen?.paper_size
  if (size === 'letter') return 'letter'
  if (size === 'legal') return 'legal'
  return 'a4'
}

export async function buildPdfBlob(payload: ExportTablePayload): Promise<Blob> {
  const doc = new jsPDF({
    orientation: resolveOrientation(payload),
    unit: 'mm',
    format: resolveFormat(payload),
  }) as JsPdfWithTable

  const margin = 14
  let cursorY = margin
  const pageWidth = doc.internal.pageSize.getWidth()
  const contentWidth = pageWidth - margin * 2

  const title = payload.title.trim()
  if (title) {
    doc.setFontSize(14)
    doc.text(title, margin, cursorY, { maxWidth: contentWidth })
    cursorY += 8
  }

  const { headerLines, footerLines } = brandLinesForExport(payload.dokumen)
  if (headerLines.length > 0) {
    doc.setFontSize(10)
    for (const line of headerLines) {
      doc.text(line, margin, cursorY, { maxWidth: contentWidth })
      cursorY += 5
    }
    cursorY += 2
  }

  const dokumen = payload.dokumen
  const showPrintDate = dokumen?.show_print_date !== false
  const showPrintRowCount = dokumen?.show_print_row_count !== false
  if (showPrintDate || showPrintRowCount) {
    const meta = formatPrintDateMeta({
      label: dokumen?.print_date_label,
      rowCount: payload.rows.length,
      showDate: showPrintDate,
      showRowCount: showPrintRowCount,
    })
    if (meta) {
      doc.setFontSize(9)
      doc.setTextColor(85, 85, 85)
      doc.text(meta, margin, cursorY, { maxWidth: contentWidth })
      doc.setTextColor(0, 0, 0)
      cursorY += 6
    }
  }

  autoTable(doc, {
    head: [payload.headers],
    body: payload.rows.map((row) => payload.headers.map((_, index) => cellTextForExport(row[index]))),
    startY: cursorY,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [243, 243, 243],
      textColor: [0, 0, 0],
    },
  })

  let footerY = (doc.lastAutoTable?.finalY ?? cursorY) + 8
  if (payload.printUser) {
    const signLines: string[] = []
    if (payload.printUser.showName && payload.printUser.name?.trim()) {
      signLines.push(payload.printUser.name.trim())
    }
    if (payload.printUser.showPhone && payload.printUser.phone?.trim()) {
      signLines.push(payload.printUser.phone.trim())
    }
    if (signLines.length > 0) {
      doc.setFontSize(9)
      for (const line of signLines) {
        doc.text(line, pageWidth - margin, footerY, { align: 'right' })
        footerY += 5
      }
      footerY += 2
    }
  }

  if (footerLines.length > 0) {
    doc.setFontSize(9)
    doc.setTextColor(85, 85, 85)
    for (const line of footerLines) {
      doc.text(line, margin, footerY, { maxWidth: contentWidth })
      footerY += 5
    }
    doc.setTextColor(0, 0, 0)
  }

  return doc.output('blob')
}
