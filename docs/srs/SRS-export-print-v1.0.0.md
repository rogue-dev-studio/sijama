# SRS — Ekspor / Cetak daftar

Version: 1.0.0  
Date: 2026-08-27  
Project: sijama

## Tujuan

Tombol **Ekspor / Cetak** pada halaman list/informasi yang menampilkan tabel, agar data bisa dicetak (PDF via dialog browser) atau diunduh (CSV / Excel).

## Media

| Aksi | Perilaku |
|------|----------|
| Cetak / PDF | Jendela cetak browser (bisa simpan sebagai PDF) |
| Unduh CSV | File `.csv` UTF-8 BOM |
| Unduh Excel | File `.xlsx` (OOXML) — kompatibel Excel, LibreOffice Calc, Google Sheets |

Header/footer dokumen mengikuti `konfigdokumen_k` (menu Aplikasi → Konfigurasi Dokumen): centang `apply_pdf` / `apply_excel` / `apply_csv` menentukan media mana yang menampilkan brand dokumen.

## Halaman

- Semua **SimpleMasterListPage** (master wilayah, lookup, lokasi, dll.) — default aktif
- Jamaah, Pengajian, Kegiatan, Kehadiran, Kategori umur, Master Pengguna

## Asumsi

- Ekspor memakai **baris yang sedang tampil** di tabel (halaman pagination aktif), kecuali Kategori umur yang mengekspor seluruh hasil filter ringkasan.
- Excel memakai generator `.xlsx` ringan di client (tanpa dependency npm tambahan).
- Tidak untuk form edit / absensi live.