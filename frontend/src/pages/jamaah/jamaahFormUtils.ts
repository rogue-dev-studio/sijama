/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import type { JamaahInput } from '../../api/types'

export const JAMAHA_KELOMPOK_DAPUKAN_SLUG = 'jamaah_kelompok'

export const emptyJamaahForm: JamaahInput = {
  wilayah_fung_kelompok_id: 0,
  nik: '',
  nama: '',
  gender: 'L',
  tanggal_lahir: '',
  pekerjaan: '',
  pekerjaan_id: null,
  dapukan_ids: [],
  pendidikan: '',
  golongan_darah: '',
  status_pernikahan: '',
  alamat: '',
  rt: '',
  rw: '',
  no_hp: '',
  email: '',
  wilayah_adm_desa_id: null,
  kode_pos: '',
  status: 'aktif',
}

export function normalizeDapukanIds(ids: Array<number | string> | undefined): number[] {
  return (ids ?? []).map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
}

export function withJamaahKelompokDapukan(
  ids: Array<number | string> | undefined,
  kelompokId: number,
  jamaahKelompokId: number | null,
): number[] {
  const next = normalizeDapukanIds(ids)
  if (!kelompokId || !jamaahKelompokId) {
    return next
  }
  if (!next.includes(jamaahKelompokId)) {
    next.push(jamaahKelompokId)
  }
  return next
}
