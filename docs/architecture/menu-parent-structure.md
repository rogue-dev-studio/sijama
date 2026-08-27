# Menu parent structure

| Parent | Anak (ringkas) |
|--------|----------------|
| Informasi | Dashboard, Kehadiran, Kategori Umur, Kalender |
| Laporan | *(belum ada modul — section tampil untuk Super Admin)* |
| Transaksi | Pengajian, Kegiatan, Absensi |
| Master | Jamaah; Lokasi–Pekerjaan; Lookup; Wilayah Fungsional; Wilayah Administrasi; Dapukan, Menu, Fitur, Hak Akses, Matriks Akses, Pengguna |
| Aplikasi | Konfigurasi Sistem |

- Super Admin: semua section aktif, termasuk Laporan & Aplikasi kosong.
- Role lain: section hanya muncul jika ada anak dengan permission `view`.
