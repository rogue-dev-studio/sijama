/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 14:35:00
 */

import type {
  DokumenFontFamilyKey,
  DokumenFontStyle,
  DokumenHeaderStyle,
  DokumenPaperConfig,
  DokumenPaperOrientation,
  DokumenPaperSize,
  DokumenSignAlign,
  DokumenTextTransform,
} from '../api/types'

export const DOKUMEN_FONT_FAMILIES: Array<{
  value: DokumenFontFamilyKey
  label: string
  css: string
}> = [
  { value: 'times-new-roman', label: 'Times New Roman', css: '"Times New Roman", Times, serif' },
  { value: 'arial', label: 'Arial', css: 'Arial, Helvetica, sans-serif' },
  { value: 'calibri', label: 'Calibri', css: 'Calibri, "Segoe UI", sans-serif' },
  { value: 'segoe-ui', label: 'Segoe UI', css: '"Segoe UI", Tahoma, sans-serif' },
  { value: 'tahoma', label: 'Tahoma', css: 'Tahoma, Geneva, sans-serif' },
  { value: 'verdana', label: 'Verdana', css: 'Verdana, Geneva, sans-serif' },
  { value: 'georgia', label: 'Georgia', css: 'Georgia, "Times New Roman", serif' },
  { value: 'courier-new', label: 'Courier New', css: '"Courier New", Courier, monospace' },
  { value: 'system-ui', label: 'Sistem', css: 'system-ui, -apple-system, sans-serif' },
]

const FONT_FAMILY_KEYS = DOKUMEN_FONT_FAMILIES.map((item) => item.value)

export function resolveFontFamilyCss(key: DokumenFontFamilyKey | string | undefined): string {
  const match = DOKUMEN_FONT_FAMILIES.find((item) => item.value === key)
  return match?.css ?? DOKUMEN_FONT_FAMILIES[0].css
}

export const DEFAULT_DOKUMEN_HEADER_STYLE: DokumenHeaderStyle = {
  header_font_family: 'times-new-roman',
  header_font_size: 17,
  header_font_weight: '650',
  header_align: 'center',
  header_color: '#111111',
  header_text_transform: 'none',
  header_letter_spacing: 0,
  header_font_style: 'normal',
  header_underline: false,
  header_strikethrough: false,
  header_line_height: 1.15,
  header_detail_font_family: 'times-new-roman',
  header_detail_font_size: 14,
  header_detail_font_weight: '400',
  header_detail_color: '#444444',
  header_detail_align: 'center',
  header_detail_text_transform: 'none',
  header_detail_letter_spacing: 0,
  header_detail_font_style: 'normal',
  header_detail_underline: false,
  header_detail_strikethrough: false,
  header_detail_line_height: 1.15,
  logo_max_height: 64,
  logo_max_width: 88,
  brand_border_width: 1,
  brand_border_color: '#DDDDDD',
  footer_font_family: 'times-new-roman',
  footer_font_size: 13,
  footer_font_weight: '400',
  footer_text_transform: 'none',
  footer_letter_spacing: 0,
  footer_font_style: 'normal',
  footer_underline: false,
  footer_strikethrough: false,
  footer_line_height: 1.15,
  body_font_family: 'arial',
  body_font_size: 11,
  body_font_weight: '400',
  body_color: '#111111',
  body_font_style: 'normal',
  body_line_height: 1.25,
  body_align: 'left',
  sign_block_position: 'center',
  sign_content_align: 'center',
  sign_meta_layout: 'stack',
  sign_meta_order: 'name_first',
}

const FONT_WEIGHTS = ['400', '500', '600', '650', '700', '800'] as const
const TEXT_TRANSFORMS: DokumenTextTransform[] = ['none', 'uppercase', 'lowercase', 'capitalize']
const FONT_STYLES: DokumenFontStyle[] = ['normal', 'italic']
export const DEFAULT_DOKUMEN_PAPER: DokumenPaperConfig = {
  paper_size: 'a4',
  paper_orientation: 'portrait',
}

