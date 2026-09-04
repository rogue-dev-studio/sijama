# Database Reporting Views — v1.2.0

PostgreSQL-only objects untuk mempercepat dashboard dan laporan saat data bertambah.

## Objek

| Objek | Tipe | Fungsi |
|-------|------|--------|
| `jamaah_wilayah_v` | VIEW | Jamaah + kelompok/desa/daerah/pusat (hilangkan `whereHas` 3 level) |
| `jamaah_kelompok_aktif_mv` | MATERIALIZED VIEW | Jumlah jamaah aktif per kelompok + scope wilayah |
| `jamaah_kategori_umur_mv` | MATERIALIZED VIEW | Agregasi kategori umur per scope wilayah |
| `absensi_harian_stats_mv` | MATERIALIZED VIEW | Absensi harian per kategori umur + scope |
| `laporan_kehadiran_v` | VIEW | Join absensi + jamaah + sesi (siap dipakai laporan) |
| `refresh_reporting_fn()` | FUNCTION | Refresh CONCURRENTLY semua MV |

## Index tambahan

- `absensi_t (recorded_at, jamaah_id)`, `absensi_t (method)`
- `absensi_sesi_t (opened_at)`
- `jamaah_r (status, kelompok_id)`, `jamaah_r (status, kategori_umur)`
- `kegiatan_t (tanggal, kategori_kegiatan_id)`, `kegiatan_t (tanggal, status)`
- `kegiatan_materi_mp (materi_id)`

## Definisi SQL

Satu file per objek di `backend/database/migrations/definitions/`:

| File | Migration |
|------|-----------|
| `jamaah_wilayah_v.sql` | `000047` |
| `jamaah_kelompok_aktif_mv.sql` | `000048` |
| `jamaah_kategori_umur_mv.sql` | `000049` |
| `absensi_harian_stats_mv.sql` | `000050` |
| `laporan_kehadiran_v.sql` | `000051` |
| `refresh_reporting_fn.sql` | `000052` |

Reverse teardown: `down()` di file migrasi PHP terkait (bukan file SQL terpisah).

## Suffix reporting

- `_v` — view biasa (non-materialized)
- `_mv` — **hanya** materialized view
- `_fn` — **hanya** PostgreSQL function (contoh: `refresh_reporting_fn()`); jangan gabung `_mv` di nama function

## Refresh

Materialized view **tidak** real-time. Scheduler:

```bash
php artisan reporting:refresh-views
```

Dijadwalkan setiap **15 menit** (`bootstrap/app.php`).

Jalankan manual setelah import data besar atau migrasi.

## Aplikasi

`DashboardService` memakai `ReportingViewService` otomatis bila PostgreSQL + MV tersedia. SQLite (PHPUnit) tetap memakai query legacy.
