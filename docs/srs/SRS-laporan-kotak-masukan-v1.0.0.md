# SRS — Laporkan Masalah & Kotak Masukan

Version: 1.0.0  
Date: 2026-09-04  
Project: sijama

## Tujuan

Kanal laporan masalah dan masukan aplikasi untuk semua pengguna terautentikasi; inbox admin hanya Superadmin.

## Menu (Aplikasi)

### Laporkan Masalah
| Sub | Path | Akses |
|-----|------|-------|
| Teknis & Sistem | `/aplikasi/laporkan/teknis` | Semua (perm) |
| Non-Teknis / Layanan | `/aplikasi/laporkan/nonteknis` | Semua |
| Status Laporan Saya | `/aplikasi/laporkan/status` | Semua (milik sendiri) |
| Informasi Laporan | `/aplikasi/laporkan/informasi` | Superadmin |

### Kotak Masukan
| Sub | Path | Akses |
|-----|------|-------|
| Ide & Saran | `/aplikasi/kotak-masukan/ide` | Semua |
| Status Ide & Saran Saya | `/aplikasi/kotak-masukan/ide/status` | Semua (milik sendiri) |
| Testimoni & Apresiasi | `/aplikasi/kotak-masukan/testimoni` | Semua (kirim) |
| Informasi Masukan | `/aplikasi/kotak-masukan/informasi` | Superadmin (ide & saran) |
| Informasi Testimoni & Apresiasi | `/aplikasi/kotak-masukan/galeri-testimoni` | Semua (carousel published; tanpa aksi sembunyi) |
| Daftar Testimoni & Apresiasi | `/aplikasi/kotak-masukan/daftar-testimoni` | Superadmin (tampilkan / sembunyikan) |

## Field wajib

- Nama pelapor (`reporter_name`)
- Relasi opsional: `user_id`, `jamaah_id` (diisi otomatis dari sesi bila ada)

## AC

1. User biasa melihat menu Laporkan/Kotak (kecuali Informasi* admin & Daftar Testimoni).
2. Submit laporan teknis/nonteknis menyimpan nama + tautan user/jamaah.
3. Status Laporan Saya hanya menampilkan milik user login.
4. Superadmin melihat semua laporan/ide dan dapat ubah status; kelola tampilan testimoni hanya di Daftar Testimoni & Apresiasi.
5. Galeri testimoni menampilkan kartu carousel (judul, bintang, isi, avatar/inisial, nama) tanpa tombol sembunyikan.

## Asumsi

- Hanya user login (bukan publik anonim).
- Jajak Pendapat dinonaktifkan dari menu (legacy).
