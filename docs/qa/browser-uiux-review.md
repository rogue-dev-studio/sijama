# Browser / Completeness Review — SIJAMA

Date: 2026-08-01  
URL: http://localhost:5173

## Gap yang dilengkapi (sesi ini)

| Gap | Perbaikan |
|-----|-----------|
| Dashboard tanpa grafik | Chart absensi 7 hari, jamaah per kelompok, status aktif/nonaktif |
| Filter tanpa “Semua” | Default Semua; tombol Hapus filter; desa/kelompok tidak lagi auto-pilih item pertama |
| Pagination tidak dipakai FE | Komponen Pagination + `page`/`per_page` di list utama |

## Smoke

`scripts/browser-review.mjs` → **10/10 pass**

## API cek

- `GET /dashboard` → `chart_absensi_7_hari` (7), `chart_jamaah_per_kelompok`, `chart_status_jamaah`
- `GET /jamaah?page=1&per_page=10` → meta pagination
- `GET /master/desa` tanpa `daerah_id` → semua desa

## Masih bisa ditingkatkan (backlog)

- Bulk checkbox “pilih semua baris” untuk aksi massal
- Grafik interaktif (tooltip/library) jika dibutuhkan
- Pagination di dropdown absensi (ref list) jika data besar
