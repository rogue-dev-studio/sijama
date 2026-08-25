# Review — Master Lokasi Google Maps

Date: 2026-08-25
Reviewer: code-reviewer
Status: Pass (local)

## Ringkas

- Tidak menambah dependency Google Maps JS API.
- Memakai field `lat`/`lng` yang sudah ada di model/request/resource.
- UI form + list untuk set titik dan share tautan.

## Cek

- [x] Validasi koordinat di FE selaras rule BE (-90..90 / -180..180)
- [x] Tidak expose secret
- [x] State kosong/error geolocation ditangani
- [x] Layering: util murni di `lib/googleMaps.ts`, UI di komponen

## Risiko

- Parse URL Google Maps tidak mencakup semua format pendek — terdokumentasi di QA.
