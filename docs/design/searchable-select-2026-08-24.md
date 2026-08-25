# Searchable select (Select2-like)

Tanggal: 2026-08-24

## Ringkasan

Semua dropdown form/filter di frontend diganti ke komponen `SearchableSelect` dengan kotak pencarian (mirip Select2), tanpa dependency baru.

## Komponen

- `frontend/src/components/SearchableSelect.tsx`
- Style: `.search-select*` di `frontend/src/App.css`

## Perilaku

- Klik trigger → panel + input cari
- Filter opsi by label (case-insensitive)
- Keyboard: ArrowUp/Down, Enter, Escape
- Validasi `required` via hidden input native
- Pagination per-page tetap native `<select>` (opsi sedikit)

## Cakupan

Semua halaman di `frontend/src/pages` yang sebelumnya memakai `<select>` form/filter.
