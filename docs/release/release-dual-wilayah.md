# Release notes — Dual Wilayah

| Field | Value |
|-------|--------|
| Date | 2026-08-01 |
| Env | local Docker |

## Delivered

- Wilayah fungsional: Pusat → Daerah → Desa → Kelompok (+ scope tingkat `pusat`)
- Wilayah administrasi (tabel `adm_*`): Negara → Provinsi → Kab/Kota → Kecamatan → Desa/Kelurahan + Kode Pos (standar Kemendagri)
- UI menu terpisah; jamaah optional `adm_desa_kelurahan_id` + `kode_pos`
- Sample seed: Indonesia / Jawa Barat / Kota Bandung / Sukasari / Gegerkalong / 40152

## Ops

```powershell
docker compose up -d --build
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --class=RbacSeeder --force
docker compose exec backend php artisan db:seed --class=WilayahAdministrasiSeeder --force
```

Relogin agar menu/permission baru ter-load.

## Out of scope

- Import penuh dataset Kepmendagri nasional
- VIEW/MV performa (belum diperlukan)
