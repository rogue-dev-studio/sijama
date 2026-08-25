# SRS — Master Lokasi: titik Google Maps & share lokasi

Version: 1.1.0
Status: Approved (asumsi tertulis)
Author: business-analyst, system-analyst
Last Updated: 2026-08-25
Project: sijama

## Tujuan

Master Lokasi menyimpan koordinat (latitude/longitude) agar petugas dapat menandai titik di Google Maps dan membagikan tautan lokasi ke jamaah/panitia.

## Scope

- Form tambah/edit Master Lokasi: input koordinat, tempel tautan Google Maps, ambil lokasi perangkat, pratinjau peta, salin/buka tautan share.
- Daftar Master Lokasi: aksi buka/salin tautan Google Maps jika koordinat ada.
- Backend: kolom `lat`/`lng` sudah ada — tidak mengubah kontrak API kecuali perilaku UI yang mengirim field tersebut.

## Out of scope

- Google Maps JavaScript API key / billing Google Cloud.
- Geocoding alamat teks → koordinat otomatis.
- Pelacakan GPS real-time kehadiran.

## Acceptance Criteria

1. Pengguna dapat **mengklik peta** di form lokasi untuk menandai titik (atau menggeser penanda).
2. Pengguna dengan `lokasi.create` / `lokasi.update` dapat mengisi `lat` dan `lng` (opsional) pada form lokasi.
3. Tempel tautan Google Maps yang mengandung koordinat → field `lat`/`lng` terisi.
4. Tombol ambil lokasi perangkat mengisi koordinat (izin browser; error ditampilkan jika ditolak/gagal).
5. Jika `lat`/`lng` valid, tautan share `https://www.google.com/maps?q={lat},{lng}` dapat dibuka/disalin.
6. Di daftar lokasi, baris dengan koordinat menampilkan aksi Maps (buka) dan Salin link.
7. Lokasi tanpa koordinat tetap dapat disimpan; aksi Maps tidak ditampilkan.

## Asumsi

- Koordinat opsional agar data seed lama tetap valid.
- Pemilih titik interaktif memakai peta OpenStreetMap (Leaflet) agar tidak wajib API key Google; **share** tetap URL publik Google Maps.
- Short link Google tanpa koordinat di URL tidak di-resolve otomatis.
