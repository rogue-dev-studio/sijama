# Architecture — Master Lokasi Google Maps share

Date: 2026-08-25
Project: sijama

## Keputusan

- Simpan koordinat di kolom `lokasi.lat` / `lokasi.lng` (sudah ada).
- **Pemilih titik:** Leaflet + OpenStreetMap (klik / geser penanda) — tanpa Google Maps JavaScript API key.
- **Share:** URL publik `https://www.google.com/maps?q={lat},{lng}`.
- Parse tautan di FE (`lib/googleMaps.ts`); backend hanya menerima numeric lat/lng.

## Alasan

Pilih titik manual di peta wajib untuk UX; Google Maps JS API membutuhkan billing/key. OSM + Leaflet memenuhi klik-titik; share tetap ke Google Maps.
