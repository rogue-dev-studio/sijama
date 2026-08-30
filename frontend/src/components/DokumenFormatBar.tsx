/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 14:46:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 14:55:00
 */

import type { DokumenHeaderStyle, DokumenTextTransform } from '../api/types'
import {
  DOKUMEN_FONT_FAMILIES,
  DOKUMEN_LINE_HEIGHT_OPTIONS,
  DOKUMEN_TEXT_TRANSFORMS,
} from '../lib/dokumenStyle'
import {
  IconAlignCenter,
  IconAlignJustify,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconItalic,
  IconLetterSpacing,
  IconLineSpacing,
  IconStrikethrough,
  IconTextCase,
  IconUnderline,
} from './FormatToolbarIcons'

export type DokumenFormatSection = 'header' | 'detail' | 'footer' | 'body'

type SectionFieldMap = {
  fontFamily: keyof DokumenHeaderStyle
  fontSize: keyof DokumenHeaderStyle
  fontWeight?: keyof DokumenHeaderStyle
  align?: keyof DokumenHeaderStyle
  color?: keyof DokumenHeaderStyle
  textTransform?: keyof DokumenHeaderStyle
  letterSpacing?: keyof DokumenHeaderStyle
  fontStyle: keyof DokumenHeaderStyle
  underline?: keyof DokumenHeaderStyle
  strikethrough?: keyof DokumenHeaderStyle
  lineHeight?: keyof DokumenHeaderStyle
}

const SECTION_FIELDS: Record<DokumenFormatSection, SectionFieldMap> = {
  header: {
    fontFamily: 'header_font_family',
    fontSize: 'header_font_size',
    fontWeight: 'header_font_weight',
    align: 'header_align',
    color: 'header_color',
    textTransform: 'header_text_transform',
    letterSpacing: 'header_letter_spacing',
    fontStyle: 'header_font_style',
    underline: 'header_underline',
    strikethrough: 'header_strikethrough',
    lineHeight: 'header_line_height',
  },
  detail: {
    fontFamily: 'header_detail_font_family',
    fontSize: 'header_detail_font_size',
    fontWeight: 'header_detail_font_weight',
    align: 'header_detail_align',
    color: 'header_detail_color',
    textTransform: 'header_detail_text_transform',
    letterSpacing: 'header_detail_letter_spacing',
    fontStyle: 'header_detail_font_style',
    underline: 'header_detail_underline',
    strikethrough: 'header_detail_strikethrough',
    lineHeight: 'header_detail_line_height',
  },
  footer: {
    fontFamily: 'footer_font_family',
    fontSize: 'footer_font_size',
    fontWeight: 'footer_font_weight',
    textTransform: 'footer_text_transform',
    letterSpacing: 'footer_letter_spacing',
    fontStyle: 'footer_font_style',
    underline: 'footer_underline',
    strikethrough: 'footer_strikethrough',
    lineHeight: 'footer_line_height',
  },
  body: {
    fontFamily: 'body_font_family',
    fontSize: 'body_font_size',
    fontWeight: 'body_font_weight',
    align: 'body_align',
    color: 'body_color',
    fontStyle: 'body_font_style',
    lineHeight: 'body_line_height',
  },
}

const FONT_SIZE_OPTIONS: Record<DokumenFormatSection, number[]> = {
  header: [10, 12, 14, 16, 17, 18, 20, 24, 28, 32, 36, 48],
  detail: [8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36],
  footer: [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24],
  body: [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24],
}

const ALIGN_OPTIONS = [
  { value: 'left', title: 'Rata kiri', Icon: IconAlignLeft },
  { value: 'center', title: 'Rata tengah', Icon: IconAlignCenter },
  { value: 'right', title: 'Rata kanan', Icon: IconAlignRight },
  { value: 'justify', title: 'Rata kiri-kanan', Icon: IconAlignJustify },
] as const

type Props = {
  section: DokumenFormatSection
  label: string
  style: DokumenHeaderStyle
  disabled?: boolean
  idPrefix: string
  onChange: <K extends keyof DokumenHeaderStyle>(key: K, value: DokumenHeaderStyle[K]) => void
}

