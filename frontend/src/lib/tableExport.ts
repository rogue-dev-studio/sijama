/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 15:28:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:41:32
 */

import { fetchAssetAsDataUrl, resolveKonfigAssetUrl } from './konfigAsset'
import type { DokumenHeaderStyle } from '../api/types'
import {
  normalizeDokumenLayout,
  resolveLayoutLogos,
  type DokumenLayoutMode,
} from './dokumenLayout'

export type ExportDokumenBrand = {
  header?: string | null
  header_detail?: string | null
  footer?: string | null
  footer_detail?: string | null
  path_logo_kiri?: string | null
  path_logo_kanan?: string | null
  layout_mode?: DokumenLayoutMode | string | null
  header_style?: Partial<DokumenHeaderStyle> | null
}

export type ExportTablePayload = {
  title: string
  headers: string[]
  rows: Array<Array<string | number | null | undefined>>
  dokumen?: ExportDokumenBrand | null
}

export type ExportMedia = 'pdf' | 'excel' | 'csv'

const DEFAULT_PRINT_STYLE: DokumenHeaderStyle = {
  header_font_size: 17,
  header_font_weight: '650',
  header_align: 'center',
  header_detail_font_size: 14,
  header_detail_font_weight: '400',
  header_detail_color: '#444444',
  logo_max_height: 64,
  footer_font_size: 13,
}

function normalizePrintStyle(raw?: Partial<DokumenHeaderStyle> | null): DokumenHeaderStyle {
  return {
    ...DEFAULT_PRINT_STYLE,
    ...(raw || {}),
    header_align:
      raw?.header_align === 'left' || raw?.header_align === 'right' || raw?.header_align === 'center'
        ? raw.header_align
        : DEFAULT_PRINT_STYLE.header_align,
  }
}

function cellText(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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
  const footerLines = [dokumen.footer, dokumen.footer_detail]
    .map((value) => (value || '').trim())
    .filter(Boolean)

  return { headerLines, footerLines }
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

function sheetNameFromTitle(title: string): string {
  const cleaned = title.replace(/[\\/*?:\[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  return (cleaned || 'Sheet1').slice(0, 31)
}

function inlineStrCell(value: string): string {
  return `<c t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`
}

function buildSheetRows(payload: ExportTablePayload): string {
  const { headerLines, footerLines } = brandLines(payload.dokumen)
  const colCount = Math.max(payload.headers.length, 1)
  const rowsXml: string[] = []
  let rowIndex = 1

  const pushMergedTextRow = (text: string) => {
    const cells = [inlineStrCell(text), ...Array.from({ length: colCount - 1 }, () => '<c/>')]
    rowsXml.push(`<row r="${rowIndex}">${cells.join('')}</row>`)
    rowIndex += 1
  }

  for (const line of headerLines) {
    pushMergedTextRow(line)
  }
  if (headerLines.length > 0) {
    rowsXml.push(`<row r="${rowIndex}"/>`)
    rowIndex += 1
  }

  rowsXml.push(
    `<row r="${rowIndex}">${payload.headers.map((header) => inlineStrCell(header)).join('')}</row>`,
  )
  rowIndex += 1

  for (const row of payload.rows) {
    const cells = payload.headers.map((_, index) => inlineStrCell(cellText(row[index])))
    rowsXml.push(`<row r="${rowIndex}">${cells.join('')}</row>`)
    rowIndex += 1
  }

  if (footerLines.length > 0) {
    rowsXml.push(`<row r="${rowIndex}"/>`)
    rowIndex += 1
    for (const line of footerLines) {
      pushMergedTextRow(line)
    }
  }

  return rowsXml.join('')
}

/** CRC32 + ZIP store (tanpa kompresi) untuk OOXML .xlsx minimal. */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let crc = i
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? (0xedb88320 ^ (crc >>> 1)) : crc >>> 1
    }
    table[i] = crc >>> 0
  }
  return table
})()

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function u16(value: number): Uint8Array {
  const out = new Uint8Array(2)
  out[0] = value & 0xff
  out[1] = (value >>> 8) & 0xff
  return out
}