export function normalizeDokumenPaper(
  raw?: Partial<DokumenPaperConfig> | null,
): DokumenPaperConfig {
  return {
    paper_size: normalizePaperSize(raw?.paper_size, DEFAULT_DOKUMEN_PAPER.paper_size),
    paper_orientation: normalizePaperOrientation(
      raw?.paper_orientation,
      DEFAULT_DOKUMEN_PAPER.paper_orientation,
    ),
  }
}

export function resolveDokumenPaper(
  source?: Partial<DokumenPaperConfig> | null,
  fallback?: Partial<DokumenPaperConfig> | null,
): DokumenPaperConfig {
  return normalizeDokumenPaper({
    paper_size: source?.paper_size ?? fallback?.paper_size,
    paper_orientation: source?.paper_orientation ?? fallback?.paper_orientation,
  })
}

function normalizeAlign(
  value: unknown,
  fallback: DokumenHeaderStyle['header_align'],
): DokumenHeaderStyle['header_align'] {
  return value === 'left' || value === 'right' || value === 'center' || value === 'justify'
    ? value
    : fallback
}

function normalizeSignAlign(value: unknown, fallback: DokumenSignAlign): DokumenSignAlign {
  return value === 'left' || value === 'right' || value === 'center' ? value : fallback
}

function normalizeSignMetaLayout(
  value: unknown,
  fallback: DokumenHeaderStyle['sign_meta_layout'],
): DokumenHeaderStyle['sign_meta_layout'] {
  return value === 'inline' || value === 'stack' ? value : fallback
}

function normalizeSignMetaOrder(
  value: unknown,
  fallback: DokumenHeaderStyle['sign_meta_order'],
): DokumenHeaderStyle['sign_meta_order'] {
  return value === 'name_first' || value === 'phone_first' ? value : fallback
}

function normalizeBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === 1 || value === '1') return true
  if (value === 'false' || value === 0 || value === '0') return false
  return fallback
}

export function resolveTextDecoration(underline: boolean, strikethrough: boolean): string {
  if (underline && strikethrough) return 'underline line-through'
  if (underline) return 'underline'
  if (strikethrough) return 'line-through'
  return 'none'
}

function normalizeFontFamily(value: unknown, fallback: DokumenFontFamilyKey): DokumenFontFamilyKey {
  const key = String(value ?? '').trim() as DokumenFontFamilyKey
  return FONT_FAMILY_KEYS.includes(key) ? key : fallback
}

function normalizeTextTransform(
  value: unknown,
  fallback: DokumenTextTransform,
): DokumenTextTransform {
  return TEXT_TRANSFORMS.includes(value as DokumenTextTransform)
    ? (value as DokumenTextTransform)
    : fallback
}

function normalizeFontStyle(value: unknown, fallback: DokumenFontStyle): DokumenFontStyle {
  return FONT_STYLES.includes(value as DokumenFontStyle) ? (value as DokumenFontStyle) : fallback
}

const PAPER_SIZES: DokumenPaperSize[] = ['a4', 'letter', 'legal', 'a5', 'folio']
const PAPER_ORIENTATIONS: DokumenPaperOrientation[] = ['portrait', 'landscape']

function normalizePaperSize(value: unknown, fallback: DokumenPaperSize): DokumenPaperSize {
  return PAPER_SIZES.includes(value as DokumenPaperSize) ? (value as DokumenPaperSize) : fallback
}

function normalizePaperOrientation(
  value: unknown,
  fallback: DokumenPaperOrientation,
): DokumenPaperOrientation {
  return PAPER_ORIENTATIONS.includes(value as DokumenPaperOrientation)
    ? (value as DokumenPaperOrientation)
    : fallback
}

function normalizeColor(value: unknown, fallback: string): string {
  const color = typeof value === 'string' ? value.trim() : ''
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color.toUpperCase() : fallback
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, Math.round(parsed)))
}

function clampFloat(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.min(max, Math.round(parsed * 100) / 100))
}

function normalizeWeight(value: unknown, fallback: string): string {
  const weight = String(value ?? '')
  return FONT_WEIGHTS.includes(weight as (typeof FONT_WEIGHTS)[number]) ? weight : fallback
}

