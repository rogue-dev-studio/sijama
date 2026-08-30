/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:10:00
 */

import { isDokumenColumnVisible, type DokumenColumnVisibilityMap } from './dokumenColumnRegistry'
import type { ExportTablePayload } from './tableExport'

export function applyDokumenColumnVisibility(
  payload: ExportTablePayload,
  columnVisibility?: DokumenColumnVisibilityMap | null,
): ExportTablePayload {
  const keys = payload.columnKeys
  if (!keys || keys.length !== payload.headers.length) {
    return payload
  }

  const keepIndices = keys
    .map((key, index) => ({ key, index }))
    .filter(({ key }) => isDokumenColumnVisible(columnVisibility, key))

  if (keepIndices.length === keys.length) {
    return payload
  }

  return {
    ...payload,
    headers: keepIndices.map(({ index }) => payload.headers[index]),
    columnKeys: keepIndices.map(({ key }) => key),
    rows: payload.rows.map((row) => keepIndices.map(({ index }) => row[index])),
  }
}

export function buildExportColumnKeys<T extends { key: string }>(columns: T[]): string[] {
  return ['no', ...columns.map((column) => column.key)]
}

export function buildExportHeaders<T extends { label: string }>(columns: T[]): string[] {
  return ['No', ...columns.map((column) => column.label)]
}
