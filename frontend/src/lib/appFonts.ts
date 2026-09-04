/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:37:38
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 14:37:38
 */

export type AppFontPreset = {
  id: string
  label: string
  stack: string
  /** Google Fonts family query fragment, null = system / local only */
  google: string | null
  category: 'serif' | 'sans' | 'display' | 'system'
}

/** Preset font aplikasi (header/display + body). */
export const APP_FONT_PRESETS: AppFontPreset[] = [
  {
    id: 'fraunces',
    label: 'Fraunces',
    stack: '"Fraunces", Georgia, serif',
    google: 'Fraunces:opsz,wght@9..144,500;9..144,600',
    category: 'display',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    stack: '"Playfair Display", Georgia, serif',
    google: 'Playfair+Display:wght@500;600;700',
    category: 'display',
  },
  {
    id: 'lora',
    label: 'Lora',
    stack: '"Lora", Georgia, serif',
    google: 'Lora:wght@400;600;700',
    category: 'serif',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    stack: '"Merriweather", Georgia, serif',
    google: 'Merriweather:wght@400;700',
    category: 'serif',
  },
  {
    id: 'source-sans-3',
    label: 'Source Sans 3',
    stack: '"Source Sans 3", system-ui, sans-serif',
    google: 'Source+Sans+3:wght@400;500;600',
    category: 'sans',
  },
  {
    id: 'inter',
    label: 'Inter',
    stack: '"Inter", system-ui, sans-serif',
    google: 'Inter:wght@400;500;600;700',
    category: 'sans',
  },
  {
    id: 'nunito',
    label: 'Nunito',
    stack: '"Nunito", system-ui, sans-serif',
    google: 'Nunito:wght@400;600;700',
    category: 'sans',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    stack: '"Poppins", system-ui, sans-serif',
    google: 'Poppins:wght@400;500;600;700',
    category: 'sans',
  },
  {
    id: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    stack: '"IBM Plex Sans", system-ui, sans-serif',
    google: 'IBM+Plex+Sans:wght@400;500;600;700',
    category: 'sans',
  },
  {
    id: 'open-sans',
    label: 'Open Sans',
    stack: '"Open Sans", system-ui, sans-serif',
    google: 'Open+Sans:wght@400;500;600;700',
    category: 'sans',
  },
  {
    id: 'system-ui',
    label: 'System UI',
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    google: null,
    category: 'system',
  },
  {
    id: 'georgia',
    label: 'Georgia',
    stack: 'Georgia, "Times New Roman", Times, serif',
    google: null,
    category: 'system',
  },
]

export const DEFAULT_FONT_DISPLAY = 'fraunces'
export const DEFAULT_FONT_BODY = 'source-sans-3'

export const APP_FONT_PRESET_IDS = APP_FONT_PRESETS.map((preset) => preset.id)

export function resolveFontPreset(id?: string | null): AppFontPreset | null {
  if (!id) return null
  return APP_FONT_PRESETS.find((preset) => preset.id === id) ?? null
}

export function fontPresetOptions() {
  return [
    { value: '', label: 'Default aplikasi' },
    ...APP_FONT_PRESETS.map((preset) => ({
      value: preset.id,
      label: preset.label,
    })),
  ]
}

export function ensureAppFontsLoaded(displayId?: string | null, bodyId?: string | null): void {
  if (typeof document === 'undefined') return

  const families = new Set<string>()
  for (const id of [displayId, bodyId]) {
    const preset = resolveFontPreset(id)
    if (preset?.google) {
      families.add(preset.google)
    }
  }

  // Always keep defaults available for fallback / empty konfig
  const fraunces = resolveFontPreset(DEFAULT_FONT_DISPLAY)
  const sourceSans = resolveFontPreset(DEFAULT_FONT_BODY)
  if (fraunces?.google) families.add(fraunces.google)
  if (sourceSans?.google) families.add(sourceSans.google)

  const href =
    families.size === 0
      ? null
      : `https://fonts.googleapis.com/css2?${[...families].map((family) => `family=${family}`).join('&')}&display=swap`

  const linkId = 'sijama-app-fonts'
  let link = document.getElementById(linkId) as HTMLLinkElement | null
  if (!href) {
    link?.remove()
    return
  }

  if (!link) {
    link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) {
    link.href = href
  }
}
