/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:54:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:16:00
 */

import type { AppPublicSettings } from '../api/types'
import { normalizeBackgroundStyle, resolveBackgroundRepeatSizeCss, type BackgroundStyle } from './backgroundStyle'
import { resolveKonfigAssetUrl } from './konfigAsset'

const BG_PATTERN_URL = '/bg-pattern.svg'
const BG_PATTERN_SIZE = '28px 28px'

const THEME_CSS_VARS: Record<string, string> = {
  color_bg: '--color-bg',
  color_surface: '--color-surface',
  color_ink: '--color-ink',
  color_accent: '--color-accent',
  color_accent_soft: '--color-accent-soft',
  color_muted: '--color-muted',
  color_border: '--color-border',
}

function mixHex(hex: string, withBlackRatio: number): string | null {
  const normalized = hex.trim().replace(/^#/, '')
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return null
  }

  const keep = 1 - withBlackRatio
  const r = Math.round(parseInt(normalized.slice(0, 2), 16) * keep)
  const g = Math.round(parseInt(normalized.slice(2, 4), 16) * keep)
  const b = Math.round(parseInt(normalized.slice(4, 6), 16) * keep)

  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

function applyDefaultPatternBackground(): void {
  document.body.style.backgroundImage = `url("${BG_PATTERN_URL}")`
  document.body.style.backgroundRepeat = 'repeat'
  document.body.style.backgroundSize = BG_PATTERN_SIZE
  document.body.style.removeProperty('background-position')
  document.body.style.removeProperty('background-attachment')
}

function applyUploadedBackground(
  backgroundUrl: string,
  style: BackgroundStyle,
  repeatSize?: string | null,
): void {
  document.body.style.backgroundImage = `url("${backgroundUrl}")`

  switch (style) {
    case 'repeat':
      document.body.style.backgroundRepeat = 'repeat'
      document.body.style.backgroundSize = resolveBackgroundRepeatSizeCss(repeatSize)
      document.body.style.backgroundPosition = 'top left'
      document.body.style.backgroundAttachment = 'scroll'
      break
    case 'contain':
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundSize = 'contain'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      break
    case 'stretch':
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundSize = '100% 100%'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      break
    case 'cover':
    default:
      document.body.style.backgroundRepeat = 'no-repeat'
      document.body.style.backgroundSize = 'cover'
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundAttachment = 'fixed'
      break
  }
}

export function applyAppTheme(settings: AppPublicSettings): void {
  const root = document.documentElement

  for (const [field, cssVar] of Object.entries(THEME_CSS_VARS)) {
    const value = settings[field as keyof AppPublicSettings]
    if (typeof value === 'string' && value.trim()) {
      root.style.setProperty(cssVar, value.trim())
    } else {
      root.style.removeProperty(cssVar)
    }
  }

  const accent = typeof settings.color_accent === 'string' ? settings.color_accent.trim() : ''
  if (accent) {
    const hover = mixHex(accent, 0.22)
    if (hover) {
      root.style.setProperty('--color-accent-hover', hover)
    } else {
      root.style.removeProperty('--color-accent-hover')
    }
  } else {
    root.style.removeProperty('--color-accent-hover')
  }

  const backgroundUrl = resolveKonfigAssetUrl(settings.path_background)
  const backgroundStyle = normalizeBackgroundStyle(settings.background_style)

  if (backgroundUrl) {
    applyUploadedBackground(backgroundUrl, backgroundStyle, settings.background_repeat_size)
  } else {
    applyDefaultPatternBackground()
  }

  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (themeMeta) {
    if (settings.theme_color?.trim()) {
      themeMeta.content = settings.theme_color.trim()
    } else if (settings.color_accent?.trim()) {
      themeMeta.content = settings.color_accent.trim()
    }
  }
}
