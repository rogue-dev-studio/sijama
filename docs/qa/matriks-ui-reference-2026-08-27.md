# QA — Matriks Hak Akses UI (referensi toggle + matriks aksi)

Tanggal: 2026-08-27  
Project: sijama

## Perubahan

- Halaman `MasterMatriksPage` mengikuti pola referensi:
  - Header modul + toggle **Dizinkan / Ditolak**
  - **Daftar Fitur** dengan toggle per fitur + tautan **Detail Fitur**
  - Tabel aksi: SUB-FITUR | LIHAT | BUAT | UBAH | HAPUS | EKSEKUSI
  - Checkbox hijau jika aksi ada; `—` jika tidak ada
- API matriks memuat `fitur.menu` untuk pengelompokan modul
- CSS switch + checkbox matriks (hijau aktif)

## Cek manual

1. Buka Master → Matriks Hak Akses
2. Pilih dapukan → modul tampil dengan toggle
3. Matikan modul → daftar fitur hilang; nyalakan lagi → muncul
4. Buka Detail Fitur → centang LIHAT / aksi lain → dirty → Simpan
5. Batalkan mengembalikan ke baseline
6. Export/cetak masih jalan

## Hasil

- [x] Implementasi UI sesuai referensi (hierarki modul → fitur → matriks aksi)
- [ ] Verifikasi browser lokal (Vite / docker) oleh user
