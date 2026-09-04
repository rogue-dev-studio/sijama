# Jadwal Rutin Kegiatan

Version: 1.0.0 · 2026-08-31

## Ringkas

Modul **Jadwal Rutin Kegiatan** membuat entri `kegiatan` otomatis dari template berulang (mingguan / bulanan / tahunan) per cakupan **daerah**, **desa**, atau **kelompok**.

## Alur bisnis

1. Operator membuat jadwal rutin (judul, kategori, lokasi, frekuensi, cakupan, tanggal berlaku).
2. Sistem langsung **generate** kegiatan untuk horizon ke depan (default 90 hari).
3. Scheduler harian (`kegiatan:generate-rutin` 00:30) melanjutkan generate untuk jadwal aktif.
4. **Ubah pola jadwal:** nonaktifkan jadwal lama → buat jadwal baru. Kegiatan yang sudah terbuat tetap ada.

## API

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/kegiatan-jadwal-rutin` | `kegiatan.view` |
| POST | `/api/kegiatan-jadwal-rutin` | `kegiatan.create` |
| GET | `/api/kegiatan-jadwal-rutin/{id}` | `kegiatan.view` |
| PUT | `/api/kegiatan-jadwal-rutin/{id}` | `kegiatan.update` |
| POST | `/api/kegiatan-jadwal-rutin/{id}/deactivate` | `kegiatan.update` |
| POST | `/api/kegiatan-jadwal-rutin/{id}/generate` | `kegiatan.create` |

## UI

- Menu: **Transaksi → Jadwal Rutin Kegiatan** (`/kegiatan/jadwal-rutin`)
- Tombol **Jadwal Rutin** di halaman daftar kegiatan

## Command

```bash
php artisan kegiatan:generate-rutin
```

## Schema

- `kegiatan_jadwal_rutin` — template jadwal
- `kegiatan.jadwal_rutin_id` — link instance ke template (unique per tanggal)
