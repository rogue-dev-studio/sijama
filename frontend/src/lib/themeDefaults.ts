/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:10:54
 */

import { DEFAULT_BACKGROUND_STYLE, DEFAULT_BACKGROUND_REPEAT_SIZE } from './backgroundStyle'

export type ThemeColorSet = {
  color_bg: string
  color_surface: string
  color_ink: string
  color_accent: string
  color_accent_soft: string
  color_muted: string
  color_border: string
  theme_color: string
}

export type ThemePalette = {
  id: string
  name: string
  description: string
  colors: ThemeColorSet
}

export const DEFAULT_THEME_COLORS: ThemeColorSet = {
  color_bg: '#f7f4ef',
  color_surface: '#ffffff',
  color_ink: '#1a2e28',
  color_accent: '#0f6b4c',
  color_accent_soft: '#d8eee4',
  color_muted: '#5c6b64',
  color_border: '#d4ddd8',
  theme_color: '#0f6b4c',
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'sijama-hijau',
    name: 'SIJAMA Hijau',
    description: 'Hijau forest & krem hangat — bawaan aplikasi',
    colors: { ...DEFAULT_THEME_COLORS },
  },
  {
    id: 'laut-biru',
    name: 'Laut Biru',
    description: 'Biru laut tenang dengan permukaan bersih',
    colors: {
      color_bg: '#eef4f8',
      color_surface: '#ffffff',
      color_ink: '#14283a',
      color_accent: '#1a6f9a',
      color_accent_soft: '#d4e8f3',
      color_muted: '#5a7388',
      color_border: '#c8d8e4',
      theme_color: '#1a6f9a',
    },
  },
  {
    id: 'teh-sage',
    name: 'Teh Sage',
    description: 'Sage lembut, nuansa natural dan tenang',
    colors: {
      color_bg: '#f3f5f0',
      color_surface: '#ffffff',
      color_ink: '#243028',
      color_accent: '#5b7a5e',
      color_accent_soft: '#e0ebe1',
      color_muted: '#66756a',
      color_border: '#d2ddd4',
      theme_color: '#5b7a5e',
    },
  },
  {
    id: 'emas-masjid',
    name: 'Emas Masjid',
    description: 'Emas hangat dengan tinta coklat zaitun',
    colors: {
      color_bg: '#f8f3e8',
      color_surface: '#fffdf8',
      color_ink: '#2c2418',
      color_accent: '#9a6b1f',
      color_accent_soft: '#f0e2c4',
      color_muted: '#7a6a4e',
      color_border: '#e2d4b8',
      theme_color: '#9a6b1f',
    },
  },
  {
    id: 'maroon-klasik',
    name: 'Maroon Klasik',
    description: 'Maroon elegan untuk kesan formal',
    colors: {
      color_bg: '#f7f1f0',
      color_surface: '#ffffff',
      color_ink: '#2a1618',
      color_accent: '#8b2e3a',
      color_accent_soft: '#f0d8dc',
      color_muted: '#7a5a5e',
      color_border: '#e2cdd0',
      theme_color: '#8b2e3a',
    },
  },
  {
    id: 'slate-netral',
    name: 'Slate Netral',
    description: 'Abu profesional, fokus ke konten',
    colors: {
      color_bg: '#f2f4f6',
      color_surface: '#ffffff',
      color_ink: '#1c2430',
      color_accent: '#3d5a73',
      color_accent_soft: '#d9e3ec',
      color_muted: '#5f6d7a',
      color_border: '#cfd7de',
      theme_color: '#3d5a73',
    },
  },
  {
    id: 'indigo-senja',
    name: 'Indigo Senja',
    description: 'Indigo dalam dengan aksen lembut',
    colors: {
      color_bg: '#f2f1f7',
      color_surface: '#ffffff',
      color_ink: '#1e1a32',
      color_accent: '#4f46a8',
      color_accent_soft: '#ddd9f2',
      color_muted: '#6a6580',
      color_border: '#d2cee3',
      theme_color: '#4f46a8',
    },
  },
]

export const DEFAULT_THEME_FORM = {
  path_background: '',
  background_style: DEFAULT_BACKGROUND_STYLE,
  background_repeat_size: DEFAULT_BACKGROUND_REPEAT_SIZE,
  color_bg: '',
  color_surface: '',
  color_ink: '',
  color_accent: '',
  color_accent_soft: '',
  color_muted: '',
  color_border: '',
  theme_color: '',
  font_family_display: '',
  font_family_body: '',
} as const

export const THEME_COLOR_FIELDS = [
  'color_bg',
  'color_surface',
  'color_ink',
  'color_accent',
  'color_accent_soft',
  'color_muted',
  'color_border',
  'theme_color',
] as const

function normalizeHexValue(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim().toLowerCase()
  if (!trimmed) {
    return ''
  }
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`
}

export function resolveThemeColors(partial: Partial<Record<keyof ThemeColorSet, string | null | undefined>>): ThemeColorSet {
  return {
    color_bg: normalizeHexValue(partial.color_bg) || DEFAULT_THEME_COLORS.color_bg,
    color_surface: normalizeHexValue(partial.color_surface) || DEFAULT_THEME_COLORS.color_surface,
    color_ink: normalizeHexValue(partial.color_ink) || DEFAULT_THEME_COLORS.color_ink,
    color_accent: normalizeHexValue(partial.color_accent) || DEFAULT_THEME_COLORS.color_accent,
    color_accent_soft: normalizeHexValue(partial.color_accent_soft) || DEFAULT_THEME_COLORS.color_accent_soft,
    color_muted: normalizeHexValue(partial.color_muted) || DEFAULT_THEME_COLORS.color_muted,
    color_border: normalizeHexValue(partial.color_border) || DEFAULT_THEME_COLORS.color_border,
    theme_color: normalizeHexValue(partial.theme_color) || DEFAULT_THEME_COLORS.theme_color,
  }
}

export function matchThemePaletteId(
  partial: Partial<Record<keyof ThemeColorSet, string | null | undefined>>,
): string | null {
  const resolved = resolveThemeColors(partial)
  const matched = THEME_PALETTES.find((palette) =>
    THEME_COLOR_FIELDS.every((field) => normalizeHexValue(palette.colors[field]) === resolved[field]),
  )
  return matched?.id ?? null
}
