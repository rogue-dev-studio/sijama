# Responsive / mobile density — 2026-09-04

## Theme gate

Selaras UI existing SIJAMA (token warna/tipografi di `index.css`, shell di `App.css`). Tidak mengubah arah visual brand; hanya densitas & konsistensi layout mobile.

## Masalah

- Gutter + panel padding + section gap terlalu longgar di ≤767px
- Tombol page-header full-width bertumpuk vertikal
- Kontrol filter mobile justru lebih tinggi (2.75rem)
- Clearance bottom-nav hardcoded 5.5rem
- Bleed kamera hardcode ±1rem

## Perubahan

| Area | Perubahan |
|------|-----------|
| Tokens | `--page-gutter` / `--panel-padding` / `--section-gap` diperkecil di ≤767px; `--bottom-nav-clearance`, `--touch-control-height` |
| Shell | Header lebih pendek; main pakai clearance token + safe-area |
| Page header | Judul 1.25rem; aksi wrap intrinsic (bukan full-bleed stack) |
| Filter | Control 2.375rem; padding lebih ramping; legacy actions tidak full-width |
| Drawer filter | Padding & field lebih padat |
| Tabel / form / pagination | Padding cell & button dipadatkan; scroll-x tetap |
| Login / gate | Padding lebih kecil di mobile |

## Breakpoint

- Mobile chrome: `max-width: 767px` (selaras shell + `useIsMobileFilterLayout`)
- Form 2-kolom: `min-width: 640px`

## Pass 2 (margin / padding / font / tombol)

- Token lebih ketat: gutter `0.625rem`, panel/section `0.5rem`, touch control `2.25rem`
- Base `html` mobile: `15px` (input tetap `16px` agar iOS tidak zoom)
- Global `.btn` / `.btn--small` / icon dipadatkan
- Field, search-select, date-field, label, hint dipadatkan
- Dashboard panel/stat, pagination, tabs, confirm/share sheet, login title dipadatkan
- Bottom nav ≤360px tidak lagi *menaikkan* tinggi item

## Verifikasi manual

- [ ] Dashboard + list Jamaah/Kehadiran di ~390px: header + filter tidak makan viewport
- [ ] Page header dengan Export/Share/Tambah: tombol wrap, tidak full-width stack
- [ ] Form: label/input/tombol rapi, fokus input tidak zoom di iOS
- [ ] Filter drawer: field & tombol Terapkan nyaman disentuh
- [ ] Tabel lebar: scroll horizontal tanpa overflow body
- [ ] Landscape pendek: konten tidak tertutup bottom-nav
- [ ] Desktop ≥768: sidebar + padding desktop tidak berubah
