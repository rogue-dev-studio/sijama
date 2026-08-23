# SRS — Dual Wilayah (Fungsional vs Administrasi)

| Field | Value |
|-------|--------|
| Project | SIJAMA |
| Version | 1.0.0 |
| Date | 2026-08-01 |
| Status | Approved (E2E) |

## 1. Goal

Memisahkan dua kategori wilayah yang berbeda konsep dan tabel:

1. **Wilayah fungsional** (organisasi SIJAMA): `pusat` → `daerah` → `desa` → `kelompok`
2. **Wilayah administrasi** (standar RI / Kemendagri): `negara` → `provinsi` → `kabupaten/kota` → `kecamatan` → `desa/kelurahan` (+ `kode pos`)

## 2. Actors

- Superadmin: kelola kedua kategori
- Admin tingkat fungsional (`pusat`/`daerah`/`desa`/`kelompok`): cakupan data operasional
- Operator: baca administrasi untuk alamat jamaah (opsional)

## 3. Functional requirements

### FR-F — Wilayah fungsional

| ID | Requirement |
|----|-------------|
| FR-F1 | Hierarki: Pusat → Daerah → Desa (fungsional) → Kelompok |
| FR-F2 | Tabel `pusat` baru; `daerah.pusat_id` wajib setelah migrasi data |
| FR-F3 | Tabel `desa` fungsional **bukan** desa/kelurahan administratif |
| FR-F4 | Scope RBAC menambah tingkat `pusat` (di bawah `global`) |
| FR-F5 | User scope: `pusat_id` (+ daerah/desa/kelompok sesuai tingkat) |

### FR-A — Wilayah administrasi

| ID | Requirement |
|----|-------------|
| FR-A1 | Tabel terpisah ber-prefix `adm_*` |
| FR-A2 | Kode mengikuti struktur Kemendagri (Permendagri 58/2021; update Kepmendagri 300.2.2-2138/2025): Prov 2 digit, Kab/Kota 4, Kec 6, Desa/Kel 10 |
| FR-A3 | Kab/Kota punya `jenis` = `kabupaten` \| `kota` |
| FR-A4 | Desa/Kelurahan punya `jenis` = `desa` \| `kelurahan` \| `desa_adat` |
| FR-A5 | Kode pos (5 digit) terkait desa/kelurahan (dan opsional kecamatan) |
| FR-A6 | Seed referensi: Indonesia + sampel subset (bukan full national dump di Phase 1) |
| FR-A7 | Jamaah boleh punya referensi opsional ke `adm_desa_kelurahan` + `kode_pos` |

## 4. Non-functional

- Tidak mencampur FK fungsional ↔ administrasi kecuali mapping opsional yang eksplisit
- Cascade delete default: **restrict**
- Full dataset Kemendagri diimpor terpisah (seeder/import job), bukan wajib seed lokal

## 5. Acceptance criteria

- [ ] CRUD pusat + daerah terikat pusat
- [ ] Menu UI memisahkan Fungsional vs Administrasi
- [ ] Master administrasi CRUD + cascade filter parent
- [ ] Scope `pusat` memfilter daerah/desa/kelompok/jamaah di bawah pusat
- [ ] Dokumentasi referensi kode Kemendagri tercatat di ADR

## 6. Assumptions

- Satu negara default: Indonesia (`ID` / `IDN`)
- Nama tabel fungsional `desa` dipertahankan (label UI: “Desa fungsional”)
- Import nasional penuh out of scope Phase 1
