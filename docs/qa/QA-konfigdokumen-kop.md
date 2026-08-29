# QA — Konfig Dokumen Kop Surat

Date: 2026-08-27  
SRS: `docs/srs/SRS-konfigdokumen-kop-v1.0.0.md`

## Checklist

1. [ ] Migrasi `add_logo_and_style_to_konfigdokumen_k` sukses
2. [ ] Form edit: upload logo kiri & kanan, hapus, simpan
3. [ ] Form: ubah layout kop ↔ sederhana; ubah ukuran font header/detail; pratinjau berubah
4. [ ] Cetak laporan (mis. Jamaah): kop menampilkan logo + style
5. [ ] Mode sederhana: teks saja tanpa kolom logo
6. [ ] Public `/api/public/konfig` memuat `path_logo_*`, `layout_mode`, `header_style`
7. [ ] Excel/CSV tetap teks brand (tanpa gambar) bila apply_* aktif

## Smoke notes

Jalankan setelah `php artisan migrate` pada environment yang dipakai.
