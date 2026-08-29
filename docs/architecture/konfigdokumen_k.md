# konfigdokumen_k — Document Header/Footer Config (per lookup)

## Purpose

Konfigurasi header/footer cetak–ekspor **per jenis cetakan**. Jenis cetakan diambil dari Master Lookup dengan `lookup_type = konfig_dokumen`:

| Field lookup | Arti |
|--------------|------|
| `lookup_name` | Label cetakan (mis. Cetakan Laporan Jamaah) |
| `lookup_value` | Kunci cetakan dipakai FE (`dokumenKey`, mis. `laporan_jamaah`) |

Satu baris `konfigdokumen_k` ↔ satu `lookup_id`. Soft-delete via `is_deleted`.

## Columns

| Group | Columns |
|-------|---------|
| PK / FK | `konfigdokumen_id`, `lookup_id` (unique partial aktif) |
| Audit | created/modified/deleted + `modified_count`, `is_active`, `is_deleted` |
| Content | `header`, `header_detail`, `footer`, `footer_detail` |
| Kop | `path_logo_kiri`, `path_logo_kanan`, `layout_mode` (`biasa`\|`kop_ganda`\|`kop_kiri`\|`kop_kanan`\|`kop_atas`), `header_style` (JSON tipografi) |
| Media | `apply_pdf`, `apply_excel`, `apply_csv` |

### `header_style` keys

`header_font_size`, `header_font_weight`, `header_align`, `header_detail_font_size`, `header_detail_font_weight`, `header_detail_color`, `logo_max_height`, `footer_font_size`

## Master Lookup

- Tipe lookup **diisi manual** (bukan dropdown tipe baku jamaah).
- Untuk cetakan: ketik `konfig_dokumen`, isi nama + value.

## Menu & API

- List (paginated, seperti master): `/aplikasi/konfig-dokumen`
- Edit: `/aplikasi/konfig-dokumen/{lookupId}/edit`
- `GET /api/aplikasi/konfig-dokumen?q=&page=&per_page=` → `{ items, meta }`
- `GET /api/aplikasi/konfig-dokumen/{lookupId}`
- `PUT /api/aplikasi/konfig-dokumen` body wajib `lookup_id` (+ layout/style)
- `POST|DELETE /api/aplikasi/konfig-dokumen/{lookupId}/assets/{logo-kiri|logo-kanan}`
- Public: `dokumen.items[lookup_value]` di `GET /api/public/konfig` (termasuk logo + style)

## Seed

`KonfigDokumenSeeder` membuat lookup + config default untuk laporan_*, jamaah, pengajian, kegiatan, kehadiran, kategori_umur, master_users, matriks, master_list.
