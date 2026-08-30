/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:28:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:41:32
 */

import { fetchAssetAsDataUrl, resolveKonfigAssetUrl } from './konfigAsset'
import type { DokumenHeaderStyle, DokumenPaperOrientation, DokumenPaperSize } from '../api/types'
import {
  normalizeDokumenLayout,
  resolveLayoutLogos,
  type DokumenLayoutMode,
} from './dokumenLayout'
import { normalizeDokumenHeaderStyle, resolveDokumenPaper, resolveFontFamilyCss, resolvePaperPageCss, resolveTextDecoration } from './dokumenStyle'
import { buildSignMetaHtml, buildSignMetaLines } from './dokumenSignBlock'
import { formatGeneratedByLine, formatPrintDateMeta } from './dokumenPrintMeta'
import { buildXlsxBytesAsync } from './xlsxExport'

export type ExportPrintUserInfo = {
  name?: string | null
  phone?: string | null
  signatureUrl?: string | null
  showSignature?: boolean
  showName?: boolean
  showPhone?: boolean
}

export type ExportDokumenBrand = {
  header?: string | null
  header_detail?: string | null
  footer?: string | null
  footer_detail?: string | null
  path_logo_kiri?: string | null
  path_logo_kanan?: string | null
  layout_mode?: DokumenLayoutMode | string | null
  header_style?: Partial<DokumenHeaderStyle> | null
  paper_size?: DokumenPaperSize
  paper_orientation?: DokumenPaperOrientation
  show_print_date?: boolean
  print_date_label?: string | null
  show_print_row_count?: boolean
  show_generated_by?: boolean
  app_nama?: string | null
  show_user_signature?: boolean
  show_user_name?: boolean
  show_user_phone?: boolean
}

export type ExportTablePayload = {
  title: string
  headers: string[]
  columnKeys?: string[]
  rows: Array<Array<string | number | null | undefined>>
  dokumen?: ExportDokumenBrand | null
  printUser?: ExportPrintUserInfo | null
}

export type ExportMedia = 'pdf' | 'excel' | 'csv'

export function cellTextForExport(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function cellText(value: string | number | null | undefined): string {
  return cellTextForExport(value)
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function brandLinesForExport(dokumen?: ExportDokumenBrand | null): {
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
        return formatGeneratedByLine(trimmed, dokumen.app_nama)
      }
      return trimmed
    })
    .filter(Boolean)

  return { headerLines, footerLines }
}

function brandLines(dokumen?: ExportDokumenBrand | null): {
  headerLines: string[]
  footerLines: string[]
} {
  return brandLinesForExport(dokumen)
}

export function buildCsvContent(payload: ExportTablePayload): string {
  const { headerLines, footerLines } = brandLines(payload.dokumen)
  const lines: string[] = []

  for (const line of headerLines) {
    lines.push(escapeCsvCell(line))
  }
  if (headerLines.length > 0) {
    lines.push('')
  }

  lines.push(payload.headers.map((h) => escapeCsvCell(h)).join(','))
  for (const row of payload.rows) {
    lines.push(payload.headers.map((_, index) => escapeCsvCell(cellText(row[index]))).join(','))
  }

  if (footerLines.length > 0) {
    lines.push('')
    for (const line of footerLines) {
      lines.push(escapeCsvCell(line))
    }
  }

  return `\uFEFF${lines.join('\r\n')}`
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  downloadBlob(filename, new Blob([content], { type: mime }))
}

export function downloadCsv(filenameBase: string, payload: ExportTablePayload): void {
  downloadTextFile(
    `${filenameBase}.csv`,
    buildCsvContent(payload),
    'text/csv;charset=utf-8',
  )
}

