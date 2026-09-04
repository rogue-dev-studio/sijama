# QA — Kode wilayah editable oleh Super Admin

| Field | Value |
|-------|--------|
| Date | 2026-09-02 |
| Related | Form master wilayah adm + fung (`SimpleMasterKodeFormPage`) |

## Perilaku

| Peran | Edit `kode` |
|-------|-------------|
| Super Admin | Aktif (input tidak disabled) |
| Role lain | Tetap terkunci + hint |

API men-strip `kode` dari payload update jika aktor bukan Super Admin.

Cakupan form: negara, provinsi, kabupaten/kota, kecamatan, desa/kelurahan, pusat, daerah, desa fungsional, kelompok, sub kelompok. Kode pos sudah editable sebelumnya.

## Cek

1. Login Super Admin → edit negara / pusat → field Kode dapat diubah dan tersimpan.
2. Login admin.pusat → edit yang sama → Kode disabled.
3. `php artisan test --filter=WilayahKodeEditTest` (DB `sijama_testing`).
