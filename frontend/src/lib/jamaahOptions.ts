/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 14:45:00
 */

export type KategoriUmur =
  | 'bayi'
  | 'balita'
  | 'paud'
  | 'caberawit_a'
  | 'caberawit_b'
  | 'caberawit_c'
  | 'pra_remaja'
  | 'remaja'
  | 'pra_nikah'
  | 'dewasa'
  | 'lansia'

export type StatusPernikahan = 'belum_menikah' | 'sudah_menikah' | 'cerai_hidup' | 'cerai_mati'

export type Pendidikan =
  | 'tidak_sekolah'
  | 'sd'
  | 'smp'
  | 'sma'
  | 'd1_d2_d3'
  | 's1'
  | 's2'
  | 's3'
  | 'lainnya'

/** Selaras dengan `App\Support\JamaahKategoriUmur` (backend). */
export const KATEGORI_UMUR_OPTIONS: Array<{
  value: KategoriUmur
  label: string
  group: string
  rentang: string
}> = [
  { value: 'bayi', label: 'Bayi', group: 'Caberawit', rentang: '0–1 tahun' },
  { value: 'balita', label: 'Balita', group: 'Caberawit', rentang: '2–4 tahun' },
  { value: 'paud', label: 'PAUD', group: 'Caberawit', rentang: '5 tahun' },
  { value: 'caberawit_a', label: 'Caberawit A', group: 'Caberawit', rentang: '6–8 tahun' },
  { value: 'caberawit_b', label: 'Caberawit B', group: 'Caberawit', rentang: '9–11 tahun' },
  { value: 'caberawit_c', label: 'Caberawit C', group: 'Caberawit', rentang: '12–14 tahun' },
  { value: 'pra_remaja', label: 'Pra Remaja', group: 'Muda-mudi', rentang: '15–17 tahun' },
  { value: 'remaja', label: 'Remaja', group: 'Muda-mudi', rentang: '18–20 tahun' },
  {
    value: 'pra_nikah',
    label: 'Pra Nikah',
    group: 'Muda-mudi',
    rentang: '21–59 tahun · belum menikah',
  },
  {
    value: 'dewasa',
    label: 'Dewasa',
    group: 'Dewasa',
    rentang: '21–59 tahun · sudah menikah / cerai',
  },
  { value: 'lansia', label: 'Lansia', group: 'Lansia', rentang: '60+ tahun' },
]

export const STATUS_PERNIKAHAN_OPTIONS: Array<{ value: StatusPernikahan; label: string }> = [
  { value: 'belum_menikah', label: 'Belum menikah' },
  { value: 'sudah_menikah', label: 'Sudah menikah' },
  { value: 'cerai_hidup', label: 'Cerai hidup' },
  { value: 'cerai_mati', label: 'Cerai mati' },
]

export const PENDIDIKAN_OPTIONS: Array<{ value: Pendidikan; label: string }> = [
  { value: 'tidak_sekolah', label: 'Tidak sekolah' },
  { value: 'sd', label: 'SD/MI' },
  { value: 'smp', label: 'SMP/MTs' },
  { value: 'sma', label: 'SMA/MA/SMK' },
  { value: 'd1_d2_d3', label: 'D1/D2/D3' },
  { value: 's1', label: 'S1' },
  { value: 's2', label: 'S2' },
  { value: 's3', label: 'S3' },
  { value: 'lainnya', label: 'Lainnya' },
]

export function kategoriUmurLabel(value: string | null | undefined): string {
  if (!value) return 'Belum diklasifikasi'
  return KATEGORI_UMUR_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function statusPernikahanLabel(value: string | null | undefined): string {
  if (!value) return '—'
  return STATUS_PERNIKAHAN_OPTIONS.find((item) => item.value === value)?.label ?? value
}

export function pendidikanLabel(value: string | null | undefined): string {
  if (!value) return '—'
  return PENDIDIKAN_OPTIONS.find((item) => item.value === value)?.label ?? value
}
