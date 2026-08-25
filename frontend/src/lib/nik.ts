/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-24 11:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-24 11:15:00
 */

export type NikBirthInfo = {
  tanggalLahir: string
  gender: 'L' | 'P'
}

/**
 * Parse tanggal lahir (dan gender) dari NIK 16 digit.
 * Digit 7–12 = DDMMYY; hari +40 menandai perempuan.
 */
export function parseBirthInfoFromNik(nik: string): NikBirthInfo | null {
  const digits = nik.replace(/\D/g, '')
  if (digits.length !== 16) return null

  let day = Number(digits.slice(6, 8))
  const month = Number(digits.slice(8, 10))
  const yearShort = Number(digits.slice(10, 12))

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(yearShort)) {
    return null
  }

  let gender: 'L' | 'P' = 'L'
  if (day > 40) {
    day -= 40
    gender = 'P'
  }

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return null
  }

  const currentYearShort = new Date().getFullYear() % 100
  let fullYear = yearShort <= currentYearShort ? 2000 + yearShort : 1900 + yearShort

  const candidate = new Date(fullYear, month - 1, day)
  if (
    candidate.getFullYear() !== fullYear ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null
  }

  if (candidate.getTime() > Date.now()) {
    fullYear -= 100
    const adjusted = new Date(fullYear, month - 1, day)
    if (
      adjusted.getFullYear() !== fullYear ||
      adjusted.getMonth() !== month - 1 ||
      adjusted.getDate() !== day
    ) {
      return null
    }
  }

  const tanggalLahir = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return { tanggalLahir, gender }
}