export function normalizeDokumenHeaderStyle(
  raw?: (Partial<DokumenHeaderStyle> & {
    sign_align?: DokumenSignAlign
    sign_image_align?: DokumenSignAlign
    sign_meta_align?: DokumenSignAlign
  }) | null,
): DokumenHeaderStyle {
  const base = DEFAULT_DOKUMEN_HEADER_STYLE
  const legacyBlock =
    raw?.sign_block_position ??
    raw?.sign_image_align ??
    raw?.sign_align
  const legacyContent =
    raw?.sign_content_align ??
    raw?.sign_meta_align ??
    raw?.sign_align
  const headerAlign = normalizeAlign(raw?.header_align, base.header_align)

  return {
    header_font_family: normalizeFontFamily(raw?.header_font_family, base.header_font_family),
    header_font_size: clampInt(raw?.header_font_size, 8, 48, base.header_font_size),
    header_font_weight: normalizeWeight(raw?.header_font_weight, base.header_font_weight),
    header_align: headerAlign,
    header_color: normalizeColor(raw?.header_color, base.header_color),
    header_text_transform: normalizeTextTransform(
      raw?.header_text_transform,
      base.header_text_transform,
    ),
    header_letter_spacing: clampInt(raw?.header_letter_spacing, -2, 12, base.header_letter_spacing),
    header_font_style: normalizeFontStyle(raw?.header_font_style, base.header_font_style),
    header_underline: normalizeBool(raw?.header_underline, base.header_underline),
    header_strikethrough: normalizeBool(raw?.header_strikethrough, base.header_strikethrough),
    header_line_height: clampFloat(raw?.header_line_height, 1, 2.5, base.header_line_height),
    header_detail_font_family: normalizeFontFamily(
      raw?.header_detail_font_family,
      base.header_detail_font_family,
    ),
    header_detail_font_size: clampInt(
      raw?.header_detail_font_size,
      8,
      36,
      base.header_detail_font_size,
    ),
    header_detail_font_weight: normalizeWeight(
      raw?.header_detail_font_weight,
      base.header_detail_font_weight,
    ),
    header_detail_color: normalizeColor(raw?.header_detail_color, base.header_detail_color),
    header_detail_align: normalizeAlign(raw?.header_detail_align, headerAlign),
    header_detail_text_transform: normalizeTextTransform(
      raw?.header_detail_text_transform,
      base.header_detail_text_transform,
    ),
    header_detail_letter_spacing: clampInt(
      raw?.header_detail_letter_spacing,
      -2,
      12,
      base.header_detail_letter_spacing,
    ),
    header_detail_font_style: normalizeFontStyle(
      raw?.header_detail_font_style,
      base.header_detail_font_style,
    ),
    header_detail_underline: normalizeBool(raw?.header_detail_underline, base.header_detail_underline),
    header_detail_strikethrough: normalizeBool(
      raw?.header_detail_strikethrough,
      base.header_detail_strikethrough,
    ),
    header_detail_line_height: clampFloat(
      raw?.header_detail_line_height,
      1,
      2.5,
      base.header_detail_line_height,
    ),
    logo_max_height: clampInt(raw?.logo_max_height, 24, 160, base.logo_max_height),
    logo_max_width: clampInt(raw?.logo_max_width, 40, 240, base.logo_max_width),
    brand_border_width: clampInt(raw?.brand_border_width, 0, 4, base.brand_border_width),
    brand_border_color: normalizeColor(raw?.brand_border_color, base.brand_border_color),
    footer_font_family: normalizeFontFamily(raw?.footer_font_family, base.footer_font_family),
    footer_font_size: clampInt(raw?.footer_font_size, 8, 24, base.footer_font_size),
    footer_font_weight: normalizeWeight(raw?.footer_font_weight, base.footer_font_weight),
    footer_text_transform: normalizeTextTransform(
      raw?.footer_text_transform,
      base.footer_text_transform,
    ),
    footer_letter_spacing: clampInt(raw?.footer_letter_spacing, -2, 12, base.footer_letter_spacing),
    footer_font_style: normalizeFontStyle(raw?.footer_font_style, base.footer_font_style),
    footer_underline: normalizeBool(raw?.footer_underline, base.footer_underline),
    footer_strikethrough: normalizeBool(raw?.footer_strikethrough, base.footer_strikethrough),
    footer_line_height: clampFloat(raw?.footer_line_height, 1, 2.5, base.footer_line_height),
    body_font_family: normalizeFontFamily(raw?.body_font_family, base.body_font_family),
    body_font_size: clampInt(raw?.body_font_size, 8, 24, base.body_font_size),
    body_font_weight: normalizeWeight(raw?.body_font_weight, base.body_font_weight),
    body_color: normalizeColor(raw?.body_color, base.body_color),
    body_font_style: normalizeFontStyle(raw?.body_font_style, base.body_font_style),
    body_line_height: clampFloat(raw?.body_line_height, 1, 2.5, base.body_line_height),
    body_align: normalizeAlign(raw?.body_align, base.body_align),
    sign_block_position: normalizeSignAlign(legacyBlock, base.sign_block_position),
    sign_content_align: normalizeSignAlign(legacyContent, base.sign_content_align),
    sign_meta_layout: normalizeSignMetaLayout(raw?.sign_meta_layout, base.sign_meta_layout),
    sign_meta_order: normalizeSignMetaOrder(raw?.sign_meta_order, base.sign_meta_order),
  }
}

