# SRS — Profil jamaah mandiri

Versi: 1.0.0  
Tanggal: 2026-08-04

## Ringkasan

Pengguna yang login dapat membuka dropdown profil (sidebar / header mobile / sheet) untuk:

1. Lihat profil akun + data jamaah tertaut
2. Ubah data profil jamaah sendiri
3. Keluar

## API

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | `/api/profile` | sanctum | Payload profil + lookup pekerjaan |
| PUT/PATCH | `/api/profile` | sanctum | Update field jamaah milik sendiri |

Tidak memakai permission `jamaah.update` — hanya jamaah yang tertaut ke `users.jamaah_id`.

## Field yang boleh diubah

nama, gender, tanggal_lahir, pekerjaan_id, pendidikan, status_pernikahan, alamat, rt, rw, no_hp, email, adm_desa_kelurahan_id, kode_pos

## Field terkunci

nik, kelompok_id, dapukan_ids, status

## UI

- Route FE: `/profil` dan `/profil?edit=1`
- Komponen: `UserMenu` di AppShell