export async function buildExcelBlob(payload: ExportTablePayload): Promise<Blob> {
  const bytes = await buildXlsxBytesAsync(payload)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/** Unduh workbook .xlsx (Excel / LibreOffice / Google Sheets). */
export async function downloadExcel(filenameBase: string, payload: ExportTablePayload): Promise<void> {
  downloadBlob(`${filenameBase}.xlsx`, await buildExcelBlob(payload))
}

export async function buildExportFile(
  media: ExportMedia,
  filenameBase: string,
  payload: ExportTablePayload,
): Promise<File> {
  if (media === 'csv') {
    return new File([buildCsvContent(payload)], `${filenameBase}.csv`, {
      type: 'text/csv',
    })
  }
  if (media === 'excel') {
    return new File([await buildExcelBlob(payload)], `${filenameBase}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  }
  const { buildPdfBlob } = await import('./pdfExport')
  return new File([await buildPdfBlob(payload)], `${filenameBase}.pdf`, {
    type: 'application/pdf',
  })
}

/** @deprecated gunakan downloadExcel */
export async function downloadExcelCsv(filenameBase: string, payload: ExportTablePayload): Promise<void> {
  await downloadExcel(filenameBase, payload)
}

function buildPrintHtml(payload: ExportTablePayload): string {
  const dokumen = payload.dokumen
  const { headerLines, footerLines } = brandLines(dokumen)
  const style = normalizeDokumenHeaderStyle(dokumen?.header_style)
  const paper = resolveDokumenPaper(
    dokumen
      ? { paper_size: dokumen.paper_size, paper_orientation: dokumen.paper_orientation }
      : null,
  )
  const pageSize = resolvePaperPageCss(paper)
  const headerDecoration = resolveTextDecoration(style.header_underline, style.header_strikethrough)
  const detailDecoration = resolveTextDecoration(
    style.header_detail_underline,
    style.header_detail_strikethrough,
  )
  const footerDecoration = resolveTextDecoration(style.footer_underline, style.footer_strikethrough)
  const headerFont = resolveFontFamilyCss(style.header_font_family)
  const detailFont = resolveFontFamilyCss(style.header_detail_font_family)
  const footerFont = resolveFontFamilyCss(style.footer_font_family)
  const bodyFont = resolveFontFamilyCss(style.body_font_family)
  const layout = normalizeDokumenLayout(dokumen?.layout_mode)
  const logos = resolveLayoutLogos(layout, dokumen?.path_logo_kiri, dokumen?.path_logo_kanan)
  const logoKiri = resolveKonfigAssetUrl(logos.left)
  const logoKanan = resolveKonfigAssetUrl(logos.right)
  const hasBrand =
    headerLines.length > 0 || Boolean(logoKiri || logoKanan)

  const headerCells = payload.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')
  const bodyRows = payload.rows
    .map(
      (row) =>
        `<tr>${payload.headers
          .map((_, index) => `<td>${escapeHtml(cellText(row[index]))}</td>`)
          .join('')}</tr>`,
    )
    .join('')

  const titleHtml = headerLines[0]
    ? `<p class="doc-brand__title">${escapeHtml(headerLines[0])}</p>`
    : ''
  const detailHtml = headerLines
    .slice(1)
    .map((line) => `<p class="doc-brand__detail">${escapeHtml(line)}</p>`)
    .join('\n      ')
  const textBlock = `<div class="doc-brand__text">
      ${titleHtml}
      ${detailHtml}
    </div>`
  const logoLeftHtml = logoKiri
    ? `<div class="doc-brand__logo doc-brand__logo--left"><img src="${escapeHtml(logoKiri)}" alt="" /></div>`
    : `<div class="doc-brand__logo doc-brand__logo--left"></div>`
  const logoRightHtml = logoKanan
    ? `<div class="doc-brand__logo doc-brand__logo--right"><img src="${escapeHtml(logoKanan)}" alt="" /></div>`
    : `<div class="doc-brand__logo doc-brand__logo--right"></div>`

  let brandHeaderHtml = ''
  if (hasBrand) {
    if (layout === 'biasa') {
      brandHeaderHtml = `<header class="doc-brand doc-brand--plain">
  ${textBlock}
</header>`
    } else if (layout === 'kop_atas') {
      brandHeaderHtml = `<header class="doc-brand doc-brand--top">
  <div class="doc-brand__logos-top">
    ${logoKiri ? `<img src="${escapeHtml(logoKiri)}" alt="" />` : ''}
    ${logoKanan ? `<img src="${escapeHtml(logoKanan)}" alt="" />` : ''}
  </div>
  ${textBlock}
</header>`
    } else if (layout === 'kop_kiri') {
      brandHeaderHtml = `<header class="doc-brand doc-brand--left">
  <div class="doc-brand__row">
    ${logoLeftHtml}
    ${textBlock}
  </div>
</header>`
    } else if (layout === 'kop_kanan') {
      brandHeaderHtml = `<header class="doc-brand doc-brand--right">
  <div class="doc-brand__row">
    ${textBlock}
    ${logoRightHtml}
  </div>
</header>`
    } else {
      brandHeaderHtml = `<header class="doc-brand doc-brand--dual">
  <div class="doc-brand__row">
    ${logoLeftHtml}
    ${textBlock}
    ${logoRightHtml}
  </div>
</header>`
    }
  }

  const brandFooterHtml =
    footerLines.length > 0
      ? `<footer class="doc-brand doc-brand--footer">
  ${footerLines.map((line) => `<p>${escapeHtml(line)}</p>`).join('\n  ')}
</footer>`
      : ''

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
  const metaHtml = metaText ? `<p class="meta">${escapeHtml(metaText)}</p>` : ''

  const printUser = payload.printUser
  const signatureInnerHtml =
    printUser?.showSignature && printUser.signatureUrl
      ? `<div class="doc-sign"><img src="${escapeHtml(printUser.signatureUrl)}" alt="" /></div>`
      : ''
  const signMetaHtml = buildSignMetaHtml(
    buildSignMetaLines({
      showName: Boolean(printUser?.showName),
      showPhone: Boolean(printUser?.showPhone),
      name: printUser?.name?.trim() || null,
      phone: printUser?.phone?.trim() || null,
      layout: style.sign_meta_layout,
      order: style.sign_meta_order,
    }),
    style.sign_meta_layout,
    escapeHtml,
  )
  const printUserHtml =
    signatureInnerHtml || signMetaHtml
      ? `<section class="doc-sign-block doc-sign-block--position-${style.sign_block_position}">
  <div class="doc-sign-block__inner doc-sign-block__inner--align-${style.sign_content_align}">
  ${signatureInnerHtml}
  ${signMetaHtml}
  </div>
</section>`
      : ''

  const bodyTitleHtml = hasBrand
    ? ''
    : payload.title.trim()
      ? `<h1>${escapeHtml(payload.title)}</h1>`
      : ''

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.title)}</title>
  <style>
    @page { size: ${pageSize}; margin: 12mm; }
    body { font-family: ${bodyFont}; color: ${style.body_color}; margin: 1.5rem; }
    h1 { font-family: ${bodyFont}; font-size: ${Math.round(style.body_font_size * 1.35)}px; font-weight: ${style.body_font_weight}; color: ${style.body_color}; margin: 0 0 0.35rem; }
    p.meta { color: #555; font-size: ${style.body_font_size}px; margin: 0 0 1rem; }
    .doc-brand { margin: 0 0 1rem; padding-bottom: 0.75rem; border-bottom: ${style.brand_border_width}px solid ${style.brand_border_color}; }
    .doc-brand__row { display: flex; align-items: center; gap: 0.75rem; }
    .doc-brand__logo { width: ${style.logo_max_width}px; flex: 0 0 ${style.logo_max_width}px; text-align: center; }
    .doc-brand__logo img,
    .doc-brand__logos-top img { max-height: ${style.logo_max_height}px; max-width: ${style.logo_max_width}px; object-fit: contain; }
    .doc-brand__logos-top { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .doc-brand__text { flex: 1 1 auto; }
    .doc-brand--plain .doc-brand__text { width: 100%; }
    .doc-brand__title { font-family: ${headerFont}; font-size: ${style.header_font_size}px; font-weight: ${style.header_font_weight}; color: ${style.header_color}; text-align: ${style.header_align}; text-transform: ${style.header_text_transform}; letter-spacing: ${style.header_letter_spacing}px; font-style: ${style.header_font_style}; text-decoration: ${headerDecoration}; line-height: ${style.header_line_height}; margin: 0 0 0.2rem; }
    .doc-brand__detail { font-family: ${detailFont}; margin: 0; color: ${style.header_detail_color}; font-size: ${style.header_detail_font_size}px; font-weight: ${style.header_detail_font_weight}; text-align: ${style.header_detail_align}; text-transform: ${style.header_detail_text_transform}; letter-spacing: ${style.header_detail_letter_spacing}px; font-style: ${style.header_detail_font_style}; text-decoration: ${detailDecoration}; line-height: ${style.header_detail_line_height}; white-space: pre-line; }
    .doc-brand--footer { font-family: ${footerFont}; margin: 1.25rem 0 0; padding-top: 0.75rem; padding-bottom: 0; border-bottom: 0; border-top: 1px solid #ddd; color: #555; font-size: ${style.footer_font_size}px; font-weight: ${style.footer_font_weight}; text-transform: ${style.footer_text_transform}; letter-spacing: ${style.footer_letter_spacing}px; font-style: ${style.footer_font_style}; text-decoration: ${footerDecoration}; line-height: ${style.footer_line_height}; }
    .doc-brand--footer p { margin: 0.15rem 0; }
    table { width: 100%; border-collapse: collapse; font-family: ${bodyFont}; font-size: ${style.body_font_size}px; font-weight: ${style.body_font_weight}; font-style: ${style.body_font_style}; color: ${style.body_color}; line-height: ${style.body_line_height}; }
    th, td { border: 1px solid #ccc; padding: 0.4rem 0.5rem; text-align: ${style.body_align}; vertical-align: top; }
    th { background: #f3f3f3; }
    .doc-sign-block { margin: 1.25rem 0 0; width: 100%; display: flex; }
    .doc-sign-block--position-left { justify-content: flex-start; }
    .doc-sign-block--position-center { justify-content: center; }
    .doc-sign-block--position-right { justify-content: flex-end; }
    .doc-sign-block__inner { max-width: 100%; display: flex; flex-direction: column; gap: 0.2rem; }
    .doc-sign-block__inner--align-left { text-align: left; align-items: flex-start; }
    .doc-sign-block__inner--align-center { text-align: center; align-items: center; }
    .doc-sign-block__inner--align-right { text-align: right; align-items: flex-end; }
    .doc-sign img { max-height: 72px; max-width: 180px; object-fit: contain; }
    .doc-sign-block__meta { margin: 0; font-size: 0.85rem; color: #444; }
    .doc-sign-block__meta--inline { margin-top: 0.15rem; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  ${brandHeaderHtml}
  ${bodyTitleHtml}
  ${metaHtml}
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  ${printUserHtml}
  ${brandFooterHtml}
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function printTable(payload: ExportTablePayload): Promise<void> {
  const dokumen = payload.dokumen
    ? {
        ...payload.dokumen,
        path_logo_kiri: await fetchAssetAsDataUrl(payload.dokumen.path_logo_kiri),
        path_logo_kanan: await fetchAssetAsDataUrl(payload.dokumen.path_logo_kanan),
      }
    : null

  const signatureUrl =
    payload.printUser?.showSignature && payload.printUser.signatureUrl
      ? await fetchAssetAsDataUrl(payload.printUser.signatureUrl)
      : null

  const html = buildPrintHtml({
    ...payload,
    dokumen,
    printUser: payload.printUser
      ? {
          ...payload.printUser,
          signatureUrl: signatureUrl ?? payload.printUser.signatureUrl ?? null,
        }
      : null,
  })
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.position = 'fixed'
  frame.style.left = '0'
  frame.style.top = '0'
  frame.style.width = '800px'
  frame.style.height = '1100px'
  frame.style.opacity = '0'
  frame.style.pointerEvents = 'none'
  frame.style.border = '0'
  frame.style.zIndex = '-1'
  document.body.appendChild(frame)

  const doc = frame.contentDocument || frame.contentWindow?.document
  if (!doc) {
    frame.remove()
    window.print()
    return
  }

  doc.open()
  doc.write(html)
  doc.close()

  const win = frame.contentWindow
  if (!win) {
    frame.remove()
    return
  }

  await waitForDocumentImages(doc)

  const cleanup = () => {
    frame.remove()
  }

  win.focus()
  win.onafterprint = cleanup
  win.print()
  setTimeout(cleanup, 1500)
}

function waitForDocumentImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images)
  if (images.length === 0) {
    return Promise.resolve()
  }

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          image.addEventListener('load', done, { once: true })
          image.addEventListener('error', done, { once: true })
          setTimeout(done, 2500)
        }),
    ),
  ).then(() => undefined)
}

export function slugFilename(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
  const stamp = new Date().toISOString().slice(0, 10)
  return `${base || 'export'}-${stamp}`
}
