# Filter tanggal seragam (Dari / Sampai)

Version: 1.0.0  
Date: 2026-09-04

## Default

Saat halaman dibuka, **Dari** dan **Sampai** terisi tanggal lokal hari ini (`todayIsoDate`). Reset filter mengembalikan ke hari ini (bukan kosong).

## Halaman

| Halaman | Dari / Sampai | Catatan |
|---------|---------------|---------|
| Transaksi Kegiatan | Ya | Tanggal di slot awal agar keduanya terlihat |
| Laporan Kegiatan | Ya | Sama |
| Laporan Kehadiran | Ya | Sudah ada sebelumnya |
| Informasi Kehadiran | Ya (baru) | Filter sesi via `date_from` / `date_to` pada `opened_at` |
| Audit login / aktivitas / error log | Ya | Helper bersama |

## API

`GET /attendance/sessions` menerima `date_from` dan `date_to` (filter `whereDate` pada `opened_at`).
