# Architecture — Laporkan Masalah & Kotak Masukan

Version: 1.0.0  
Date: 2026-09-04

## Tables

| Table | Purpose |
|-------|---------|
| `app_report_t` | Laporan teknis / nonteknis |
| `app_feedback_t` | Ide (`idea`) & testimoni (`testimonial`) |
| `app_poll_t` / `app_poll_option_t` / `app_poll_vote_t` | Jajak pendapat |

Relasi: `user_id` → `users`, `jamaah_id` → `jamaah_r` (nullable). `reporter_name` wajib.

## API (auth, bukan middleware superadmin)

Prefix `aplikasi/laporkan` dan `aplikasi/kotak-masukan` — lihat `routes/api.php`.

## RBAC

User codes (semua dapukan): create/view laporan & masukan, status sendiri, galeri.  
Admin codes (hanya superadmin): `app_report_admin.*`, `app_feedback_admin.*`, `app_feedback_testimonial_admin.*`.

## UI

- Galeri (`Informasi Testimoni & Apresiasi`): carousel read-only; kartu menampilkan cuplikan + detail modal (pesan lengkap + gambar).
- Payload galeri (`GET …/galeri-testimoni` via `AppFeedbackGalleryResource`): hanya nama, jabatan/relasi, judul, isi, rating, gambar — **tanpa** `reporter_username`, `contact`, atau nested user account.
- Kirim testimoni: boleh lebih dari satu kali; tampilan tetap dikontrol admin lewat `is_published`.
- Daftar (`Daftar Testimoni & Apresiasi`): superadmin tampilkan/sembunyikan (`is_published`); kontak/username tetap tersedia di admin.
