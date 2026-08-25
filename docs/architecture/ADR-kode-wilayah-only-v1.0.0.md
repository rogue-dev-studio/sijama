# Keputusan: kolom `kode` hanya di wilayah

Version: 1.0.0  
Date: 2026-08-25

## Keputusan

Kolom bernama **`kode`** hanya untuk:

- Wilayah fungsional: `pusat`, `daerah`, `desa`, `kelompok`, `sub_kelompok`
- Wilayah administrasi: `adm_*` (termasuk `adm_kode_pos.kode`)

## Di luar wilayah

| Area | Perubahan |
|------|-----------|
| `lokasi`, `pemateri`, `materi`, `kategori_kegiatan`, `pekerjaan` | Kolom `kode` **dihapus**; relasi lewat `id` |
| `dapukan`, `menus`, `fiturs`, `hak_akses` | Kolom `kode` diganti **`slug`** (identifier sistem permission / role, bukan label wilayah) |

## Asumsi

- Permission FE tetap string (`jamaah.view`, dll.) — nilai itu adalah `hak_akses.slug`.
- Default kategori pengajian dicari by `nama = 'Pengajian'` (bukan kode).
- Kalender memakai `kategori_id` bukan `kategori_kode`.

## Migrasi

- `2026_08_25_150000_drop_kode_from_non_wilayah_masters.php`
- `2026_08_25_150100_rename_rbac_kode_to_slug.php`
