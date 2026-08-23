# Kalender — Tombol Hari ini

Date: 2026-08-08

## Acceptance criteria

1. Di **Informasi → Kalender**, toolbar punya tombol **Hari ini** di samping filter Bulan/Tahun.
2. Klik **Hari ini** mengatur bulan & tahun ke tanggal lokal hari ini, lalu memilih sel tanggal hari ini (panel detail ikut).
3. Jika sudah di bulan/tahun hari ini dan tanggal hari ini terpilih, tombol **disabled**.
4. Sel hari ini punya penanda visual (`calendar-cell--today`) + `aria-current="date"`.

## Manual check

1. Buka `/kalender`, pilih bulan/tahun lain → klik **Hari ini** → grid & detail kembali ke hari ini.
2. Di bulan berjalan, pilih tanggal lain → klik **Hari ini** → detail kembali ke hari ini; tombol disabled setelah itu.
