# Menu & aksi mengikuti hak akses

Tanggal: 2026-08-24

## Aturan

1. Sidebar hanya menampilkan menu leaf yang punya permission **view** (atau superadmin).
2. Folder/section tanpa anak yang boleh diakses **tidak** ditampilkan (termasuk Laporan & Aplikasi kosong).
3. Tombol Tambah/Edit/Hapus di halaman list mengikuti `can(...)` (termasuk Pengajian, Kegiatan, Absensi).
4. Route FE memakai `PermissionRoute`; jika ditolak, redirect ke menu pertama yang boleh diakses (bukan selalu `/`).
5. API tetap default-deny via middleware `permission:*`.

## Verifikasi

- Login sebagai Jamaah Kelompok → tidak ada Master RBAC / Absensi jika tidak di-grant; tidak ada Laporan/Aplikasi kosong.
- Login Admin Kelompok → ada Jamaah & transaksi sesuai seed; tidak ada Menu/Fitur/Hak Akses/Matriks.
- Logout/login ulang setelah deploy agar `/me` menus ter-refresh.
