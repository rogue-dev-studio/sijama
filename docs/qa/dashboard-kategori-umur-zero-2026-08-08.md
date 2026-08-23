# Dashboard — Kategori umur tampilkan 0

Date: 2026-08-08

## Change

`DashboardService::buildChartKategoriUmur` no longer skips categories with `value = 0`. All codes in `JamaahKategoriUmur::VALUES` are returned (label + count, including 0).

## AC

1. Chart **Kategori umur** lists every master kategori (Bayi … Lansia).
2. Categories without jamaah aktif show **0**.
3. Categories with jamaah show the correct count.

## Manual check

Refresh Dashboard (BE bind-mount; no rebuild). Confirm zero rows appear.
