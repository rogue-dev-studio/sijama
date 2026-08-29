/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 17:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:55:00
 */

export type DokumenLayoutMode =
  | 'biasa'
  | 'kop_ganda'
  | 'kop_kiri'
  | 'kop_kanan'
  | 'kop_atas'

export const DOKUMEN_LAYOUT_OPTIONS: Array<{ value: DokumenLayoutMode; label: string; hint: string }> =
  [
    {
      value: 'biasa',
      label: 'Biasa (teks saja)',
      hint: 'Header/footer teks tanpa logo.',
    },
    {
      value: 'kop_ganda',
      label: 'Kop ganda (logo kiri & kanan)',
      hint: 'Logo kiri dan kanan, teks di tengah — seperti kop surat resmi.',
    },
    {
      value: 'kop_kiri',
      label: 'Kop kiri',
      hint: 'Logo di kiri, teks di kanan logo.',
    },
    {
      value: 'kop_kanan',
      label: 'Kop kanan',
      hint: 'Teks di kiri, logo di kanan.',
    },
    {
      value: 'kop_atas',
      label: 'Kop atas',
      hint: 'Logo di atas, teks di bawah (tengah).',
    },
  ]

export function normalizeDokumenLayout(mode?: string | null): DokumenLayoutMode {
  const value = String(mode || '')
    .trim()
    .toLowerCase()

  if (value === 'sederhana' || value === 'biasa') return 'biasa'
  if (value === 'kop' || value === 'kop_ganda') return 'kop_ganda'
  if (value === 'kop_kiri' || value === 'kop_kanan' || value === 'kop_atas') return value

  return 'kop_ganda'
}

export function layoutUsesLogos(mode?: string | null): boolean {
  return normalizeDokumenLayout(mode) !== 'biasa'
}

export function resolveLayoutLogos(
  mode: string | null | undefined,
  logoKiri?: string | null,
  logoKanan?: string | null,
): { left: string | null; right: string | null } {
  const layout = normalizeDokumenLayout(mode)
  const left = logoKiri?.trim() || null
  const right = logoKanan?.trim() || null

  switch (layout) {
    case 'biasa':
      return { left: null, right: null }
    case 'kop_kiri':
      return { left, right: null }
    case 'kop_kanan':
      return { left: null, right }
    case 'kop_ganda':
    case 'kop_atas':
      return { left, right }
    default:
      return { left, right }
  }
}
