# SRS — Kategori Umur (Informasi)

Version: 1.5.0
Status: Approved
Author: business-analyst, system-analyst
Last Updated: 2026-08-27
Project: sijama

---

## 1. Tujuan

Menu **Informasi → Kategori Umur** menampilkan **master klasifikasi umur** (bukan daftar jamaah), dengan jumlah jamaah aktif per kategori.

## 2. Tampilan

- Tabel: Grup | Kategori | Rentang | Jumlah
- **Semua kategori selalu tampil**; jumlah **0** jika belum ada jamaah
- Pagination berlaku pada **baris kategori** (sama pola master), bukan daftar anggota jamaah
- Filter: cari nama/grup + filter grup

## 3. Klasifikasi

Bayi … Lansia + Belum diklasifikasi — lihat `JamaahKategoriUmur` / `KATEGORI_UMUR_OPTIONS`.

## 4. API

`GET /api/kategori-umur` → `{ items, meta, ringkasan }`  
UI memakai `ringkasan` (semua kode + jumlah termasuk 0) sebagai sumber tabel + pagination.
