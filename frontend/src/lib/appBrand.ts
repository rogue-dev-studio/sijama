/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:12:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:12:00
 */

import type { AppPublicSettings } from '../api/types'

/** Judul tab browser: nama aplikasi + nama instansi. */
export function buildBrowserTabTitle(settings: AppPublicSettings): string {
  const app = settings.app_nama?.trim()
  const instansi = settings.nama_instansi?.trim()

  if (app && instansi) {
    return `${app} — ${instansi}`
  }

  if (app) {
    return app
  }

  if (instansi) {
    return instansi
  }

  return 'SIJAMA'
}

/** Branding sidebar/header aplikasi. */
export function buildAppShellBrand(settings: AppPublicSettings): {
  title: string
  subtitle: string
} {
  return {
    title: settings.header?.trim() || 'SIJAMA',
    subtitle: settings.header_detail?.trim() || '',
  }
}
