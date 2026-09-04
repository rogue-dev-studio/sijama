# QA — Field form di matriks akses

| Field | Value |
|-------|--------|
| Date | 2026-09-02 |
| Related | `listUiChromeCatalog`, `formFieldAccess` |

## Kenapa sebelumnya belum?

Matriks sengaja hanya chrome **list**: tombol (LIHAT vs aksi) + `{prefix}.col.{key}.view` untuk **tabel**. Form dikunci di kode (contoh: Kode disabled saat edit) supaya identifier tidak diubah sembarangan. Efek samping: Super Admin tidak bisa mengatur itu dari matriks.

## Sekarang

Setiap baris **Kolom …** punya dua centang, sama seperti tombol:

| Matriks | Izin | List | Form |
|---------|------|------|------|
| LIHAT | `{prefix}.col.{key}.view` | Kolom tampil | Field tampil |
| UBAH | `{prefix}.col.{key}.update` | — | Field bisa diedit (mode edit) |

- Tambah data: field yang tampil tetap bisa diisi (izin `create`).
- Default paket: `col.update` mengikuti `{prefix}.update`, **kecuali `kode`** (hanya Super Admin / centang UBAH Kolom Kode).
- Super Admin: `can()` selalu true (tidak bergantung pada array izin sesi). Matriks Super Admin 701/701 tidak boleh membuat field form terkunci.
- Default paket: `col.update` mengikuti `{prefix}.update`, **kecuali `kode`** (hanya Super Admin / centang UBAH Kolom Kode pada dapukan biasa).

Form yang sudah memakai helper: master wilayah adm/fung (termasuk parent: negara/provinsi/pusat/desa, …), materi, kategori kegiatan.

Form kustom (jamaah, keluarga, lokasi, kode pos, users, pemateri, lookup, menu, …) masih menyusul pola yang sama.

## Cek

1. `php artisan db:seed --class=RbacSeeder --force` (DB lokal, bukan production tanpa izin)
2. Matriks → Master Negara → Kolom Kode = LIHAT + UBAH
3. Super Admin edit kelompok → Kode, Desa, Deskripsi tampil dan bisa diubah (tanpa logout).
4. Dapukan biasa: uncheck UBAH Kolom Kode → simpan → login ulang → Kode disabled
5. `php artisan test --filter="RbacMatriksCatalogTest|WilayahKodeEditTest"`
