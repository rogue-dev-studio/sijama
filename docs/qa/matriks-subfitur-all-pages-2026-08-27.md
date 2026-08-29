# QA — Sub-fitur matriks di semua halaman

Tanggal: 2026-08-27  
Project: sijama

## Matriks UI

- Setiap fitur di Daftar Fitur bisa di-expand (`› Nama`)
- SUB-FITUR = **satu baris per hak akses** (Lihat/Tambah/Ubah/… atau widget)
- Modul **Aplikasi** (Konfig) ikut tampil di matriks

## Sub-fitur section baru

| Menu | Sub-fitur |
|------|-----------|
| Dashboard | KPI, Ringkasan Absensi, Jamaah per Kelompok, Kategori Umur |
| Kalender | Grid Bulanan, Hari Libur, Detail Hari |
| Konfig Sistem | Identitas, Email/SMTP, Branding, Tema, Operasional |
| Konfig Dokumen | Isi Dokumen, Aktifkan di Media |

CRUD (Jamaah, Master, Absensi, dll.): baris SUB-FITUR dari nama hak akses (Lihat/Tambah/…).

## Setup

```bash
php artisan db:seed --class=RbacSeeder
```

Lalu logout/login (atau simpan matriks dapukan login) agar permission session terbarui.

## Cek

1. Matriks → Informasi → Dashboard → expand: 4 sub-fitur widget
2. Matriks → Master → Jamaah → expand: Lihat/Tambah/Ubah/Hapus/Enroll
3. Matriks → Aplikasi → Konfigurasi Sistem → expand: 5 tab
4. Uncentang sub-fitur → Simpan → halaman terkait menyembunyikan bagian itu
