# QA — Konfigurasi Dokumen

Date: 2026-08-27  
Project: sijama

## Checklist

1. Master Lookup → Tambah: tipe manual `konfig_dokumen`, nama `Cetakan X`, value `laporan_jamaah` (atau unik).
2. Aplikasi → Konfigurasi Dokumen → pilih cetakan → ubah header/footer + centang media → Simpan.
3. Laporan Jamaah → Ekspor/Cetak memakai brand sesuai lookup value `laporan_jamaah`.
4. Uncheck PDF → cetak tanpa header/footer; Excel tetap (jika dicentang).
5. Tipe lookup di form Master Lookup adalah input teks (bukan dropdown tipe baku saja).
