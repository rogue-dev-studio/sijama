# ADR — Squash migrations ke baseline bersih

Version: 1.0.0  
Date: 2026-08-25  
Status: Accepted

## Context

Ada 38 migration incremental (alter/rename/drop `kode`, backfill username, dll.). Project masih early; boleh `migrate:fresh` + seed lokal/Aiven.

## Decision

Ganti seluruh history migration dengan **8 create baseline** (final schema saja):

1. `2026_08_25_180000_create_framework_tables`
2. `2026_08_25_180001_create_wilayah_administrasi_tables`
3. `2026_08_25_180002_create_organisasi_wilayah_tables`
4. `2026_08_25_180003_create_rbac_tables` (`slug`, bukan `kode`)
5. `2026_08_25_180004_create_jamaah_and_pekerjaan_tables` (+ FK users domain; partial unique NIK pgsql)
6. `2026_08_25_180005_create_event_master_tables` (tanpa `kode` master non-wilayah)
7. `2026_08_25_180006_create_attendance_tables`
8. `2026_08_25_180007_create_hari_libur_table`

Data master tetap dari **seeders**, bukan dari migration.

## Consequences

- Environment yang sudah punya data lama harus `migrate:fresh --seed` (data hilang).
- Tidak ada jalur upgrade incremental dari 38 file lama.
- Setelah squash, migration baru lagi mengikuti rule incremental biasa.
