# QA — Matriks UI granular (semua list)

Tanggal: 2026-08-27  
Project: `sijama`

## Cakupan

Semua halaman list/tabel digate lewat matriks:

| Area | Kontrol |
|------|---------|
| Tombol Tambah / Edit / Hapus | `{prefix}.create/update/delete` (sudah ada; label matriks: Tombol …) |
| Cetak / CSV / Excel | `{prefix}.print` / `.export_csv` / `.export_excel` |
| Kolom tabel | `{prefix}.col.{key}.view` |

Modul: Jamaah, Pengajian, Kegiatan, Users, Kehadiran, Kategori Umur, semua Laporan, Konfig Dokumen, Matriks (export saja), dan seluruh SimpleMaster (Lokasi, Pemateri, Materi, Lookup, wilayah, ADM, Dapukan, Menu, Fitur, Hak Akses, dll.).

## Cara uji singkat

1. `php artisan db:seed --class=RbacSeeder`
2. Login → Matriks → expand fitur (mis. Lokasi / Pengajian) → pastikan baris Tombol Cetak + Kolom …
3. Uncheck satu kolom + satu export → simpan → refresh halaman terkait → elemen hilang
4. Superadmin / admin paket default tetap melihat penuh setelah re-seed

## Catatan

- Uncheck = **sembunyikan** (bukan disable).
- Re-seed menyinkronkan paket izin default dapukan.
- Helper FE: `listUiAccess.ts` + prop `columns` di `SimpleMasterListPage`.