function u32(value: number): Uint8Array {
  const out = new Uint8Array(4)
  out[0] = value & 0xff
  out[1] = (value >>> 8) & 0xff
  out[2] = (value >>> 16) & 0xff
  out[3] = (value >>> 24) & 0xff
  return out
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

function encodeUtf8(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

type ZipEntry = { name: string; data: Uint8Array }

function buildZip(entries: ZipEntry[]): Uint8Array {
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encodeUtf8(entry.name)
    const data = entry.data
    const crc = crc32(data)
    const localHeader = concatBytes([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
    ])
    localParts.push(localHeader, data)

    centralParts.push(
      concatBytes([
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(nameBytes.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        nameBytes,
      ]),
    )
    offset += localHeader.length + data.length
  }

  const centralDirectory = concatBytes(centralParts)
  const end = concatBytes([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0),
  ])

  return concatBytes([...localParts, centralDirectory, end])
}

export function buildXlsxBytes(payload: ExportTablePayload): Uint8Array {
  const sheetName = escapeXml(sheetNameFromTitle(payload.title))
  const sheetRows = buildSheetRows(payload)
  const colCount = Math.max(payload.headers.length, 1)
  const cols = Array.from({ length: colCount }, (_, index) => {
    const col = index + 1
    return `<col min="${col}" max="${col}" width="18" customWidth="1"/>`
  }).join('')

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${sheetName}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${cols}</cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`

  return buildZip([
    { name: '[Content_Types].xml', data: encodeUtf8(contentTypes) },
    { name: '_rels/.rels', data: encodeUtf8(rootRels) },
    { name: 'xl/workbook.xml', data: encodeUtf8(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: encodeUtf8(workbookRels) },
    { name: 'xl/worksheets/sheet1.xml', data: encodeUtf8(sheet) },
  ])
}

/** Unduh workbook .xlsx (Excel / LibreOffice / Google Sheets). */
export function downloadExcel(filenameBase: string, payload: ExportTablePayload): void {
  const bytes = buildXlsxBytes(payload)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  downloadBlob(
    `${filenameBase}.xlsx`,
    new Blob([copy], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  )
}

/** @deprecated gunakan downloadExcel */
export function downloadExcelCsv(filenameBase: string, payload: ExportTablePayload): void {
  downloadExcel(filenameBase, payload)
}

function buildPrintHtml(payload: ExportTablePayload): string {
  const dokumen = payload.dokumen
  const { headerLines, footerLines } = brandLines(dokumen)
  const style = normalizePrintStyle(dokumen?.header_style)
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

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #111; margin: 1.5rem; }
    h1 { font-size: 1.25rem; margin: 0 0 0.35rem; }
    p.meta { color: #555; font-size: 0.85rem; margin: 0 0 1rem; }
    .doc-brand { margin: 0 0 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #ddd; }
    .doc-brand__row { display: flex; align-items: center; gap: 0.75rem; }
    .doc-brand__logo { width: 88px; flex: 0 0 88px; text-align: center; }
    .doc-brand__logo img,
    .doc-brand__logos-top img { max-height: ${style.logo_max_height}px; max-width: 100%; object-fit: contain; }
    .doc-brand__logos-top { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .doc-brand__text { flex: 1 1 auto; text-align: ${style.header_align}; }
    .doc-brand--plain .doc-brand__text { width: 100%; }
    .doc-brand__title { font-size: ${style.header_font_size}px; font-weight: ${style.header_font_weight}; margin: 0 0 0.2rem; }
    .doc-brand__detail { margin: 0; color: ${style.header_detail_color}; font-size: ${style.header_detail_font_size}px; font-weight: ${style.header_detail_font_weight}; white-space: pre-line; }
    .doc-brand--footer { margin: 1.25rem 0 0; padding-top: 0.75rem; padding-bottom: 0; border-bottom: 0; border-top: 1px solid #ddd; color: #555; font-size: ${style.footer_font_size}px; }
    .doc-brand--footer p { margin: 0.15rem 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { border: 1px solid #ccc; padding: 0.4rem 0.5rem; text-align: left; vertical-align: top; }
    th { background: #f3f3f3; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  ${brandHeaderHtml}
  <h1>${escapeHtml(payload.title)}</h1>
  <p class="meta">Dicetak ${escapeHtml(new Date().toLocaleString('id-ID'))} · ${payload.rows.length} baris</p>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
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

  const html = buildPrintHtml({ ...payload, dokumen })
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
