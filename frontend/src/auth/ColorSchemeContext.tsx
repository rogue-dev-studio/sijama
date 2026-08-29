/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:05:00
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { applyAppTheme } from '../lib/appTheme'
import {
  applyColorSchemeToDocument,
  readStoredColorSchemePreference,
  resolveEffectiveColorScheme,
  writeStoredColorSchemePreference,
  type ColorSchemePreference,
  type EffectiveColorScheme,
} from '../lib/colorScheme'
import { useAppSettings } from './AppSettingsContext'

type ColorSchemeContextValue = {
  preference: ColorSchemePreference
  effectiveScheme: EffectiveColorScheme
  setPreference: (next: ColorSchemePreference) => void
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null)

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppSettings()
  const [preference, setPreferenceState] = useState<ColorSchemePreference>(() =>
    readStoredColorSchemePreference(),
  )
  const [effectiveScheme, setEffectiveScheme] = useState<EffectiveColorScheme>(() =>
    resolveEffectiveColorScheme(readStoredColorSchemePreference()),
  )

  const setPreference = useCallback((next: ColorSchemePreference) => {
    writeStoredColorSchemePreference(next)
    setPreferenceState(next)
    setEffectiveScheme(applyColorSchemeToDocument(next))
  }, [])

  useEffect(() => {
    setEffectiveScheme(applyColorSchemeToDocument(preference))
  }, [preference])

  useEffect(() => {
    applyAppTheme(settings, effectiveScheme)
  }, [settings, effectiveScheme])

  useEffect(() => {
    if (preference !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      setEffectiveScheme(applyColorSchemeToDocument('system'))
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  const value = useMemo(
    () => ({ preference, effectiveScheme, setPreference }),
    [preference, effectiveScheme, setPreference],
  )

  return <ColorSchemeContext.Provider value={value}>{children}</ColorSchemeContext.Provider>
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext)
  if (!ctx) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider')
  }
  return ctx
}
