# Menu parent structure

| Parent | Anak (ringkas) |
|--------|----------------|
| Informasi | Dashboard, Kehadiran, Kategori Umur, Kalender |
| Laporan | Kehadiran, Jamaah, Pengajian, Kegiatan (cetak/CSV via `ExportPrintActions`) |
| Transaksi | Pengajian, Kegiatan, Absensi |
| Master | Jamaah; Lokasi; Lookup (incl. pekerjaan); Wilayah Fungsional; Wilayah Administrasi; Dapukan, Menu, Fitur, Hak Akses, Matriks Akses, Pengguna |
| Aplikasi | Konfigurasi Sistem; Konfigurasi Dokumen (header/footer cetak–ekspor) |

- Super Admin: semua section aktif.
- Role lain: section hanya muncul jika ada anak dengan permission `view`.
- Permission laporan: `laporan_kehadiran.view`, `laporan_jamaah.view`, `laporan_pengajian.view`, `laporan_kegiatan.view`.
- API: `GET /api/laporan/{kehadiran|jamaah|pengajian|kegiatan}`.
- UI: `/laporan/{kehadiran|jamaah|pengajian|kegiatan}` — filter + tabel + Cetak / Ekspor Excel (pola sama halaman Kehadiran/Pengajian).