function isBold(weight: string): boolean {
  return Number(weight) >= 600
}

function toggleBold(weight: string): string {
  return isBold(weight) ? '400' : '650'
}

export function DokumenFormatBar({ section, label, style, disabled, idPrefix, onChange }: Props) {
  const fields = SECTION_FIELDS[section]
  const sizeOptions = FONT_SIZE_OPTIONS[section]

  const fontFamily = style[fields.fontFamily] as DokumenHeaderStyle['header_font_family']
  const fontSize = style[fields.fontSize] as number
  const fontWeight = fields.fontWeight ? (style[fields.fontWeight] as string) : null
  const fontStyle = style[fields.fontStyle] as DokumenHeaderStyle['header_font_style']
  const textTransform = fields.textTransform
    ? (style[fields.textTransform] as DokumenTextTransform)
    : null
  const letterSpacing = fields.letterSpacing ? (style[fields.letterSpacing] as number) : null
  const underline = fields.underline ? (style[fields.underline] as boolean) : null
  const strikethrough = fields.strikethrough ? (style[fields.strikethrough] as boolean) : null
  const align = fields.align ? (style[fields.align] as DokumenHeaderStyle['header_align']) : null
  const color = fields.color ? (style[fields.color] as string) : null
  const lineHeight = fields.lineHeight ? (style[fields.lineHeight] as number) : null

  return (
    <div className="dokumen-format-bar">
      <p className="dokumen-format-bar__label">{label}</p>
      <div className="dokumen-format-bar__rows">
        <div className="dokumen-format-bar__row">
          <select
            className="dokumen-format-bar__family"
            id={`${idPrefix}-family`}
            disabled={disabled}
            value={fontFamily}
            onChange={(event) =>
              onChange(
                fields.fontFamily,
                event.target.value as DokumenHeaderStyle[typeof fields.fontFamily],
              )
            }
            aria-label={`Jenis font ${label}`}
            style={{ fontFamily: DOKUMEN_FONT_FAMILIES.find((f) => f.value === fontFamily)?.css }}
          >
            {DOKUMEN_FONT_FAMILIES.map((option) => (
              <option key={option.value} value={option.value} style={{ fontFamily: option.css }}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="dokumen-format-bar__size"
            id={`${idPrefix}-size`}
            disabled={disabled}
            value={fontSize}
            onChange={(event) =>
              onChange(fields.fontSize, Number(event.target.value) as DokumenHeaderStyle[typeof fields.fontSize])
            }
            aria-label={`Ukuran font ${label}`}
          >
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <div className="dokumen-format-bar__group" role="group" aria-label={`Gaya ${label}`}>
            {fontWeight && fields.fontWeight ? (
              <button
                type="button"
                className={`dokumen-format-bar__btn dokumen-format-bar__btn--icon${isBold(fontWeight) ? ' is-active' : ''}`}
                disabled={disabled}
                aria-pressed={isBold(fontWeight)}
                title="Tebal"
                onClick={() =>
                  onChange(
                    fields.fontWeight!,
                    toggleBold(fontWeight) as DokumenHeaderStyle[typeof fields.fontWeight],
                  )
                }
              >
                <IconBold />
              </button>
            ) : null}
            <button
              type="button"
              className={`dokumen-format-bar__btn dokumen-format-bar__btn--icon${fontStyle === 'italic' ? ' is-active' : ''}`}
              disabled={disabled}
              aria-pressed={fontStyle === 'italic'}
              title="Miring"
              onClick={() =>
                onChange(
                  fields.fontStyle,
                  (fontStyle === 'italic' ? 'normal' : 'italic') as DokumenHeaderStyle[typeof fields.fontStyle],
                )
              }
            >
              <IconItalic />
            </button>
            {underline !== null && fields.underline ? (
              <button
                type="button"
                className={`dokumen-format-bar__btn dokumen-format-bar__btn--icon${underline ? ' is-active' : ''}`}
                disabled={disabled}
                aria-pressed={underline}
                title="Garis bawah"
                onClick={() =>
                  onChange(fields.underline!, !underline as DokumenHeaderStyle[typeof fields.underline])
                }
              >
                <IconUnderline />
              </button>
            ) : null}
            {strikethrough !== null && fields.strikethrough ? (
              <button
                type="button"
                className={`dokumen-format-bar__btn dokumen-format-bar__btn--icon${strikethrough ? ' is-active' : ''}`}
                disabled={disabled}
                aria-pressed={strikethrough}
                title="Coret"
                onClick={() =>
                  onChange(
                    fields.strikethrough!,
                    !strikethrough as DokumenHeaderStyle[typeof fields.strikethrough],
                  )
                }
              >
                <IconStrikethrough />
              </button>
            ) : null}
          </div>

          {color && fields.color ? (
            <label className="dokumen-format-bar__color" title="Warna teks">
              <span className="sr-only">Warna teks {label}</span>
              <input
                type="color"
                id={`${idPrefix}-color`}
                disabled={disabled}
                value={color}
                onChange={(event) =>
                  onChange(fields.color!, event.target.value as DokumenHeaderStyle[typeof fields.color])
                }
              />
            </label>
          ) : null}

          {textTransform !== null && fields.textTransform ? (
            <label className="dokumen-format-bar__combo" title="Kapitalisasi">
              <IconTextCase className="dokumen-format-bar__combo-icon" />
              <select
                className="dokumen-format-bar__transform"
                id={`${idPrefix}-transform`}
                disabled={disabled}
                value={textTransform}
                onChange={(event) =>
                  onChange(
                    fields.textTransform!,
                    event.target.value as DokumenHeaderStyle[typeof fields.textTransform],
                  )
                }
                aria-label={`Kapitalisasi ${label}`}
              >
                {DOKUMEN_TEXT_TRANSFORMS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <div className="dokumen-format-bar__row">
          {align && fields.align ? (
            <div className="dokumen-format-bar__group" role="group" aria-label={`Perataan ${label}`}>
              {ALIGN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`dokumen-format-bar__btn dokumen-format-bar__btn--icon${
                    align === option.value ? ' is-active' : ''
                  }`}
                  disabled={disabled}
                  aria-pressed={align === option.value}
                  title={option.title}
                  onClick={() =>
                    onChange(
                      fields.align!,
                      option.value as DokumenHeaderStyle[typeof fields.align],
                    )
                  }
                >
                  <option.Icon />
                </button>
              ))}
            </div>
          ) : null}

          {lineHeight !== null && fields.lineHeight ? (
            <label className="dokumen-format-bar__combo" title="Spasi baris">
              <IconLineSpacing className="dokumen-format-bar__combo-icon" />
              <select
                className="dokumen-format-bar__linespace"
                id={`${idPrefix}-line-height`}
                disabled={disabled}
                value={lineHeight}
                onChange={(event) =>
                  onChange(
                    fields.lineHeight!,
                    Number(event.target.value) as DokumenHeaderStyle[typeof fields.lineHeight],
                  )
                }
                aria-label={`Spasi baris ${label}`}
              >
                {DOKUMEN_LINE_HEIGHT_OPTIONS.some((option) => option.value === lineHeight) ? null : (
                  <option value={lineHeight}>{lineHeight}</option>
                )}
                {DOKUMEN_LINE_HEIGHT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {letterSpacing !== null && fields.letterSpacing ? (
            <label className="dokumen-format-bar__combo" title="Jarak huruf (px)">
              <IconLetterSpacing className="dokumen-format-bar__combo-icon" />
              <select
                className="dokumen-format-bar__letterspace"
                id={`${idPrefix}-letter-spacing`}
                disabled={disabled}
                value={letterSpacing}
                onChange={(event) =>
                  onChange(
                    fields.letterSpacing!,
                    Number(event.target.value) as DokumenHeaderStyle[typeof fields.letterSpacing],
                  )
                }
                aria-label={`Jarak huruf ${label}`}
              >
                {[-1, 0, 1, 2, 3, 4, 6, 8, 10, 12].map((value) => (
                  <option key={value} value={value}>
                    {value}px
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>
    </div>
  )
}
