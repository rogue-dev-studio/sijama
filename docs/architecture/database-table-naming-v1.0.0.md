# Konvensi Penamaan Tabel SIJAMA

Version: 1.0.0

## Suffix

| Suffix | Fungsi | Contoh |
|--------|--------|--------|
| `_m` | Master / referensi | `jamaah_r` → FK ke `kelompok_m`, `materi_m` |
| `_r` | Record / entitas utama | `jamaah_r`, `keluarga_r`, `trusted_admin_device_r` |
| `_t` | Transaksi / operasional | `kegiatan_t`, `absensi_t`, `absensi_sesi_t` |
| `_k` | Konfigurasi sistem | `konfigsystem_k`, `konfigdokumen_k` |
| `_mp` | Mapping / pivot | `kegiatan_materi_mp`, `jamaah_dapukan_mp` |
| `_fn` | Function PostgreSQL | `refresh_reporting_fn()` |
| `_mv` | Materialized view saja | `absensi_harian_stats_mv`, `jamaah_kelompok_aktif_mv` |
| `_v` | View biasa (bukan MV) | `jamaah_wilayah_v`, `laporan_kehadiran_v` |

**Jangan** memakai `_mv` pada function; function cukup diakhiri `_fn`.

## Pengecualian

- Tabel framework Laravel tetap tanpa suffix: `users`, `sessions`, `jobs`, dll.

## Migrasi

- Baseline: `database/migrations/2026_09_02_*`
- Definisi SQL PostgreSQL: `database/migrations/definitions/*.sql`
- Helper: `database/migrations/support/RunsSqlDefinitions.php`

## Peta rename (legacy → baru)

| Legacy | Baru |
|--------|------|
| `jamaah` | `jamaah_r` |
| `kegiatan` | `kegiatan_t` |
| `attendances` | `absensi_t` |
| `attendance_sessions` | `absensi_sesi_t` |
| `kelompok` | `wilayah_fung_kelompok_m` |
| `menus` | `menu_m` |
| `fiturs` | `fitur_m` |
| `kegiatan_materi` | `kegiatan_materi_mp` |
| `mv_attendance_daily_stats` | `absensi_harian_stats_mv` |

## Peta rename wilayah (v1.0.0)

| Legacy | Baru |
|--------|------|
| `adm_negara_m` | `wilayah_adm_negara_m` |
| `adm_provinsi_m` | `wilayah_adm_provinsi_m` |
| `adm_kabupaten_kota_m` | `wilayah_adm_kabupaten_kota_m` |
| `adm_kecamatan_m` | `wilayah_adm_kecamatan_m` |
| `adm_desa_kelurahan_m` | `wilayah_adm_desa_m` |
| `adm_kode_pos_m` | `wilayah_adm_kode_pos_m` |
| `pusat_m` | `wilayah_fung_pusat_m` |
| `daerah_m` | `wilayah_fung_daerah_m` |
| `desa_m` | `wilayah_fung_desa_m` |
| `kelompok_m` | `wilayah_fung_kelompok_m` |
| `sub_kelompok_m` | `wilayah_fung_sub_kelompok_m` |

Prefix `wilayah_adm_` = hierarki administratif pemerintah (Kemendagri).  
Prefix `wilayah_fung_` = hierarki organisasi SIJAMA (pusat → kelompok).

## Peta rename reporting (v1.0.0)

| Legacy | Baru |
|--------|------|
| `v_jamaah_wilayah` | `jamaah_wilayah_v` |
| `v_laporan_kehadiran` | `laporan_kehadiran_v` |
| `mv_jamaah_kelompok_aktif` | `jamaah_kelompok_aktif_mv` |
| `mv_jamaah_kategori_umur` | `jamaah_kategori_umur_mv` |
| `mv_absensi_harian_stats` | `absensi_harian_stats_mv` |
| `fn_refresh_reporting_mv()` | `refresh_reporting_fn()` |

Model Eloquent memakai nama relasi selaras tabel: `wilayahFungPusat()`, `wilayahFungDaerah()`, `wilayahFungDesa()`, `wilayahFungKelompok()`, `wilayahAdmNegara()`, `wilayahAdmProvinsi()`, `wilayahAdmKabupatenKota()`, `wilayahAdmKecamatan()`, `wilayahAdmDesa()`. Kolom FK dan API JSON memakai prefix yang sama (`wilayah_fung_*` / `wilayah_adm_*`). Nilai `dapukan.tingkat` dan `scope_level` (`pusat`/`daerah`/`desa`/`kelompok`) tetap — itu level organisasi, bukan nama tabel. Detail: `wilayah-naming-rename-v1.1.0.md`.

## FK kolom & permission (v1.1.0)

| Legacy | Baru |
|--------|------|
| `negara_id` | `wilayah_adm_negara_id` |
| `provinsi_id` | `wilayah_adm_provinsi_id` |
| `kabupaten_kota_id` | `wilayah_adm_kabupaten_kota_id` |
| `kecamatan_id` | `wilayah_adm_kecamatan_id` |
| `desa_kelurahan_id` / `adm_desa_kelurahan_id` | `wilayah_adm_desa_id` |
| `pusat_id` | `wilayah_fung_pusat_id` |
| `daerah_id` | `wilayah_fung_daerah_id` |
| `desa_id` | `wilayah_fung_desa_id` |
| `kelompok_id` | `wilayah_fung_kelompok_id` |

Permission slug, route path/param, dan JSON key: lihat `docs/architecture/wilayah-naming-rename-v1.1.0.md`.
