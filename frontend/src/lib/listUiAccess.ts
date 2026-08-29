/**
 * Helper izin UI list: tombol (lihat vs aksi) + kolom tabel + cetak/export.
 */
export type ButtonAccess = { visible: boolean; enabled: boolean }

export function listButtonPerms(prefix: string, buttonKey: string, actionSlug?: string) {
  return {
    view: `${prefix}.btn.${buttonKey}.view`,
    action: actionSlug ?? `${prefix}.${buttonKey}`,
  }
}

export function listButtonAccess(
  can: (permission: string) => boolean,
  prefix: string,
  buttonKey: string,
  actionSlug?: string,
): ButtonAccess {
  const { view, action } = listButtonPerms(prefix, buttonKey, actionSlug)
  const canAct = can(action)
  const canView = can(view)
  return { visible: canView || canAct, enabled: canAct }
}

export function listColumnPerm(prefix: string, key: string): string {
  return `${prefix}.col.${key}.view`
}

export function listExportAccess(can: (permission: string) => boolean, prefix: string) {
  const print = listButtonAccess(can, prefix, 'print', `${prefix}.print`)
  const csv = listButtonAccess(can, prefix, 'export_csv', `${prefix}.export_csv`)
  const excel = listButtonAccess(can, prefix, 'export_excel', `${prefix}.export_excel`)
  return {
    canPrint: print.enabled,
    canCsv: csv.enabled,
    canExcel: excel.enabled,
    showPrint: print.visible,
    showCsv: csv.visible,
    showExcel: excel.visible,
  }
}
