# SRS — Konfig Dokumen Kop Surat Dinamis

Version: 1.0.0  
Project: sijama  
Date: 2026-08-27

## Goal

Setiap cetakan (`lookup_value` tipe `konfig_dokumen`) dapat dikonfigurasi seperti **kop surat** (logo kiri/kanan + teks) atau **sederhana** (teks saja), dengan gaya tipografi header/detail yang dapat diubah dari form Konfig Dokumen.

## Scope

- Upload gambar logo kiri & logo kanan per cetakan
- Mode layout: `kop` | `sederhana`
- Style header/detail: ukuran font, berat, alignment, warna detail, tinggi logo, ukuran font footer
- Penerapan pada Cetak/PDF (prioritas); Excel/CSV tetap teks brand tanpa gambar

## Out of scope

- Editor WYSIWYG penuh
- Logo global system menggantikan logo per dokumen (tetap terpisah)

## Acceptance criteria

1. Admin dapat mengunggah/menghapus logo kiri dan kanan dari form edit konfig dokumen.
2. Admin dapat memilih layout `kop` atau `sederhana` dan menyimpan ukuran font header & detail header.
3. Cetak menampilkan logo + style sesuai konfigurasi; No/Aksi tabel tidak relevan.
4. Public `GET /api/public/konfig` → `dokumen.items[*]` memuat path logo, `layout_mode`, dan `header_style`.
5. Tanpa logo / style: fallback seperti sebelumnya (teks + CSS default).

## Assumptions

- Logo disimpan di disk `public` path `/storage/konfig/dokumen/...`
- Style disimpan JSON di kolom `header_style`
