# SRS Addendum — Hierarki Daerah / Desa / Kelompok + Scope Akses

Version: 1.2.0  
Date: 2026-08-01  
Project: sijama

## Hierarki identitas

```
Daerah → Desa → Kelompok → Jamaah
```

Contoh seed:
- Daerah: Bandung Utara, Bandung Timur
- Desa: Bojonegara, Cikutra
- Kelompok: Pajajaran Timur, Pajajaran Barat, Babakan Jeruk

## Dapukan bertingkat

| Kode | Tingkat | Scope data |
|------|---------|------------|
| superadmin | global | Semua jamaah/kelompok |
| admin_daerah | daerah | Semua data dalam daerah user |
| admin_desa | desa | Semua data dalam desa user |
| admin_kelompok | kelompok | Hanya kelompok user |
| 5s_daerah | daerah | Sedaerah (hak 5S) |
| 5s_desa | desa | Sedesa (hak 5S) |
| 5s_kelompok | kelompok | Sekelompok (hak 5S) |
| jamaah_kelompok | kelompok | Lihat data sekelompok (terbatas) |

Legacy `admin` / `5s` diganti / dipetakan ke `admin_kelompok` / `5s_kelompok`.

## User scope fields

- `daerah_id` wajib jika tingkat daerah
- `desa_id` wajib jika tingkat desa (desa harus milik daerah yang sama bila diisi)
- `kelompok_id` wajib jika tingkat kelompok

## Master baru

CRUD: daerah, desa (FK daerah), kelompok (FK desa)

## FR

| ID | Requirement |
|----|-------------|
| FR-S01 | Master daerah/desa/kelompok |
| FR-S02 | Jamaah wajib punya kelompok_id |
| FR-S03 | Superadmin akses semua |
| FR-S04 | Admin/5S/jamaah filter otomatis sesuai tingkat |
| FR-S05 | User master assign dapukan + scope |
| FR-S06 | Menu master daerah/desa/kelompok di RBAC |
