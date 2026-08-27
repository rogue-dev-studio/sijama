/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:19:21
 */

export const BACKGROUND_STYLE_OPTIONS = [
  { value: 'cover', label: 'Cover (penuh / lebar)' },
  { value: 'repeat', label: 'Repeat (berulang)' },
  { value: 'contain', label: 'Contain (muat tanpa crop)' },
  { value: 'stretch', label: 'Stretch (regang penuh)' },
] as const

export type BackgroundStyle = (typeof BACKGROUND_STYLE_OPTIONS)[number]['value']

export const DEFAULT_BACKGROUND_STYLE: BackgroundStyle = 'cover'

export const BACKGROUND_REPEAT_SIZE_OPTIONS = [
  { value: 'auto', label: 'Asli (ukuran file)' },
  { value: '16px', label: '16px — sangat halus' },
  { value: '24px', label: '24px — halus' },
  { value: '28px', label: '28px — pola SIJAMA' },
  { value: '32px', label: '32px — kecil' },
  { value: '40px', label: '40px' },
  { value: '48px', label: '48px — sedang' },
  { value: '64px', label: '64px' },
  { value: '80px', label: '80px — besar' },
  { value: '96px', label: '96px' },
  { value: '128px', label: '128px — sangat besar' },
  { value: '160px', label: '160px' },
  { value: '200px', label: '200px' },
  { value: '256px', label: '256px' },
] as const

export type BackgroundRepeatSize = (typeof BACKGROUND_REPEAT_SIZE_OPTIONS)[number]['value']

export const DEFAULT_BACKGROUND_REPEAT_SIZE: BackgroundRepeatSize = '28px'

const ALLOWED_REPEAT_SIZES = new Set<string>(BACKGROUND_REPEAT_SIZE_OPTIONS.map((item) => item.value))

export function normalizeBackgroundStyle(value: string | null | undefined): BackgroundStyle {
  if (value === 'repeat' || value === 'cover' || value === 'contain' || value === 'stretch') {
    return value
  }

  return DEFAULT_BACKGROUND_STYLE
}

export function normalizeBackgroundRepeatSize(value: string | null | undefined): BackgroundRepeatSize {
  const trimmed = (value ?? '').trim().toLowerCase()
  if (ALLOWED_REPEAT_SIZES.has(trimmed)) {
    return trimmed as BackgroundRepeatSize
  }

  return DEFAULT_BACKGROUND_REPEAT_SIZE
}

export function resolveBackgroundRepeatSizeCss(size: string | null | undefined): string {
  const normalized = normalizeBackgroundRepeatSize(size)
  if (normalized === 'auto') {
    return 'auto'
  }

  return `${normalized} ${normalized}`
}
