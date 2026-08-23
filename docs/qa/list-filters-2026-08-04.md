# List table filters — implementation notes

Date: 2026-08-04  
Scope: SIJAMA data table filter gaps from filter review.

## Delivered

| Area | Params |
|------|--------|
| Pengajian / Kegiatan | `date_from`, `date_to` (+ existing `q`, `status`) |
| Jamaah | `kategori_umur` |
| Lokasi / Pemateri / Materi / Pekerjaan / Kategori Kegiatan | `is_active` (Aktif/Nonaktif; `active_only` still for forms) |
| Users | `is_active`, `dapukan_id` |
| Kelompok | `daerah_id` (fixes daerah-only filter), `is_active` |
| Fitur / Hak Akses | `menu_id` / `fitur_id` (BE already had) |
| Kehadiran | session `status`; client method + nama |
| Adm Kab/Kota & Desa/Kel | `jenis` |

## Assumption

- `buildListQuery` now serializes boolean `false` as `0` so `is_active=0` works.
- Kehadiran method/nama filters are client-side on loaded session attendances.
