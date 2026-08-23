# SRS Addendum — RBAC Dapukan / Menu / Fitur / Hak Akses

Version: 1.1.0  
Date: 2026-08-01  
Project: sijama

## Goal

Hak akses menu dan fitur berdasarkan **dapukan** (jabatan), bukan string role bebas.

## Dapukan seed (wajib)

| Kode | Nama |
|------|------|
| superadmin | Super Admin |
| admin | Admin |
| 5s | 5S |

## Masters

| Master | Isi |
|--------|-----|
| Dapukan | kode, nama, deskripsi, urutan, status, is_system |
| Menu | parent, kode, nama, path, icon, urutan, aktif |
| Fitur | menu_id, kode, nama, deskripsi, aktif |
| Hak Akses | fitur_id, kode aksi (view/create/update/delete/execute), nama |
| Mapping | dapukan ↔ hak_akses (many-to-many) |
| User | `dapukan_id` (FK); legacy `role` dihapus bertahap |

## FR

| ID | Requirement | P |
|----|-------------|---|
| FR-R01 | CRUD master dapukan (hapus dilarang jika is_system) | P0 |
| FR-R02 | CRUD master menu (hierarki) | P0 |
| FR-R03 | CRUD master fitur per menu | P0 |
| FR-R04 | CRUD master hak akses per fitur | P0 |
| FR-R05 | Assign hak akses ke dapukan (matriks) | P0 |
| FR-R06 | API `/me` mengembalikan dapukan + daftar permission + menu terfilter | P0 |
| FR-R07 | Middleware cek permission per endpoint | P0 |
| FR-R08 | Frontend menu dinamis dari API; halaman master RBAC | P0 |
| FR-R09 | Hanya superadmin kelola master RBAC; admin kelola operasional (+ sebagian master jika diberi hak) | P0 |

## Default matrix (asumsi)

- **superadmin**: semua permission
- **admin**: operasional penuh (jamaah, pengajian, kegiatan, absensi, dashboard, user kelola kecuali hapus superadmin) + baca master; tanpa ubah mapping sistem kecuali diberi
- **5s**: dashboard, lihat jamaah/jadwal/kegiatan, absensi (view + check-in)

## Out of scope

- Multi-tenant
- Field-level ACL