export function dokumenHeaderStyleVars(style: DokumenHeaderStyle): Record<string, string> {
  return {
    ['--dok-header-font-family' as string]: resolveFontFamilyCss(style.header_font_family),
    ['--dok-header-size' as string]: `${style.header_font_size}px`,
    ['--dok-header-weight' as string]: style.header_font_weight,
    ['--dok-header-align' as string]: style.header_align,
    ['--dok-header-color' as string]: style.header_color,
    ['--dok-header-transform' as string]: style.header_text_transform,
    ['--dok-header-letter-spacing' as string]: `${style.header_letter_spacing}px`,
    ['--dok-header-font-style' as string]: style.header_font_style,
    ['--dok-header-decoration' as string]: resolveTextDecoration(
      style.header_underline,
      style.header_strikethrough,
    ),
    ['--dok-header-line-height' as string]: String(style.header_line_height),
    ['--dok-detail-font-family' as string]: resolveFontFamilyCss(style.header_detail_font_family),
    ['--dok-detail-size' as string]: `${style.header_detail_font_size}px`,
    ['--dok-detail-weight' as string]: style.header_detail_font_weight,
    ['--dok-detail-color' as string]: style.header_detail_color,
    ['--dok-detail-align' as string]: style.header_detail_align,
    ['--dok-detail-transform' as string]: style.header_detail_text_transform,
    ['--dok-detail-letter-spacing' as string]: `${style.header_detail_letter_spacing}px`,
    ['--dok-detail-font-style' as string]: style.header_detail_font_style,
    ['--dok-detail-decoration' as string]: resolveTextDecoration(
      style.header_detail_underline,
      style.header_detail_strikethrough,
    ),
    ['--dok-detail-line-height' as string]: String(style.header_detail_line_height),
    ['--dok-logo-h' as string]: `${style.logo_max_height}px`,
    ['--dok-logo-w' as string]: `${style.logo_max_width}px`,
    ['--dok-brand-border-w' as string]: `${style.brand_border_width}px`,
    ['--dok-brand-border-color' as string]: style.brand_border_color,
    ['--dok-footer-font-family' as string]: resolveFontFamilyCss(style.footer_font_family),
    ['--dok-footer-size' as string]: `${style.footer_font_size}px`,
    ['--dok-footer-transform' as string]: style.footer_text_transform,
    ['--dok-footer-letter-spacing' as string]: `${style.footer_letter_spacing}px`,
    ['--dok-footer-font-style' as string]: style.footer_font_style,
    ['--dok-footer-weight' as string]: style.footer_font_weight,
    ['--dok-footer-decoration' as string]: resolveTextDecoration(
      style.footer_underline,
      style.footer_strikethrough,
    ),
    ['--dok-footer-line-height' as string]: String(style.footer_line_height),
    ['--dok-body-font-family' as string]: resolveFontFamilyCss(style.body_font_family),
    ['--dok-body-size' as string]: `${style.body_font_size}px`,
    ['--dok-body-weight' as string]: style.body_font_weight,
    ['--dok-body-color' as string]: style.body_color,
    ['--dok-body-font-style' as string]: style.body_font_style,
    ['--dok-body-line-height' as string]: String(style.body_line_height),
    ['--dok-body-align' as string]: style.body_align,
    ['--dok-sign-block-position' as string]: style.sign_block_position,
    ['--dok-sign-content-align' as string]: style.sign_content_align,
  }
}

