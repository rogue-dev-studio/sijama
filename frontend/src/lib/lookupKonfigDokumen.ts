/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:02:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 16:02:00
 */

import type { DokumenPaperOrientation, DokumenPaperSize } from '../api/types'
import {
  DOKUMEN_PAPER_ORIENTATIONS,
  DOKUMEN_PAPER_SIZES,
  normalizeDokumenPaper,
} from './dokumenStyle'

export type LookupKonfigDokumenMeta = {
  paper_size: DokumenPaperSize
  paper_orientation: DokumenPaperOrientation
}

export function defaultLookupKonfigDokumenMeta(): LookupKonfigDokumenMeta {
  return {
    paper_size: 'a4',
    paper_orientation: 'portrait',
  }
}

export function parseLookupKonfigDokumenMeta(
  additionalData?: string | null,
): LookupKonfigDokumenMeta {
  if (!additionalData?.trim()) {
    return defaultLookupKonfigDokumenMeta()
  }

  try {
    const parsed = JSON.parse(additionalData) as Partial<LookupKonfigDokumenMeta>
    return normalizeDokumenPaper(parsed)
  } catch {
    return defaultLookupKonfigDokumenMeta()
  }
}

export function serializeLookupKonfigDokumenMeta(meta: LookupKonfigDokumenMeta): string {
  const normalized = normalizeDokumenPaper(meta)
  return JSON.stringify(normalized)
}

export function lookupKonfigDokumenMetaHint(): string {
  const sizes = DOKUMEN_PAPER_SIZES.map((item) => item.label).join(', ')
  const orientations = DOKUMEN_PAPER_ORIENTATIONS.map((item) => item.label).join(' / ')
  return `Ukuran kertas default cetakan lookup ini: ${sizes}. Orientasi: ${orientations}.`
}
