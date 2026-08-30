/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 16:25:00
 */

import ExcelJS from 'exceljs'
import type { DokumenHeaderStyle, DokumenTextTransform } from '../api/types'
import { normalizeDokumenLayout, resolveLayoutLogos, type DokumenLayoutMode } from './dokumenLayout'
import { formatPrintDateMeta } from './dokumenPrintMeta'
import { fetchAssetAsDataUrl, resolveKonfigAssetUrl } from './konfigAsset'
import { normalizeDokumenHeaderStyle } from './dokumenStyle'
import type { ExportDokumenBrand, ExportTablePayload } from './tableExport'

function cellText(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function sheetNameFromTitle(title: string): string {
  const cleaned = title.replace(/[\\/*?:\[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  return (cleaned || 'Sheet1').slice(0, 31)
}

function excelFontName(key: string): string {
  const map: Record<string, string> = {
    'times-new-roman': 'Times New Roman',
    arial: 'Arial',
    calibri: 'Calibri',
    'segoe-ui': 'Segoe UI',
    tahoma: 'Tahoma',
    verdana: 'Verdana',
    georgia: 'Georgia',
    'courier-new': 'Courier New',
    'system-ui': 'Calibri',
  }
  return map[key] ?? 'Calibri'
}

function argb(hex: string): string {
  return `FF${hex.replace('#', '').toUpperCase()}`
}

function isBold(weight: string): boolean {
  return Number(weight) >= 600
}

function applyTextTransform(text: string, transform: DokumenTextTransform): string {
  if (transform === 'uppercase') return text.toUpperCase()
  if (transform === 'lowercase') return text.toLowerCase()
  if (transform === 'capitalize') {
    return text.replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  }
  return text
}

function brandLines(dokumen?: ExportDokumenBrand | null): {
  headerLines: string[]
  footerLines: string[]
} {
  if (!dokumen) {
    return { headerLines: [], footerLines: [] }
  }

  const headerLines = [dokumen.header, dokumen.header_detail]
    .map((value) => (value || '').trim())
    .filter(Boolean)

  if (dokumen.show_generated_by === false) {
    return { headerLines, footerLines: [] }
  }

  const footerLines = [dokumen.footer, dokumen.footer_detail]
    .map((value, index) => {
      const trimmed = (value || '').trim()
      if (!trimmed) return ''
      if (index === 0) {
        const app = (dokumen.app_nama ?? '').trim() || 'SIJAMA'
        return `${trimmed} oleh ${app}`
      }
      return trimmed
    })
    .filter(Boolean)

  return { headerLines, footerLines }
}

function estimateColWidth(text: string): number {
  return Math.max(8, Math.min(48, Math.round(text.length * 1.15 + 2)))
}

type ExcelImagePayload = {
  base64: string
  extension: 'png' | 'jpeg'
  width: number
  height: number
}

function rasterizeToPng(dataUrl: string, maxWidth: number, maxHeight: number): Promise<ExcelImagePayload | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const isRemoteHttp =
      dataUrl.startsWith('http://') || dataUrl.startsWith('https://')
    if (isRemoteHttp) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => {
      let width = img.naturalWidth || maxWidth
      let height = img.naturalHeight || maxHeight
      if (width <= 0 || height <= 0) {
        width = maxWidth
        height = maxHeight
      }
      const scale = Math.min(maxWidth / width, maxHeight / height, 1)
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(null)
        return
      }
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      try {
        const png = canvas.toDataURL('image/png')
        const match = png.match(/^data:image\/png;base64,(.+)$/s)
        resolve(
          match
            ? { base64: match[1], extension: 'png', width, height }
            : null,
        )
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

async function prepareExcelImage(
  pathOrUrl: string,
  maxWidth: number,
  maxHeight: number,
): Promise<ExcelImagePayload | null> {
  let source = await fetchAssetAsDataUrl(pathOrUrl)
  if (!source) return null

  if (!source.startsWith('data:')) {
    source = resolveKonfigAssetUrl(source) ?? source
  }

  return rasterizeToPng(source, maxWidth, maxHeight)
}

function brandColumnLayout(
  layout: DokumenLayoutMode,
  colCount: number,
  hasLeft: boolean,
  hasRight: boolean,
): {
  leftLogoCol: number | null
  rightLogoCol: number | null
  textStartCol: number
  textEndCol: number
} {
  if (colCount <= 1) {
    return { leftLogoCol: null, rightLogoCol: null, textStartCol: 1, textEndCol: 1 }
  }

  if (layout === 'kop_kiri') {
    const leftLogoCol = hasLeft ? 0 : null
    return {
      leftLogoCol,
      rightLogoCol: null,
      textStartCol: leftLogoCol !== null ? 2 : 1,
      textEndCol: colCount,
    }
  }

  if (layout === 'kop_kanan') {
    const rightLogoCol = hasRight ? colCount - 1 : null
    return {
      leftLogoCol: null,
      rightLogoCol,
      textStartCol: 1,
      textEndCol: rightLogoCol !== null ? colCount - 1 : colCount,
    }
  }

  if (layout === 'kop_ganda') {
    const leftLogoCol = hasLeft ? 0 : null
    const rightLogoCol = hasRight ? colCount - 1 : null
    let textStartCol = 1
    let textEndCol = colCount
    if (leftLogoCol !== null) textStartCol = 2
    if (rightLogoCol !== null) textEndCol = colCount - 1
    if (textStartCol > textEndCol) {
      textStartCol = 1
      textEndCol = colCount
    }
    return { leftLogoCol, rightLogoCol, textStartCol, textEndCol }
  }

  return { leftLogoCol: null, rightLogoCol: null, textStartCol: 1, textEndCol: colCount }
}

function logoColumnWidth(style: DokumenHeaderStyle): number {
  return Math.max(10, Math.round(style.logo_max_width / 6))
}

function addLogoImage(
  sheet: ExcelJS.Worksheet,
  workbook: ExcelJS.Workbook,
  image: ExcelImagePayload,
  col: number,
  rowIndex: number,
  rowSpan = 1,
): void {
  const imageId = workbook.addImage({
    base64: image.base64,
    extension: image.extension,
  })

  if (rowSpan > 1) {
    sheet.addImage(imageId, {
      tl: { col, row: rowIndex - 1 },
      ext: { width: image.width, height: Math.max(image.height, 18 * rowSpan) },
      editAs: 'oneCell',
    })
    return
  }

  sheet.addImage(imageId, {
    tl: { col, row: rowIndex - 1 },
    ext: { width: image.width, height: image.height },
    editAs: 'oneCell',
  })
}

function writeTextInColumns(
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  textStartCol: number,
  textEndCol: number,
  text: string,
  kind: RowKind,
  style: DokumenHeaderStyle,
): void {
  if (textStartCol >= textEndCol) {
    const cell = sheet.getCell(rowIndex, textStartCol)
    cell.value = text
    applyRowStyle(cell, kind, style)
    return
  }

  sheet.mergeCells(rowIndex, textStartCol, rowIndex, textEndCol)
  const cell = sheet.getCell(rowIndex, textStartCol)
  cell.value = text
  applyRowStyle(cell, kind, style)
}

function applyFullWidthBorder(
  sheet: ExcelJS.Worksheet,
  rowIndex: number,
  colCount: number,
  style: DokumenHeaderStyle,
): void {
  if (style.brand_border_width <= 0 || colCount < 1) return

  for (let col = 1; col <= colCount; col += 1) {
    const cell = sheet.getCell(rowIndex, col)
    cell.border = {
      ...cell.border,
      bottom: { style: 'thin', color: { argb: argb(style.brand_border_color) } },
    }
  }
}

type RowKind = 'header' | 'header-border' | 'detail' | 'detail-border' | 'meta' | 'title' | 'table-head' | 'table-cell' | 'footer'

function applyRowStyle(cell: ExcelJS.Cell, kind: RowKind, style: DokumenHeaderStyle): void {
  const horizontal = (value: string): ExcelJS.Alignment['horizontal'] => {
    if (value === 'center') return 'center'
    if (value === 'right') return 'right'
    return 'left'
  }

  if (kind === 'header') {
    cell.font = {
      name: excelFontName(style.header_font_family),
      size: style.header_font_size,
      bold: isBold(style.header_font_weight),
      italic: style.header_font_style === 'italic',
      underline: style.header_underline,
      strike: style.header_strikethrough,
      color: { argb: argb(style.header_color) },
    }
    cell.alignment = { horizontal: horizontal(style.header_align), vertical: 'middle', wrapText: true }
    return
  }

  if (kind === 'header-border') {
    cell.font = {
      name: excelFontName(style.header_font_family),
      size: style.header_font_size,
      bold: isBold(style.header_font_weight),
      italic: style.header_font_style === 'italic',
      underline: style.header_underline,
      strike: style.header_strikethrough,
      color: { argb: argb(style.header_color) },
    }
    cell.alignment = { horizontal: horizontal(style.header_align), vertical: 'middle', wrapText: true }
    if (style.brand_border_width > 0) {
      cell.border = {
        bottom: { style: 'thin', color: { argb: argb(style.brand_border_color) } },
      }
    }
    return
  }

  if (kind === 'detail' || kind === 'detail-border') {
    cell.font = {
      name: excelFontName(style.header_detail_font_family),
      size: style.header_detail_font_size,
      bold: isBold(style.header_detail_font_weight),
      italic: style.header_detail_font_style === 'italic',
      underline: style.header_detail_underline,
      strike: style.header_detail_strikethrough,
      color: { argb: argb(style.header_detail_color) },
    }
    cell.alignment = {
      horizontal: horizontal(style.header_detail_align),
      vertical: 'middle',
      wrapText: true,
    }
    if (kind === 'detail-border' && style.brand_border_width > 0) {
      cell.border = {
        bottom: { style: 'thin', color: { argb: argb(style.brand_border_color) } },
      }
    }
    return
  }

  if (kind === 'meta') {
    cell.font = {
      name: excelFontName(style.body_font_family),
      size: style.body_font_size,
      color: { argb: 'FF555555' },
    }
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    return
  }

  if (kind === 'title') {
    cell.font = {
      name: excelFontName(style.body_font_family),
      size: Math.round(style.body_font_size * 1.35),
      bold: isBold(style.body_font_weight),
      italic: style.body_font_style === 'italic',
      color: { argb: argb(style.body_color) },
    }
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    return
  }

  if (kind === 'table-head') {
    cell.font = {
      name: excelFontName(style.body_font_family),
      size: style.body_font_size,
      bold: true,
      color: { argb: argb(style.body_color) },
    }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F3F3' },
    }
    cell.alignment = { horizontal: horizontal(style.body_align), vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    }
    return
  }

  if (kind === 'table-cell') {
    cell.font = {
      name: excelFontName(style.body_font_family),
      size: style.body_font_size,
      bold: isBold(style.body_font_weight),
      italic: style.body_font_style === 'italic',
      color: { argb: argb(style.body_color) },
    }
    cell.alignment = { horizontal: horizontal(style.body_align), vertical: 'top', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    }
    return
  }

  if (kind === 'footer') {
    cell.font = {
      name: excelFontName(style.footer_font_family),
      size: style.footer_font_size,
      bold: isBold(style.footer_font_weight),
      italic: style.footer_font_style === 'italic',
      underline: style.footer_underline,
      strike: style.footer_strikethrough,
      color: { argb: 'FF555555' },
    }
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
    }
  }
}

async function buildWorkbookBytes(
  payload: ExportTablePayload,
  layout: DokumenLayoutMode,
  logoLeft?: ExcelImagePayload | null,
  logoRight?: ExcelImagePayload | null,
): Promise<Uint8Array> {
  const dokumen = payload.dokumen
  const style = normalizeDokumenHeaderStyle(dokumen?.header_style)
  const { headerLines, footerLines } = brandLines(dokumen)
  const colCount = Math.max(payload.headers.length, 1)

  const workbook = new ExcelJS.Workbook()
  workbook.creator = dokumen?.app_nama?.trim() || 'SIJAMA'
  const sheet = workbook.addWorksheet(sheetNameFromTitle(payload.title))

  let row = 1
  const widthSamples: string[][] = Array.from({ length: colCount }, () => [])

  const writeMerged = (text: string, kind: RowKind) => {
    if (colCount > 1) {
      sheet.mergeCells(row, 1, row, colCount)
    }
    const cell = sheet.getCell(row, 1)
    cell.value = text
    applyRowStyle(cell, kind, style)
    widthSamples[0].push(text)
    row += 1
  }

  const hasLeftLogo = Boolean(logoLeft)
  const hasRightLogo = Boolean(logoRight)
  const hasLogos = layout !== 'biasa' && (hasLeftLogo || hasRightLogo)
  const brandCols = brandColumnLayout(layout, colCount, hasLeftLogo, hasRightLogo)
  const logoHeight = Math.max(
    logoLeft?.height ?? 0,
    logoRight?.height ?? 0,
    hasLogos ? style.logo_max_height : 0,
  )

  if (hasLeftLogo && brandCols.leftLogoCol !== null) {
    widthSamples[brandCols.leftLogoCol].push(' '.repeat(logoColumnWidth(style)))
  }
  if (hasRightLogo && brandCols.rightLogoCol !== null) {
    widthSamples[brandCols.rightLogoCol].push(' '.repeat(logoColumnWidth(style)))
  }

  const writeInlineBrand = () => {
    const detailLines = headerLines.slice(1)
    const brandRowCount = Math.max(headerLines.length, 1)
    const startRow = row

    for (let index = 0; index < brandRowCount; index += 1) {
      sheet.getRow(startRow + index).height = Math.max(18, logoHeight * 0.75)
    }

    if (headerLines.length > 0) {
      const title = applyTextTransform(headerLines[0], style.header_text_transform)
      if (detailLines.length === 0) {
        writeTextInColumns(
          sheet,
          startRow,
          brandCols.textStartCol,
          brandCols.textEndCol,
          title,
          style.brand_border_width > 0 ? 'header-border' : 'header',
          style,
        )
        widthSamples[brandCols.textStartCol - 1].push(title)
      } else {
        writeTextInColumns(sheet, startRow, brandCols.textStartCol, brandCols.textEndCol, title, 'header', style)
        widthSamples[brandCols.textStartCol - 1].push(title)
        detailLines.forEach((line, index) => {
          const detailRow = startRow + index + 1
          const isLast = index === detailLines.length - 1
          const detail = applyTextTransform(line, style.header_detail_text_transform)
          writeTextInColumns(
            sheet,
            detailRow,
            brandCols.textStartCol,
            brandCols.textEndCol,
            detail,
            isLast && style.brand_border_width > 0 ? 'detail-border' : 'detail',
            style,
          )
          widthSamples[brandCols.textStartCol - 1].push(detail)
        })
      }
    } else if (style.brand_border_width > 0) {
      writeTextInColumns(sheet, startRow, brandCols.textStartCol, brandCols.textEndCol, '', 'detail-border', style)
    }

    if (logoLeft && brandCols.leftLogoCol !== null) {
      addLogoImage(sheet, workbook, logoLeft, brandCols.leftLogoCol, startRow, brandRowCount)
    }
    if (logoRight && brandCols.rightLogoCol !== null) {
      addLogoImage(sheet, workbook, logoRight, brandCols.rightLogoCol, startRow, brandRowCount)
    }

    const lastBrandRow = startRow + Math.max(headerLines.length, 1) - 1
    if (style.brand_border_width > 0 && headerLines.length > 0) {
      applyFullWidthBorder(sheet, lastBrandRow, colCount, style)
    }

    row = lastBrandRow + 1
  }

  const writeKopAtasBrand = () => {
    if (hasLogos) {
      sheet.getRow(row).height = Math.max(18, logoHeight * 0.85)
      const center = Math.max(1, Math.ceil(colCount / 2))
      if (logoLeft) {
        addLogoImage(sheet, workbook, logoLeft, Math.max(0, center - 2), row)
      }
      if (logoRight) {
        addLogoImage(sheet, workbook, logoRight, Math.min(colCount - 1, center), row)
      }
      row += 1
    }

    if (headerLines.length > 0) {
      const title = applyTextTransform(headerLines[0], style.header_text_transform)
      const detailLines = headerLines.slice(1)
      if (detailLines.length === 0) {
        writeMerged(title, style.brand_border_width > 0 ? 'header-border' : 'header')
      } else {
        writeMerged(title, 'header')
        detailLines.forEach((line, index) => {
          const isLast = index === detailLines.length - 1
          const detail = applyTextTransform(line, style.header_detail_text_transform)
          writeMerged(detail, isLast && style.brand_border_width > 0 ? 'detail-border' : 'detail')
        })
      }
    } else if (hasLogos && style.brand_border_width > 0) {
      writeMerged('', 'detail-border')
    }
  }

  const hasBrand = headerLines.length > 0 || hasLogos

  if (layout === 'kop_atas') {
    writeKopAtasBrand()
  } else if (layout !== 'biasa' && (hasLogos || headerLines.length > 0)) {
    writeInlineBrand()
  } else if (headerLines.length > 0) {
    const title = applyTextTransform(headerLines[0], style.header_text_transform)
    const detailLines = headerLines.slice(1)
    if (detailLines.length === 0) {
      writeMerged(title, style.brand_border_width > 0 ? 'header-border' : 'header')
    } else {
      writeMerged(title, 'header')
      detailLines.forEach((line, index) => {
        const isLast = index === detailLines.length - 1
        const detail = applyTextTransform(line, style.header_detail_text_transform)
        writeMerged(detail, isLast && style.brand_border_width > 0 ? 'detail-border' : 'detail')
      })
    }
  }

  if (!hasBrand && payload.title.trim()) {
    writeMerged(payload.title.trim(), 'title')
  }

  const showPrintDate = dokumen?.show_print_date !== false
  const showPrintRowCount = dokumen?.show_print_row_count !== false
  const metaText =
    showPrintDate || showPrintRowCount
      ? formatPrintDateMeta({
          label: dokumen?.print_date_label,
          rowCount: payload.rows.length,
          showDate: showPrintDate,
          showRowCount: showPrintRowCount,
        })
      : null
  if (metaText) {
    writeMerged(metaText, 'meta')
  }

  if (row > 1 || metaText) {
    row += 1
  }

  payload.headers.forEach((header, index) => {
    const cell = sheet.getCell(row, index + 1)
    cell.value = header
    applyRowStyle(cell, 'table-head', style)
    widthSamples[index].push(header)
  })
  row += 1

  for (const dataRow of payload.rows) {
    payload.headers.forEach((_, index) => {
      const text = cellText(dataRow[index])
      const cell = sheet.getCell(row, index + 1)
      cell.value = text
      applyRowStyle(cell, 'table-cell', style)
      widthSamples[index].push(text)
    })
    row += 1
  }

  if (footerLines.length > 0) {
    row += 1
    footerLines.forEach((line) => {
      const footer = applyTextTransform(line, style.footer_text_transform)
      writeMerged(footer, 'footer')
    })
  }

  widthSamples.forEach((samples, index) => {
    const max = samples.reduce((acc, sample) => Math.max(acc, estimateColWidth(sample)), 8)
    sheet.getColumn(index + 1).width = max
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Uint8Array(buffer)
}

export function buildXlsxBytes(_payload: ExportTablePayload): Uint8Array {
  throw new Error('buildXlsxBytes requires async; use buildXlsxBytesAsync')
}

export async function buildXlsxBytesAsync(payload: ExportTablePayload): Promise<Uint8Array> {
  const dokumen = payload.dokumen
  const layout = normalizeDokumenLayout(dokumen?.layout_mode)
  const style = normalizeDokumenHeaderStyle(dokumen?.header_style)

  let logoLeft: ExcelImagePayload | null = null
  let logoRight: ExcelImagePayload | null = null

  if (dokumen && layout !== 'biasa') {
    const logos = resolveLayoutLogos(layout, dokumen.path_logo_kiri, dokumen.path_logo_kanan)
    if (logos.left) {
      logoLeft = await prepareExcelImage(logos.left, style.logo_max_width, style.logo_max_height)
    }
    if (logos.right) {
      logoRight = await prepareExcelImage(logos.right, style.logo_max_width, style.logo_max_height)
    }
  }

  return buildWorkbookBytes(payload, layout, logoLeft, logoRight)
}
