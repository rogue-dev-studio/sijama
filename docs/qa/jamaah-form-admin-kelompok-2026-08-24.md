# Fix form jamaah Admin Kelompok — akses ditolak

Tanggal: 2026-08-24

## Gejala

Akun dapukan Admin Kelompok membuka Tambah Jamaah:
- Alert "Akses ditolak."
- Kelompok kosong
- Dapukan kosong

## Akar masalah

1. Form memuat `GET /master/adm/negara` di awal load (butuh `adm_negara.view`).
2. Admin Daerah/Desa/Kelompok **tidak** punya hak view wilayah administratif (hanya Admin Pusat).
3. Kegagalan 403 negara membatalkan seluruh load, sehingga `kelompok-options` / `dapukan-options` tidak terpanggil.

## Perbaikan

1. `RbacSeeder`: tambah `$admWilayahViewCodes` ke `admin_daerah`, `admin_desa`, `admin_kelompok`.
2. `JamaahFormPage`: load pekerjaan / negara / kelompok / dapukan independen (negara gagal tidak memblokir form inti).

## Verifikasi

- Login Admin Kelompok → Tambah Jamaah: dropdown kelompok terisi (kelompok akun), dapukan terisi.
- Pastikan user punya `kelompok_id` di master users.
