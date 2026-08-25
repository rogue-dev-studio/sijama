# UI — Halaman list vs form terpisah

Version: 1.1.0  
Date: 2026-08-25

## Pola

Seperti Jamaah: **tabel/informasi** di halaman list; **tambah/edit** di route form terpisah (`/new`, `/:id/edit`).

## Sudah dipisah

| Modul | List | Form |
|-------|------|------|
| Jamaah | `/jamaah` | `/jamaah/new`, `/jamaah/:id/edit` |
| Pengajian | `/pengajian` | `/pengajian/new`, `/pengajian/:id/edit` |
| Kegiatan | `/kegiatan` | `/kegiatan/new`, `/kegiatan/:id/edit` |
| Pusat | `/master/pusat` | `.../new`, `.../:id/edit` |
| Daerah | `/master/daerah` | `.../new`, `.../:id/edit` |
| Desa | `/master/desa` | `.../new`, `.../:id/edit` |
| Kelompok | `/master/kelompok` | `.../new`, `.../:id/edit` |
| Sub Kelompok | `/master/sub-kelompok` | `.../new`, `.../:id/edit` |
| Lokasi | `/master/lokasi` | `.../new`, `.../:id/edit` |
| Pemateri | `/master/pemateri` | `.../new`, `.../:id/edit` |
| Pekerjaan | `/master/pekerjaan` | `.../new`, `.../:id/edit` |
| Materi | `/master/materi` | `.../new`, `.../:id/edit` |
| Kategori Kegiatan | `/master/kategori-kegiatan` | `.../new`, `.../:id/edit` |
| Adm Negara | `/master/adm/negara` | `.../new`, `.../:id/edit` |
| Adm Provinsi | `/master/adm/provinsi` | `.../new`, `.../:id/edit` |
| Adm Kabupaten/Kota | `/master/adm/kabupaten-kota` | `.../new`, `.../:id/edit` |
| Adm Kecamatan | `/master/adm/kecamatan` | `.../new`, `.../:id/edit` |
| Adm Desa/Kelurahan | `/master/adm/desa-kelurahan` | `.../new`, `.../:id/edit` |
| Adm Kode Pos | `/master/adm/kode-pos` | `.../new`, `.../:id/edit` |
| Dapukan | `/master/dapukan` | `.../new`, `.../:id/edit` |
| Menu | `/master/menu` | `.../new`, `.../:id/edit` |
| Fitur | `/master/fitur` | `.../new`, `.../:id/edit` |
| Hak Akses | `/master/hak-akses` | `.../new`, `.../:id/edit` |
| Pengguna | `/master/users` | `.../new`, `.../:id/edit` |

## Pengecualian (sengaja satu halaman)

| Modul | Alasan |
|-------|--------|
| Matriks hak akses | UI matriks checklist; bukan CRUD form tunggal |
| Absensi / Kehadiran / Kalender | Alur operasional, bukan master CRUD list+form |
