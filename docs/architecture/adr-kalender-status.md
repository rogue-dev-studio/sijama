# ADR: Kalender & auto status event

Date: 2026-08-04

## Context

Kalender Informasi membutuhkan agregasi kegiatan + pengajian per bulan, tanggal merah, dan warna dari kategori. Status event sebelumnya hanya manual.

## Decision

- API `GET /api/calendar?year=&month=` mengembalikan days, holidays, legend.
- Warna dari `kategori_kegiatan.calendar_color`; pengajian memakai `kategori_kegiatan_id` (default seed kode `pengajian`).
- Hari libur di tabel `hari_libur` (seed nasional dasar tahun berjalan & berikutnya).
- Auto-status via `events:update-statuses` + Laravel schedule every 5 minutes; container `scheduler` menjalankan `php artisan schedule:work`.

## Consequences

Tanpa service `scheduler`, status tidak berubah otomatis di local/Docker. Hijri dihitung di frontend (`Intl` islamic-umalqura).
