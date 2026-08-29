# QA — Matriks source of truth (no force-grant)

Tanggal: 2026-08-27  
Project: sijama

## Perilaku

- `MatriksService::update` sync **persis** ID yang dikirim — tidak memaksa konfig/izin lain kembali
- Menu sidebar mengikuti `permissionCodes()` untuk **semua** dapukan (termasuk superadmin)
- Setelah simpan matriks untuk dapukan user login → `auth.refresh()` (menu + permissions ikut)

## Cek

1. Superadmin: uncentang `Ubah Konfigurasi Sistem` → Simpan → tetap unchecked
2. Uncentang tab Identitas → Simpan → tab hilang di halaman Konfig
3. Uncentang `dashboard.jamaah_kelompok.view` → Simpan → chart hilang di Dashboard
4. Uncentang `jamaah.create` → Simpan → tombol tambah jamaah tidak boleh (permission)
5. `php artisan db:seed --class=RbacSeeder` mengembalikan paket default (bukan bug matriks)
