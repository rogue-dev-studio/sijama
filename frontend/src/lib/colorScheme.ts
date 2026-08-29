/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:05:00
 */

export type ColorSchemePreference = 'light' | 'dark' | 'system'
export type EffectiveColorScheme = 'light' | 'dark'

export const COLOR_SCHEME_STORAGE_KEY = 'sijama.color_scheme'

export const COLOR_SCHEME_LABELS: Record<ColorSchemePreference, string> = {
  light: 'Terang',
  dark: 'Gelap',
  system: 'Ikuti sistem',
}

export function readStoredColorSchemePreference(): ColorSchemePreference {
  try {
    const stored = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    /* ignore quota / private mode */
  }
  return 'light'
}

export function writeStoredColorSchemePreference(preference: ColorSchemePreference): void {
  try {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference)
  } catch {
    /* ignore quota / private mode */
  }
}

export function resolveEffectiveColorScheme(
  preference: ColorSchemePreference,
): EffectiveColorScheme {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function applyColorSchemeToDocument(preference: ColorSchemePreference): EffectiveColorScheme {
  const effective = resolveEffectiveColorScheme(preference)
  document.documentElement.dataset.theme = effective
  document.documentElement.style.colorScheme = effective
  return effective
}
