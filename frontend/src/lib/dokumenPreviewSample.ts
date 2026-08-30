/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:00:00
 */

import type { DokumenColumnDef } from './dokumenColumnRegistry'

const SAMPLE_VALUES: Record<string, string[]> = {
  nama: ['Ahmad Santoso', 'Siti Rahayu', 'Budi Pratama'],
  nama_cetakan: ['Daftar Jamaah', 'Laporan Kehadiran', 'Rekap Kegiatan'],
  kelompok: ['Remaja', 'Ibu-Ibu', 'Pemuda'],
  kategori: ['Dewasa', 'Remaja', 'Anak'],
  nik: ['3201010101010001', '3201020202020002', '3201030303030003'],
  kontak: ['081234567890', '081298765432', '085612345678'],
  status: ['Aktif', 'Aktif', 'Nonaktif'],
  kepala: ['Ahmad Santoso', 'Siti Rahayu', 'Budi Pratama'],
  no_kk: ['3201010101010001', '3201020202020002', '3201030303030003'],
  anggota: ['4 orang', '3 orang', '5 orang'],
  alamat: ['Jl. Merdeka No. 12', 'Jl. Melati No. 8', 'Jl. Kenanga No. 5'],
  judul: ['Pengajian Akbar', 'Kajian Rutin', 'Tabligh Akbar'],
  pemateri: ['Ust. Fulan', 'Ust. Fulana', 'Ust. Ahmad'],
  lokasi: ['Masjid Al-Ikhlas', 'Aula Utama', 'Balai Desa'],
  waktu: ['30 Agu 2026, 19:30', '31 Agu 2026, 08:00', '1 Sep 2026, 20:00'],
  jenis: ['Rutin', 'Insidental', 'Khusus'],
  tanggal: ['30 Agu 2026', '31 Agu 2026', '1 Sep 2026'],
  sesi: ['Sesi 1', 'Sesi 2', 'Sesi 3'],
  metode: ['QR Code', 'Manual', 'QR Code'],
  username: ['ahmad.s', 'siti.r', 'budi.p'],
  dapukan: ['Admin', 'Operator', 'Viewer'],
  cakupan: ['Nasional', 'Wilayah', 'Lokal'],
  modul: ['Jamaah', 'Kegiatan', 'Laporan'],
  fitur: ['Daftar', 'Cetak', 'Ekspor'],
  hak_akses: ['Lihat', 'Ubah', 'Hapus'],
  slug: ['jamaah.view', 'kegiatan.print', 'laporan.export'],
  aksi: ['create', 'update', 'delete'],
  aktif: ['Ya', 'Ya', 'Tidak'],
  value: ['jamaah', 'kegiatan', 'pengajian'],
  header: ['SIJAMA', 'SIJAMA', 'SIJAMA'],
  media: ['PDF', 'Excel', 'CSV'],
  grup: ['Anak', 'Remaja', 'Dewasa'],
  rentang: ['0–12 th', '13–17 th', '18+ th'],
  jumlah: ['24', '18', '42'],
  is_active: ['Aktif', 'Aktif', 'Nonaktif'],
}

const PREVIEW_ROW_COUNT = 3

/** Data contoh untuk blok tanda tangan di pratinjau konfig dokumen. */
export const PREVIEW_PRINT_USER = {
  name: 'Ahmad Santoso',
  phone: '081234567890',
  signatureLabel: 'A. Santoso',
} as const

export function sampleCellValue(columnKey: string, label: string, rowIndex: number): string {
  const samples = SAMPLE_VALUES[columnKey]
  if (samples?.[rowIndex]) {
    return samples[rowIndex]
  }

  return `Contoh ${label} ${rowIndex + 1}`
}

export function buildPreviewTableRows(
  columns: DokumenColumnDef[],
): { headers: string[]; rows: string[][] } {
  if (columns.length === 0) {
    return {
      headers: ['No', 'Kolom A', 'Kolom B'],
      rows: Array.from({ length: PREVIEW_ROW_COUNT }, (_, rowIndex) => [
        String(rowIndex + 1),
        sampleCellValue('kolom_a', 'Kolom A', rowIndex),
        sampleCellValue('kolom_b', 'Kolom B', rowIndex),
      ]),
    }
  }

  const headers = ['No', ...columns.map((column) => column.label)]
  const rows = Array.from({ length: PREVIEW_ROW_COUNT }, (_, rowIndex) => [
    String(rowIndex + 1),
    ...columns.map((column) => sampleCellValue(column.key, column.label, rowIndex)),
  ])

  return { headers, rows }
}
