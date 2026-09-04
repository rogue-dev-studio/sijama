/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

import type { CSSProperties } from 'react'
import type { AppPublicSettings } from '../api/types'
import {
  normalizeBackgroundRepeatSize,
  normalizeBackgroundStyle,
  resolveBackgroundRepeatSizeCss,
  type BackgroundStyle,
} from './backgroundStyle'
import { resolveKonfigAssetUrl } from './konfigAsset'

const BG_PATTERN_URL = '/bg-pattern.svg'
const BG_PATTERN_SIZE = '28px 28px'

function applyBackgroundLayers(
  style: CSSProperties,
  backgroundUrl: string,
  backgroundStyle: BackgroundStyle,
  repeatSize?: string | null,
): void {
  style.backgroundImage = `url("${backgroundUrl}")`

  switch (backgroundStyle) {
    case 'repeat':
      style.backgroundRepeat = 'repeat'
      style.backgroundSize = resolveBackgroundRepeatSizeCss(repeatSize)
      style.backgroundPosition = 'top left'
      break
    case 'contain':
      style.backgroundRepeat = 'no-repeat'
      style.backgroundSize = 'contain'
      style.backgroundPosition = 'center'
      break
    case 'stretch':
      style.backgroundRepeat = 'no-repeat'
      style.backgroundSize = '100% 100%'
      style.backgroundPosition = 'center'
      break
    case 'cover':
    default:
      style.backgroundRepeat = 'no-repeat'
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
      break
  }
}

export function buildMaintenancePageStyle(settings: AppPublicSettings): CSSProperties {
  const style: CSSProperties = {}
  const dedicatedUrl = resolveKonfigAssetUrl(settings.path_maintenance_background)
  const fallbackUrl = resolveKonfigAssetUrl(settings.path_background)
  const backgroundUrl = dedicatedUrl ?? fallbackUrl
  const backgroundStyle = normalizeBackgroundStyle(
    settings.maintenance_background_style ?? settings.background_style,
  )
  const repeatSize = normalizeBackgroundRepeatSize(
    settings.maintenance_background_repeat_size ?? settings.background_repeat_size,
  )

  if (backgroundUrl) {
    applyBackgroundLayers(style, backgroundUrl, backgroundStyle, repeatSize)
  } else {
    style.backgroundImage = `url("${BG_PATTERN_URL}")`
    style.backgroundRepeat = 'repeat'
    style.backgroundSize = BG_PATTERN_SIZE
    style.backgroundPosition = 'top left'
  }

  if (settings.color_bg?.trim()) {
    style.backgroundColor = settings.color_bg.trim()
  }

  return style
}

export function buildAuthGatePageStyle(settings: AppPublicSettings): CSSProperties {
  const style: CSSProperties = {}
  const backgroundUrl = resolveKonfigAssetUrl(settings.path_background)
  const backgroundStyle = normalizeBackgroundStyle(settings.background_style)
  const repeatSize = normalizeBackgroundRepeatSize(settings.background_repeat_size)

  if (backgroundUrl) {
    applyBackgroundLayers(style, backgroundUrl, backgroundStyle, repeatSize)
  } else {
    style.backgroundImage = `url("${BG_PATTERN_URL}")`
    style.backgroundRepeat = 'repeat'
    style.backgroundSize = BG_PATTERN_SIZE
    style.backgroundPosition = 'top left'
  }

  if (settings.color_bg?.trim()) {
    style.backgroundColor = settings.color_bg.trim()
  }

  return style
}
