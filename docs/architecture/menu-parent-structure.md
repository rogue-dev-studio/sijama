# Menu parent structure

| Parent | Anak (ringkas) |
|--------|----------------|
| Informasi | Dashboard, Kehadiran, Kategori Umur, Kalender |
| Laporan | *(belum ada modul — section tampil untuk Super Admin)* |
| Transaksi | Pengajian, Kegiatan, Absensi |
| Master | Jamaah; Lokasi–Pekerjaan; Wilayah Fungsional; Wilayah Administrasi; Dapukan, Menu, Fitur, Hak Akses, Matriks Akses, Pengguna |
| Aplikasi | *(kosong — section tampil untuk Super Admin)* |

- Super Admin: semua section aktif, termasuk Laporan & Aplikasi kosong.
- Role lain: section hanya muncul jika ada anak dengan permission `view`.
