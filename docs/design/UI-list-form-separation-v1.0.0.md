# UI — Halaman list vs form terpisah

Version: 1.0.0  
Date: 2026-08-03

## Pola

Seperti Jamaah: **tabel/informasi** di halaman list; **tambah/edit** di route form terpisah (`/new`, `/:id/edit`).

## Sudah dipisah

| Modul | List | Form |
|-------|------|------|
| Jamaah | `/jamaah` | `/jamaah/new`, `/jamaah/:id/edit` |
| Pengajian | `/pengajian` | `/pengajian/new`, `/pengajian/:id/edit` |
| Kegiatan | `/kegiatan` | `/kegiatan/new`, `/kegiatan/:id/edit` |
| Lokasi | `/master/lokasi` | `.../new`, `.../:id/edit` |
| Pemateri | `/master/pemateri` | `.../new`, `.../:id/edit` |
| Pekerjaan | `/master/pekerjaan` | `.../new`, `.../:id/edit` |
| Materi | `/master/materi` | `.../new`, `.../:id/edit` |
| Kategori Kegiatan | `/master/kategori-kegiatan` | `.../new`, `.../:id/edit` |
| Pengguna | `/master/users` | `.../new`, `.../:id/edit` |

## Belum (masih inline)

Wilayah fungsional/administrasi, dapukan, menu, fitur, hak akses — bisa dipisah dengan pola yang sama bila diminta.
