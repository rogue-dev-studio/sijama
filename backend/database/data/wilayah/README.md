# Data wilayah administrasi & kode pos

## Wilayah (wajib)

CSV dari **lokabisa-oss/region-id** (Kepmendagri 2025):

| File | Isi |
|------|-----|
| `provinces.csv` | Provinsi |
| `regencies.csv` | Kabupaten/Kota |
| `districts.csv` | Kecamatan |
| `villages.csv` | Desa/Kelurahan |
| `sni_provinces.csv` | Singkatan provinsi (SNI 7657:2010, format `ID-XX`) |
| `sni_regencies.csv` | Singkatan kab/kota (3 huruf SNI) + kawasan metropolitan |

Seeder: `WilayahAdministrasiSeeder`

Regenerasi mapping SNI setelah update `regencies.csv`:

```powershell
docker exec sijama-backend-1 php scripts/generate-sni-abbreviations.php
```

## Kode pos (opsional, untuk auto-isi)

Unduh dari **[lokabisa-oss/postal-code-id v2026Q1](https://github.com/lokabisa-oss/postal-code-id/releases/tag/v2026Q1)** — file `postal_codes_pos_indonesia.csv`, simpan sebagai `postal_codes.csv` di folder ini.

```powershell
# dari project/sijama
.\scripts\fetch-postal-codes.ps1
docker exec sijama-backend-1 php artisan db:seed --class=KodePosSeeder
```

Sumber alternatif (referensi):

- [open-admin-data/indonesia-administrative-divisions](https://github.com/open-admin-data/indonesia-administrative-divisions) — CC-BY-4.0, kode pos di level desa
- [ibnumardini/wilayah-indonesia](https://github.com/ibnumardini/wilayah-indonesia) — transform dari API BPS

**Catatan:** dataset Pos Indonesia lookup bersifat referensi operasional, bukan regulasi resmi.
