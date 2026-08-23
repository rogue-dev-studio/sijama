# SRS — Master Lokasi / Pemateri / Materi / Kategori Kegiatan

Version: 1.0.0
Status: Approved
Author: business-analyst, system-analyst
Last Updated: 2026-08-03
Project: sijama

## Tujuan

Master referensi untuk pengajian & kegiatan: lokasi LDII (masjid, GSG, PPM, aula, kantor), pemateri, materi, kategori kegiatan. Form transaksi memilih dari master (bisa dicari).

## Lokasi

Jenis: `masjid`, `gsg`, `ppm`, `aula`, `kantor`, `lainnya`.

Seed awal dari direktori publik LDII (~560+ entri masjid/PPM/kantor/GSG). Bukan klaim katalog resmi lengkap nasional; dapat ditambah via Master → Lokasi.

## Status pernikahan (jamaah)

`belum_menikah`, `sudah_menikah`, `cerai_hidup`, `cerai_mati`.

Klasifikasi umur: pra nikah hanya `belum_menikah`; `sudah_menikah` / cerai → dewasa (usia 21–59); lansia 60+.
