# SRS — Konfigurasi Dokumen (konfigdokumen_k)

Version: 1.1.0  
Date: 2026-08-27  
Project: sijama

## Tujuan

Mengatur header/footer dokumen ekspor/cetak **per jenis cetakan**, dengan sumber jenis cetakan dari Master Lookup tipe `konfig_dokumen`.

## Requirement

1. Master Lookup: field **tipe diisi manual** (bukan dropdown dari tipe lookup baku).
2. Baris lookup `lookup_type = konfig_dokumen`:
   - `lookup_name` = nama cetakan (mis. Cetakan Laporan Jamaah)
   - `lookup_value` = kunci cetakan (mis. `laporan_jamaah`)
3. `konfigdokumen_k` punya `lookup_id` (1 config per lookup aktif).
4. Halaman Konfigurasi Dokumen: pilih cetakan dari lookup, lalu atur header/footer + centang PDF/Excel/CSV.
5. `ExportPrintActions` memakai `dokumenKey` = `lookup_value`.

## Acceptance Criteria

- [ ] Tambah lookup tipe manual `konfig_dokumen` + value baru → muncul di dropdown Konfigurasi Dokumen.
- [ ] Simpan header/footer per lookup; cetakan halaman terkait memakai brand itu.
- [ ] Media tidak dicentang → brand tidak tampil di media tersebut.