export const DOKUMEN_SIGN_ALIGNS: Array<{ value: DokumenSignAlign; label: string }> = [
  { value: 'left', label: 'Kiri' },
  { value: 'center', label: 'Tengah' },
  { value: 'right', label: 'Kanan' },
]

export function formatSignLayoutLabel(
  blockPosition: DokumenSignAlign,
  contentAlign: DokumenSignAlign,
): string {
  const block = DOKUMEN_SIGN_ALIGNS.find((item) => item.value === blockPosition)?.label ?? blockPosition
  const content = DOKUMEN_SIGN_ALIGNS.find((item) => item.value === contentAlign)?.label ?? contentAlign
  return `${block} · ${content}`
}

export const DOKUMEN_SIGN_META_LAYOUTS: Array<{
  value: DokumenHeaderStyle['sign_meta_layout']
  label: string
}> = [
  { value: 'stack', label: 'Baris terpisah' },
  { value: 'inline', label: 'Satu baris' },
]

export const DOKUMEN_SIGN_META_ORDERS: Array<{
  value: DokumenHeaderStyle['sign_meta_order']
  label: string
}> = [
  { value: 'name_first', label: 'Nama lalu HP' },
  { value: 'phone_first', label: 'HP lalu nama' },
]

export const DOKUMEN_FONT_WEIGHTS = FONT_WEIGHTS

export const DOKUMEN_TEXT_ALIGNS: Array<{ value: DokumenHeaderStyle['header_align']; label: string }> = [
  { value: 'left', label: 'Rata kiri' },
  { value: 'center', label: 'Rata tengah' },
  { value: 'right', label: 'Rata kanan' },
  { value: 'justify', label: 'Rata kiri-kanan' },
]

export const DOKUMEN_LINE_HEIGHT_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Tunggal (1,0)' },
  { value: 1.15, label: '1,15' },
  { value: 1.25, label: '1,25' },
  { value: 1.5, label: '1,5' },
  { value: 2, label: 'Ganda (2,0)' },
  { value: 2.5, label: '2,5' },
]

export const DOKUMEN_TEXT_TRANSFORMS: Array<{ value: DokumenTextTransform; label: string }> = [
  { value: 'none', label: 'Normal' },
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
]

export const DOKUMEN_FONT_STYLES: Array<{ value: DokumenFontStyle; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
]

export const DOKUMEN_PAPER_SIZES: Array<{ value: DokumenPaperSize; label: string }> = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
  { value: 'legal', label: 'Legal' },
  { value: 'a5', label: 'A5' },
  { value: 'folio', label: 'F4 / Folio' },
]

export const DOKUMEN_PAPER_ORIENTATIONS: Array<{
  value: DokumenPaperOrientation
  label: string
}> = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
]

const PAPER_CSS_SIZE: Record<DokumenPaperSize, string> = {
  a4: 'A4',
  letter: 'letter',
  legal: 'legal',
  a5: 'A5',
  folio: '215mm 330mm',
}

export function resolvePaperPageCss(paper: DokumenPaperConfig): string {
  const normalized = normalizeDokumenPaper(paper)
  const size = PAPER_CSS_SIZE[normalized.paper_size] || PAPER_CSS_SIZE.a4
  return `${size} ${normalized.paper_orientation}`
}
