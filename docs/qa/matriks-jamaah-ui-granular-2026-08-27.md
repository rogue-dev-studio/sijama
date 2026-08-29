# QA — Matriks kontrol UI Master Jamaah (granular)

Tanggal: 2026-08-27  
Project: `sijama`

## Tujuan

Matriks Hak Akses mengontrol elemen UI Master Jamaah secara dinamis: tombol dan kolom tabel (tampil / sembunyi berdasarkan izin).

## Izin baru / diperjelas

| Slug | UI |
|------|-----|
| `jamaah.create` | Tombol Tambah |
| `jamaah.update` | Tombol Edit |
| `jamaah.delete` | Tombol Hapus |
| `jamaah.enroll_face` | Tombol Wajah |
| `jamaah.print` | Menu Cetak / PDF |
| `jamaah.export_csv` | Menu Unduh CSV |
| `jamaah.export_excel` | Menu Unduh Excel |
| `jamaah.col.nama.view` | Kolom Nama |
| `jamaah.col.kelompok.view` | Kolom Kelompok |
| `jamaah.col.kategori.view` | Kolom Kategori |
| `jamaah.col.nik.view` | Kolom NIK |
| `jamaah.col.kontak.view` | Kolom Kontak |
| `jamaah.col.status.view` | Kolom Status |
| `jamaah.col.wajah.view` | Kolom Wajah |

`jamaah.view` tetap untuk akses halaman / API list.

## Cara uji

1. Re-seed RBAC: `php artisan db:seed --class=RbacSeeder`
2. Login superadmin → Matriks → tab Master → expand Jamaah → pastikan baris Tombol + Kolom muncul
3. Uncheck `jamaah.col.nik.view` + simpan → refresh → kolom NIK hilang di `/jamaah`
4. Uncheck `jamaah.print` → menu Cetak/PDF hilang; CSV/Excel tetap jika diizinkan
5. Uncheck semua export → tombol Ekspor/Cetak hilang
6. Uncheck `jamaah.create` → tombol Tambah hilang
7. Uncheck edit/hapus/wajah → tombol aksi terkait hilang; kolom Aksi hilang jika ketiganya off

## Catatan

- Pola ini (sub-fitur tombol + kolom) bisa ditiru ke master list lain.
- `ExportPrintActions` menerima `canPrint` / `canCsv` / `canExcel` (default `true` untuk halaman yang belum digate).
- Re-seed menyinkronkan paket izin default dapukan (bukan hanya menambah).
