# ADR-004 — Dual Wilayah (Fungsional ≠ Administrasi)

| Field | Value |
|-------|--------|
| Status | Accepted |
| Date | 2026-08-01 |

## Context

SIJAMA memakai hierarki organisasi (daerah/desa/kelompok) yang **bukan** wilayah pemerintahan RI. Tim juga membutuhkan alamat administrasi standar Indonesia (provinsi … desa/kelurahan + kode pos).

## Decision

1. **Dua pohon data terpisah**, tanpa menyatukan kategori.
2. Fungsional: `pusat` → `daerah` → `desa` → `kelompok` (tabel tanpa prefix `adm_`).
3. Administrasi: `adm_negara` → `adm_provinsi` → `adm_kabupaten_kota` → `adm_kecamatan` → `adm_desa_kelurahan` + `adm_kode_pos`.
4. Kode administrasi menyimpan string **dengan titik** ala Kemendagri (contoh `32.73.01.1002`) + unik per level.
5. Referensi: Permendagri No. 58 Tahun 2021; pemutakhiran Kepmendagri No. 300.2.2-2138 Tahun 2025; portal Ditjen Bina Adwil Kemendagri.
6. Link opsional: `jamaah.adm_desa_kelurahan_id`, `jamaah.kode_pos`; `desa.adm_desa_kelurahan_id` (mapping soft fungsional→admin).

## Consequences

- UI/menu harus memisahkan label agar tidak bingung “Desa” fungsional vs “Desa/Kelurahan” admin.
- Dataset penuh ~80k desa tidak di-seed default; sediakan jalur import kemudian.
- Scope operasional tetap berbasis **fungsional** saja; administrasi tidak menjadi batas RBAC Phase 1.
