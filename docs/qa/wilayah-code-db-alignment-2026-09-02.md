# QA — Selaras kode ↔ database wilayah

| Field | Value |
|-------|--------|
| Date | 2026-09-02 |
| Related | `docs/architecture/database-table-naming-v1.0.0.md`, `docs/architecture/wilayah-naming-rename-v1.1.0.md` |

## Masalah

Frontend master wilayah (contoh Kabupaten/Kota) membaca parent nested `wilayah_adm_negara` / `wilayah_adm_provinsi`. Relasi Eloquent sempat masih `negara()` / `desa()` / `kelompok()` tanpa FK eksplisit, sehingga Laravel mencari `daerah_id` / `kelompok_id` dan JSON parent kosong.

## Perbaikan

- Relasi model: `wilayahFung*` / `wilayahAdm*` + FK `wilayah_fung_*_id` / `wilayah_adm_*_id`.
- Eager-load sisa: Profile, Lokasi, NIK resolver, Kelompok options, jadwal rutin, laporan kehadiran.
- JSON nested: `wilayah_adm_*` / `wilayah_fung_*` (bukan `negara` / `desa` / `kelompok`).
- Label rantai adm (profil + Maps): `wilayah_adm_negara` … `wilayah_adm_desa`.
- Tetap: `dapukan.tingkat` / `scope_level` (`pusat`/`daerah`/`desa`/`kelompok`); alias view SQL `kelompok_nama` pada laporan kehadiran.

## Cek otomatis

| # | Case | Expected |
|---|------|----------|
| 1 | `GET /master/wilayah-adm/provinsi` | `data.items[].wilayah_adm_negara` terisi |
| 2 | `GET /master/wilayah-adm/kabupaten-kota` | `data.items[].wilayah_adm_provinsi` terisi |
| 3 | `GET /jamaah/kelompok-options` | `data[].wilayah_fung_desa` terisi |
| 4 | Form jamaah NIK 6 digit | hint memakai `wilayah_adm_kecamatan.nama` |

Tes: `php artisan test --filter=WilayahNamingJsonTest` (DB `sijama_testing` saja).

## Cek manual

| # | Case | Expected |
|---|------|----------|
| 1 | Master Kabupaten/Kota → filter Provinsi | Label `Nama · Negara`, bukan kosong |
| 2 | Master Kecamatan → filter Kab/Kota | Label `Nama · Provinsi` |
| 3 | Form jamaah → pilih kelompok | Label `kode desa — nama kelompok` |
| 4 | Form lokasi / kode pos cascade | Parent terisi setelah pilih desa |
