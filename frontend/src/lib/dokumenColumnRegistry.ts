/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:10:00
 */

export type DokumenColumnDef = {
  key: string
  label: string
}

const KONFIG_LIST_COLUMNS: DokumenColumnDef[] = [
  { key: 'nama_cetakan', label: 'Nama cetakan' },
  { key: 'value', label: 'Value' },
  { key: 'header', label: 'Header' },
  { key: 'media', label: 'Media' },
  { key: 'status', label: 'Status' },
]

export const DOKUMEN_COLUMN_REGISTRY: Record<string, DokumenColumnDef[]> = {
  jamaah: [
    { key: 'nama', label: 'Nama' },
    { key: 'kelompok', label: 'Kelompok' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'nik', label: 'NIK' },
    { key: 'kontak', label: 'Kontak' },
    { key: 'status', label: 'Status' },
    { key: 'wajah', label: 'Wajah' },
  ],
  keluarga: [
    { key: 'kepala', label: 'Kepala Keluarga' },
    { key: 'no_kk', label: 'No. KK' },
    { key: 'anggota', label: 'Anggota' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'kelompok', label: 'Kelompok' },
    { key: 'status', label: 'Status' },
  ],
  pengajian: [
    { key: 'judul', label: 'Judul' },
    { key: 'pemateri', label: 'Pemateri' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'waktu', label: 'Waktu' },
    { key: 'status', label: 'Status' },
  ],
  kegiatan: [
    { key: 'judul', label: 'Judul' },
    { key: 'jenis', label: 'Jenis' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'status', label: 'Status' },
  ],
  laporan_jamaah: [
    { key: 'nama', label: 'Nama' },
    { key: 'kelompok', label: 'Kelompok' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'nik', label: 'NIK' },
    { key: 'kontak', label: 'Kontak' },
    { key: 'status', label: 'Status' },
    { key: 'wajah', label: 'Wajah' },
  ],
  laporan_kehadiran: [
    { key: 'waktu', label: 'Waktu' },
    { key: 'nama', label: 'Nama' },
    { key: 'kelompok', label: 'Kelompok' },
    { key: 'sesi', label: 'Sesi' },
    { key: 'jenis', label: 'Jenis' },
    { key: 'metode', label: 'Metode' },
  ],
  laporan_kegiatan: [
    { key: 'judul', label: 'Judul' },
    { key: 'jenis', label: 'Jenis' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'status', label: 'Status' },
  ],
  laporan_pengajian: [
    { key: 'judul', label: 'Judul' },
    { key: 'pemateri', label: 'Pemateri' },
    { key: 'lokasi', label: 'Lokasi' },
    { key: 'waktu', label: 'Waktu' },
    { key: 'status', label: 'Status' },
  ],
  master_users: [
    { key: 'nama', label: 'Nama' },
    { key: 'username', label: 'Username' },
    { key: 'dapukan', label: 'Dapukan' },
    { key: 'cakupan', label: 'Cakupan' },
    { key: 'status', label: 'Status' },
  ],
  kategori_umur: [
    { key: 'grup', label: 'Grup' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'rentang', label: 'Rentang' },
    { key: 'jumlah', label: 'Jumlah' },
  ],
  matriks: [
    { key: 'modul', label: 'Modul' },
    { key: 'fitur', label: 'Fitur' },
    { key: 'hak_akses', label: 'Hak akses' },
    { key: 'slug', label: 'Slug' },
    { key: 'aksi', label: 'Aksi' },
    { key: 'aktif', label: 'Aktif' },
  ],
  kehadiran: [
    { key: 'nama', label: 'Nama' },
    { key: 'metode', label: 'Metode' },
    { key: 'waktu', label: 'Waktu' },
  ],
  master_list: [
    { key: 'nama', label: 'Nama' },
    { key: 'is_active', label: 'Status' },
  ],
  konfig_dokumen_list: KONFIG_LIST_COLUMNS,
}

export type DokumenColumnVisibilityMap = Record<string, boolean>

export type DokumenColumnVisibilityByMedia = {
  pdf?: DokumenColumnVisibilityMap | null
  excel?: DokumenColumnVisibilityMap | null
  csv?: DokumenColumnVisibilityMap | null
}

export type DokumenExportMedia = keyof DokumenColumnVisibilityByMedia

export const DOKUMEN_EXPORT_MEDIA: Array<{ id: DokumenExportMedia; label: string }> = [
  { id: 'pdf', label: 'PDF / Cetak' },
  { id: 'excel', label: 'Excel' },
  { id: 'csv', label: 'CSV' },
]

function normalizeColumnMap(
  columns: DokumenColumnDef[],
  raw?: DokumenColumnVisibilityMap | null,
): DokumenColumnVisibilityMap {
  const result: DokumenColumnVisibilityMap = {}
  for (const column of columns) {
    result[column.key] = raw?.[column.key] !== false
  }
  return result
}

function isPerMediaColumnVisibility(raw: unknown): raw is DokumenColumnVisibilityByMedia {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return false
  }

  return ['pdf', 'excel', 'csv'].some((media) => {
    const value = (raw as DokumenColumnVisibilityByMedia)[media as DokumenExportMedia]
    return value !== undefined && value !== null && typeof value === 'object' && !Array.isArray(value)
  })
}

function isLegacyColumnVisibility(raw: unknown): raw is DokumenColumnVisibilityMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return false
  }

  return Object.keys(raw).some((key) => !['pdf', 'excel', 'csv'].includes(key))
}

export function getDokumenColumns(dokumenKey: string): DokumenColumnDef[] {
  if (dokumenKey === 'master_list') {
    return DOKUMEN_COLUMN_REGISTRY.master_list
  }
  return DOKUMEN_COLUMN_REGISTRY[dokumenKey] ?? []
}

export function isDokumenColumnVisible(
  columnVisibility: DokumenColumnVisibilityMap | null | undefined,
  columnKey: string,
): boolean {
  if (!columnVisibility) return true
  return columnVisibility[columnKey] !== false
}

export function resolveColumnVisibilityForMedia(
  raw: DokumenColumnVisibilityByMedia | DokumenColumnVisibilityMap | null | undefined,
  media: DokumenExportMedia,
  dokumenKey: string,
): DokumenColumnVisibilityMap {
  const normalized = normalizeColumnVisibilityByMedia(dokumenKey, raw)
  return normalized[media] ?? {}
}

/** @deprecated gunakan normalizeColumnVisibilityByMedia */
export function normalizeColumnVisibility(
  dokumenKey: string,
  raw?: DokumenColumnVisibilityMap | null,
): DokumenColumnVisibilityMap {
  const columns = getDokumenColumns(dokumenKey)
  return normalizeColumnMap(columns, raw)
}

export function normalizeColumnVisibilityByMedia(
  dokumenKey: string,
  raw?: DokumenColumnVisibilityByMedia | DokumenColumnVisibilityMap | null,
): DokumenColumnVisibilityByMedia {
  const columns = getDokumenColumns(dokumenKey)

  if (isPerMediaColumnVisibility(raw)) {
    return {
      pdf: normalizeColumnMap(columns, raw.pdf),
      excel: normalizeColumnMap(columns, raw.excel),
      csv: normalizeColumnMap(columns, raw.csv),
    }
  }

  const legacy = normalizeColumnMap(
    columns,
    isLegacyColumnVisibility(raw) ? raw : null,
  )

  return {
    pdf: { ...legacy },
    excel: { ...legacy },
    csv: { ...legacy },
  }
}
