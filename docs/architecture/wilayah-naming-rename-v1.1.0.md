# Wilayah Naming Rename v1.1.0

Selaraskan FK, permission slug, route param, dan API JSON dengan nama tabel baru.

## FK columns

| Legacy | Baru |
|--------|------|
| `negara_id` | `wilayah_adm_negara_id` |
| `provinsi_id` | `wilayah_adm_provinsi_id` |
| `kabupaten_kota_id` | `wilayah_adm_kabupaten_kota_id` |
| `kecamatan_id` | `wilayah_adm_kecamatan_id` |
| `desa_kelurahan_id` | `wilayah_adm_desa_id` |
| `adm_desa_kelurahan_id` | `wilayah_adm_desa_id` |
| `pusat_id` | `wilayah_fung_pusat_id` |
| `daerah_id` | `wilayah_fung_daerah_id` |
| `desa_id` | `wilayah_fung_desa_id` |
| `kelompok_id` | `wilayah_fung_kelompok_id` |

**Tetap:** `dapukan.tingkat` values (`pusat`, `daerah`, `desa`, `kelompok`) — level organisasi, bukan nama entitas.

## Permission slug prefix

| Legacy | Baru |
|--------|------|
| `adm_negara` | `wilayah_adm_negara` |
| `adm_provinsi` | `wilayah_adm_provinsi` |
| `adm_kabupaten_kota` | `wilayah_adm_kabupaten_kota` |
| `adm_kecamatan` | `wilayah_adm_kecamatan` |
| `adm_desa_kelurahan` | `wilayah_adm_desa` |
| `adm_kode_pos` | `wilayah_adm_kode_pos` |
| `pusat` | `wilayah_fung_pusat` |
| `daerah` | `wilayah_fung_daerah` |
| `desa` | `wilayah_fung_desa` |
| `kelompok` | `wilayah_fung_kelompok` |
| `sub_kelompok` | `wilayah_fung_sub_kelompok` |

## API routes (path + route param)

| Legacy path | Baru path | Legacy param | Baru param |
|-------------|-----------|--------------|------------|
| `master/pusat` | `master/wilayah-fung/pusat` | `pusat` | `wilayah_fung_pusat` |
| `master/daerah` | `master/wilayah-fung/daerah` | `daerah` | `wilayah_fung_daerah` |
| `master/desa` | `master/wilayah-fung/desa` | `desa` | `wilayah_fung_desa` |
| `master/kelompok` | `master/wilayah-fung/kelompok` | `kelompok` | `wilayah_fung_kelompok` |
| `master/sub-kelompok` | `master/wilayah-fung/sub-kelompok` | `sub_kelompok` | `wilayah_fung_sub_kelompok` |
| `master/adm/negara` | `master/wilayah-adm/negara` | `adm_negara` | `wilayah_adm_negara` |
| `master/adm/provinsi` | `master/wilayah-adm/provinsi` | `adm_provinsi` | `wilayah_adm_provinsi` |
| `master/adm/kabupaten-kota` | `master/wilayah-adm/kabupaten-kota` | `adm_kabupaten_kota` | `wilayah_adm_kabupaten_kota` |
| `master/adm/kecamatan` | `master/wilayah-adm/kecamatan` | `adm_kecamatan` | `wilayah_adm_kecamatan` |
| `master/adm/desa-kelurahan` | `master/wilayah-adm/desa` | `adm_desa_kelurahan` | `wilayah_adm_desa` |
| `master/adm/kode-pos` | `master/wilayah-adm/kode-pos` | `adm_kode_pos` | `wilayah_adm_kode_pos` |

## Eloquent relation methods

| Legacy method | Baru | FK |
|---------------|------|----|
| `pusat()` | `wilayahFungPusat()` | `wilayah_fung_pusat_id` |
| `daerah()` | `wilayahFungDaerah()` | `wilayah_fung_daerah_id` |
| `desa()` (fungsional) | `wilayahFungDesa()` | `wilayah_fung_desa_id` |
| `kelompok()` | `wilayahFungKelompok()` | `wilayah_fung_kelompok_id` |
| `negara()` | `wilayahAdmNegara()` | `wilayah_adm_negara_id` |
| `provinsi()` | `wilayahAdmProvinsi()` | `wilayah_adm_provinsi_id` |
| `kabupatenKota()` | `wilayahAdmKabupatenKota()` | `wilayah_adm_kabupaten_kota_id` |
| `kecamatan()` | `wilayahAdmKecamatan()` | `wilayah_adm_kecamatan_id` |
| `desaKelurahan()` / `admDesaKelurahan()` | `wilayahAdmDesa()` | `wilayah_adm_desa_id` |

Eager-load dan `whenLoaded()` wajib memakai nama baru. Nama class PHP (`Pusat`, `Daerah`, `Kelompok`, `AdmProvinsi`, …) boleh tetap.

## API JSON nested keys

| Legacy | Baru |
|--------|------|
| `negara` (nested parent) | `wilayah_adm_negara` |
| `adm_desa_kelurahan` | `wilayah_adm_desa` |
| `adm_kecamatan` | `wilayah_adm_kecamatan` |
| `adm_kabupaten_kota` | `wilayah_adm_kabupaten_kota` |
| `adm_provinsi` | `wilayah_adm_provinsi` |
| `pusat` (nested) | `wilayah_fung_pusat` |
| `daerah` (nested) | `wilayah_fung_daerah` |
| `desa` (nested) | `wilayah_fung_desa` |
| `kelompok` (nested) | `wilayah_fung_kelompok` |

## Menu slug (RbacSeeder)

| Legacy | Baru |
|--------|------|
| `master-pusat` | `master-wilayah-fung-pusat` |
| `master-adm-negara` | `master-wilayah-adm-negara` |
| (dst. ikuti path baru) | |

Parent menu `wilayah-admin` → `wilayah-adm` (opsional, selaraskan).

## Prefix kanonical (v1.1.1)

| Domain | Prefix | Contoh tabel | Contoh FK |
|--------|--------|--------------|-----------|
| Wilayah administrasi | `wilayah_adm_` | `wilayah_adm_negara_m` | `wilayah_adm_negara_id` |
| Wilayah fungsional | `wilayah_fung_` | `wilayah_fung_pusat_m` | `wilayah_fung_pusat_id` |

URL path: `master/wilayah-adm/*`, `master/wilayah-fung/*` (kebab-case).
