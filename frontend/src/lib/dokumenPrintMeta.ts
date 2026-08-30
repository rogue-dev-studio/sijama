/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:10:00
 */

export const DEFAULT_PRINT_DATE_LABEL = 'Dicetak'

export const DEFAULT_GENERATED_BY_PREFIX = 'Dokumen dihasilkan'

export function resolvePrintDateLabel(label?: string | null): string {
  const trimmed = (label ?? '').trim()
  return trimmed || DEFAULT_PRINT_DATE_LABEL
}

export function resolveGeneratedByPrefix(footer?: string | null): string {
  const trimmed = (footer ?? '').trim()
  if (!trimmed) {
    return DEFAULT_GENERATED_BY_PREFIX
  }

  const legacy = trimmed.match(/^(.+?)\s+oleh\s+.+$/iu)
  return legacy ? legacy[1].trim() : trimmed
}

export function formatGeneratedByLine(
  prefix: string | null | undefined,
  appName: string | null | undefined,
): string {
  const label = resolveGeneratedByPrefix(prefix)
  const app = (appName ?? '').trim() || 'SIJAMA'
  return `${label} oleh ${app}`
}

export function formatPrintDateMeta(options: {
  label?: string | null
  rowCount: number
  showDate?: boolean
  showRowCount?: boolean
  date?: Date
}): string | null {
  const showDate = options.showDate !== false
  const showRowCount = options.showRowCount !== false
  if (!showDate && !showRowCount) {
    return null
  }

  const parts: string[] = []
  if (showDate) {
    const prefix = resolvePrintDateLabel(options.label)
    const when = (options.date ?? new Date()).toLocaleString('id-ID')
    parts.push(`${prefix} ${when}`)
  }
  if (showRowCount) {
    parts.push(`${options.rowCount} baris`)
  }

  return parts.join(' · ')
}
