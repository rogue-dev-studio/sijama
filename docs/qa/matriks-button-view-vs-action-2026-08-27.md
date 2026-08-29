# QA — Tombol matriks: Lihat vs Aksi

Tanggal: 2026-08-27  
Project: `sijama`

## Model

Setiap tombol (Tambah / Edit / Hapus / Wajah / Cetak / CSV / Excel) punya **dua centang** di matriks (satu baris SUB-FITUR):

| Kolom matriks | Izin | Efek di aplikasi |
|---------------|------|------------------|
| LIHAT | `{prefix}.btn.{key}.view` | Tombol **tampil** |
| BUAT / UBAH / HAPUS / EKSEKUSI | `{prefix}.create` / `.update` / `.delete` / `.print` / dll. | Tombol **aktif** (bisa dipakai) |

## Cascade di UI Matriks

- Centang **aksi** → otomatis centang **LIHAT**
- Centang **LIHAT** saja → aksi **tidak** ikut tercentang
- Uncheck **LIHAT** → semua aksi di baris yang sama ikut unchecked

## Perilaku aplikasi

- LIHAT saja → tombol terlihat tapi **disabled**
- LIHAT + aksi → tombol aktif
- Tanpa LIHAT (dan tanpa aksi) → tombol disembunyikan

## Uji

1. Re-seed: `php artisan db:seed --class=RbacSeeder`
2. Matriks → Master → Jamaah → expand → baris **Tombol Hapus** punya centang LIHAT + HAPUS
3. Centang hanya LIHAT Hapus → simpan → `/jamaah` tombol Hapus tampil disabled
4. Centang HAPUS → LIHAT ikut → tombol Hapus aktif
5. Ulangi untuk Cetak / Edit / Tambah
