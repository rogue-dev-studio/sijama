/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 15:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 15:10:00
 */

type DesaWithKodePos = {
  id: number
  kode_pos?: string | null
}

/** Ambil kode pos master dari opsi desa/kelurahan bila tersedia. */
export function kodePosFromDesa(
  list: DesaWithKodePos[],
  desaKelurahanId: number | null | undefined,
): string {
  if (!desaKelurahanId) {
    return ''
  }

  const kode = list.find((item) => item.id === desaKelurahanId)?.kode_pos

  return typeof kode === 'string' && /^\d{5}$/.test(kode) ? kode : ''
}
