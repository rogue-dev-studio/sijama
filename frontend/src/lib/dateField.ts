export const DATE_FIELD_WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const

export const DATE_FIELD_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

export type DateFieldCell = {
  iso: string
  day: number
  inMonth: boolean
  isSunday: boolean
  isToday: boolean
}

export function parseIsoDate(raw: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31
  ) {
    return null
  }
  return { year, month, day }
}

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function localIsoDate(date = new Date()) {
  return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function isSundayIso(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay() === 0
}

export function formatDateFieldLabel(iso: string) {
  const parsed = parseIsoDate(iso)
  if (!parsed) return ''
  return new Date(`${iso}T12:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function compareIsoDate(a: string, b: string) {
  return a.localeCompare(b)
}

export function isIsoDateInRange(iso: string, min?: string, max?: string) {
  if (min && compareIsoDate(iso, min) < 0) return false
  if (max && compareIsoDate(iso, max) > 0) return false
  return true
}

export function buildDateFieldGrid(year: number, month: number, todayIso = localIsoDate()): Array<DateFieldCell | null> {
  const first = new Date(year, month - 1, 1, 12, 0, 0)
  const mondayOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: Array<DateFieldCell | null> = Array.from({ length: mondayOffset }, () => null)

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toIsoDate(year, month, day)
    cells.push({
      iso,
      day,
      inMonth: true,
      isSunday: isSundayIso(iso),
      isToday: iso === todayIso,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function monthTitle(year: number, month: number) {
  return `${DATE_FIELD_MONTHS[month - 1]} ${year}`
}

export function buildDateFieldYearOptions(options?: {
  min?: string
  max?: string
  currentYear?: number
  span?: number
}): number[] {
  const span = options?.span ?? 50
  const currentYear = options?.currentYear ?? new Date().getFullYear()
  const minYear = parseIsoDate(options?.min ?? '')?.year ?? currentYear - span
  const maxYear = parseIsoDate(options?.max ?? '')?.year ?? currentYear + span
  const start = Math.min(minYear, maxYear)
  const end = Math.max(minYear, maxYear)
  const years: number[] = []
  for (let year = start; year <= end; year += 1) {
    years.push(year)
  }
  return years
}
