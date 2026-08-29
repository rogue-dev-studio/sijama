# QA — Cleanup master Pekerjaan → Lookup

Tanggal: 2026-08-27  
Project: sijama

## Scope

Hapus sisa CRUD master `pekerjaan` (sudah diganti `lookup_m` tipe `pekerjaan`).

## Dihapus

- `PekerjaanController`, `PekerjaanService`, `Pekerjaan` model
- `PekerjaanResource`, `StorePekerjaanRequest`, `UpdatePekerjaanRequest`
- `PekerjaanSeeder` (data sekarang di `LookupMSeeder`)

## Dipertahankan

- `jamaah.pekerjaan` / `pekerjaan_id` + relasi `pekerjaanRef` → `lookup_m`
- Form jamaah / profil memakai opsi lookup tipe `pekerjaan`
- Menu aktif: `master-lookup`

## RBAC

- `RbacSeeder::purgeObsoletePekerjaanMaster()` menonaktifkan menu/fitur `master-pekerjaan` dan menghapus hak akses `pekerjaan.*` + pivot dapukan

## Cek

1. `php artisan db:seed --class=RbacSeeder` (local) — menu Pekerjaan tidak aktif
2. Master → Lookup → filter tipe pekerjaan OK
3. Form jamaah / profil dropdown pekerjaan OK
4. Tidak ada route `/api/pekerjaan` (sudah tidak terdaftar sebelumnya)
