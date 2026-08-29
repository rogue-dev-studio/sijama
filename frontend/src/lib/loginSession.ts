/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:40:00
 */

export const LOGIN_SESSION_DEFAULT_MIN_MINUTES = 1
export const LOGIN_SESSION_DEFAULT_MAX_MINUTES = 525_600
export const LOGIN_SESSION_DEFAULT_MINUTES = 1440

export function describeLoginSessionExpiry(expiresAt: string | null | undefined): string {
  if (!expiresAt) {
    return 'Tidak ada batas waktu — login tetap aktif hingga Anda logout.'
  }

  const date = new Date(expiresAt)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return `Login otomatis berakhir pada ${new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)}.`
}

export function parseLoginRememberMinutesInput(
  value: string,
  minMinutes: number,
  maxMinutes: number,
): { ok: true; minutes: number } | { ok: false; message: string } {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ok: false, message: 'Masukkan durasi dalam menit.' }
  }

  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, message: 'Durasi sesi login harus berupa angka bulat (menit).' }
  }

  const minutes = Number(trimmed)
  if (minutes < minMinutes) {
    return { ok: false, message: `Durasi sesi login minimal ${minMinutes} menit.` }
  }

  if (minutes > maxMinutes) {
    return { ok: false, message: `Durasi sesi login maksimal ${maxMinutes} menit.` }
  }

  return { ok: true, minutes }
}
