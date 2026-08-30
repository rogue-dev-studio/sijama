/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 16:55:00
 */

import type { AppDokumenSettings, User } from '../api/types'
import { applyDokumenColumnVisibility } from './dokumenExport'
import { resolveColumnVisibilityForMedia } from './dokumenColumnRegistry'
import {
  layoutUsesLogos,
  normalizeDokumenLayout,
  resolveLayoutLogos,
} from './dokumenLayout'
import {
  slugFilename,
  type ExportDokumenBrand,
  type ExportMedia,
  type ExportPrintUserInfo,
  type ExportTablePayload,
} from './tableExport'

type AppSettingsSnapshot = {
  app_nama: string
  dokumen?: {
    items?: Record<string, AppDokumenSettings | undefined>
  }
}

export function brandForMedia(
  dokumen: AppDokumenSettings | undefined,
  media: ExportMedia,
  appNama: string,
): ExportDokumenBrand | null {
  if (!dokumen) return null
  const kopEnabled =
    media === 'pdf' ? dokumen.apply_pdf : media === 'excel' ? dokumen.apply_excel : dokumen.apply_csv
  if (!kopEnabled) return null

  const layout_mode = normalizeDokumenLayout(dokumen.layout_mode)
  const logos = resolveLayoutLogos(layout_mode, dokumen.path_logo_kiri, dokumen.path_logo_kanan)

  return {
    header: dokumen.header,
    header_detail: dokumen.header_detail,
    footer: dokumen.footer,
    footer_detail: dokumen.footer_detail,
    path_logo_kiri: layoutUsesLogos(layout_mode) ? logos.left : null,
    path_logo_kanan: layoutUsesLogos(layout_mode) ? logos.right : null,
    layout_mode,
    header_style: dokumen.header_style,
    paper_size: dokumen.paper_size,
    paper_orientation: dokumen.paper_orientation,
    show_print_date: dokumen.show_print_date !== false,
    print_date_label: dokumen.print_date_label,
    show_print_row_count: dokumen.show_print_row_count !== false,
    show_generated_by: dokumen.show_generated_by !== false,
    app_nama: appNama,
    show_user_signature: Boolean(dokumen.show_user_signature),
    show_user_name: Boolean(dokumen.show_user_name),
    show_user_phone: Boolean(dokumen.show_user_phone),
  }
}

export function buildPrintUser(
  dokumen: AppDokumenSettings | undefined,
  user: User | null,
): ExportPrintUserInfo | null {
  if (!dokumen || !user) return null

  const showSignature = Boolean(dokumen.show_user_signature)
  const showName = Boolean(dokumen.show_user_name)
  const showPhone = Boolean(dokumen.show_user_phone)
  if (!showSignature && !showName && !showPhone) {
    return null
  }

  return {
    name: user.name,
    phone: user.no_hp ?? null,
    signatureUrl: user.path_tanda_tangan ?? null,
    showSignature,
    showName,
    showPhone,
  }
}

export async function prepareExportPayload(options: {
  media: ExportMedia
  getPayload: () => ExportTablePayload
  dokumenKey?: string
  settings: AppSettingsSnapshot
  refreshSettings: () => Promise<AppSettingsSnapshot>
  user: User | null
  fallbackTitle: string
}): Promise<{ payload: ExportTablePayload; filename: string }> {
  const { media, getPayload, dokumenKey, settings, refreshSettings, user, fallbackTitle } = options

  let dokumen = dokumenKey ? settings.dokumen?.items?.[dokumenKey] : undefined
  let appNama = settings.app_nama
  try {
    const fresh = await refreshSettings()
    dokumen = dokumenKey ? fresh.dokumen?.items?.[dokumenKey] : undefined
    appNama = fresh.app_nama
  } catch {
    // pakai settings yang sudah ada di memori
  }

  const base = getPayload()
  const brand = brandForMedia(dokumen, media, appNama)
  let payload: ExportTablePayload = {
    ...base,
    dokumen: brand,
  }

  if (dokumen?.column_visibility && dokumenKey) {
    const visibility = resolveColumnVisibilityForMedia(dokumen.column_visibility, media, dokumenKey)
    payload = applyDokumenColumnVisibility(payload, visibility)
  }

  if (media === 'pdf') {
    payload.printUser = buildPrintUser(dokumen, user)
  }

  const filename = slugFilename(payload.title || fallbackTitle)
  return { payload, filename }
}
