/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:56:22
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:56:22
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
import { aplikasiKonfigService } from '../api/services'
import type { AppPublicSettings } from '../api/types'
import { buildBrowserTabTitle } from '../lib/appBrand'
import { applyAppTheme } from '../lib/appTheme'
import { resolveKonfigAssetUrl } from '../lib/konfigAsset'

const FALLBACK_SETTINGS: AppPublicSettings = {
  app_nama: 'SIJAMA',
  nama_instansi: 'Sistem Informasi Jamaah',
  alamat: null,
  telepon: null,
  email_kontak: null,
  timezone: 'Asia/Jakarta',
  locale: 'id',
  header: 'SIJAMA',
  footer: 'Rogue Development',
  website: 'https://github.com/rogue-dev-studio',
  footer_link: 'https://github.com/rogue-dev-studio',
  footer_detail: 'Rogue Dev Studio · @rogue-dev-studio',
  footer_detail_link: 'https://github.com/rogue-dev-studio',
  header_detail: 'Sistem Informasi Jamaah',
  path_logoheader: null,
  path_favicon: null,
  path_logofooter: null,
  path_background: null,
  background_style: 'cover',
  background_repeat_size: '28px',
  color_bg: null,
  color_surface: null,
  color_ink: null,
  color_accent: null,
  color_accent_soft: null,
  color_muted: null,
  color_border: null,
  theme_color: null,
  maintenance_mode: false,
  maintenance_message: 'Aplikasi sedang dalam perawatan. Silakan coba lagi nanti.',
}

interface AppSettingsContextValue {
  settings: AppPublicSettings
  loading: boolean
  applySettings: (next: AppPublicSettings) => void
  refreshSettings: () => Promise<void>
}

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)

function applyDocumentLink(rel: 'icon' | 'apple-touch-icon', path?: string | null) {
  const selector = `link[rel='${rel}']`
  const href = path ? resolveKonfigAssetUrl(path) : null
  const existing = document.querySelector<HTMLLinkElement>(selector)

  if (!href) {
    existing?.remove()
    return
  }

  const link = existing ?? document.createElement('link')
  link.rel = rel
  link.removeAttribute('type')
  link.href = href

  if (!existing) {
    document.head.appendChild(link)
  }
}

function applyDocumentMeta(settings: AppPublicSettings) {
  document.title = buildBrowserTabTitle(settings)

  applyDocumentLink('icon', settings.path_favicon)
  applyDocumentLink('apple-touch-icon', settings.path_logoheader)
  applyAppTheme(settings)
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppPublicSettings>(FALLBACK_SETTINGS)
  const [loading, setLoading] = useState(true)

  const applySettings = useCallback((next: AppPublicSettings) => {
    setSettings(next)
    applyDocumentMeta(next)
  }, [])

  const refreshSettings = useCallback(async () => {
    const next = await aplikasiKonfigService.publicSettings()
    applySettings(next)
  }, [applySettings])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const next = await aplikasiKonfigService.publicSettings()
        if (active) applySettings(next)
      } catch {
        if (active) applyDocumentMeta(FALLBACK_SETTINGS)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [applySettings])

  const value = useMemo(
    () => ({ settings, loading, applySettings, refreshSettings }),
    [settings, loading, applySettings, refreshSettings],
  )

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export function useAppSettings(): AppSettingsContextValue {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) {
    throw new Error('useAppSettings must be used within AppSettingsProvider')
  }
  return ctx
}
