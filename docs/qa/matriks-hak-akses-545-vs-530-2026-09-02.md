# QA — Jumlah matriks hak akses (545 vs 530)

Tanggal: 2026-09-02  
Project: sijama

## Temuan

Setelah `migrate:fresh --seed`, matriks Super Admin berisi **520** baris, bukan **545**.

Angka **545** adalah jumlah katalog pada commit `6520971` (docs Render). Katalog itu masih memuat chrome CRUD **pengajian** dan **laporan_pengajian**.

Pengajian sudah digabung ke kegiatan (`docs/architecture/merge-pengajian-kegiatan-v1.0.0.md`). Menu `pengajian` / `laporan-pengajian` dinonaktifkan dan hak `pengajian.*` / `laporan_pengajian.*` tidak lagi di-seed.

Perkiraan selisih:

| Perubahan | Dampak |
|-----------|--------|
| Hapus chrome pengajian (~18) + laporan pengajian (~12) | −30 |
| Kolom extra kegiatan / laporan kegiatan vs katalog 545 | +5 |
| **Net** | **−25 → 520** |

Fresh seed tidak “kehilangan grant Super Admin”: pivot = `hak_akses_m` (520/520, lalu 530/530). Yang hilang adalah baris katalog usang, bukan grant.

## Perbaikan 2026-09-02

Katalog UI diselaraskan ke halaman list yang aktif:

- Prefix `kategori_kegiatan_m.*` → `kategori_kegiatan.*` (tombol Tambah/Ubah/Hapus di master kategori)
- Kolom `kelompok` (bukan `wilayah_fung_kelompok`) sesuai `listColumnPerm` di frontend
- Kolom yang ada di UI tapi belum di matriks: singkatan kelompok/provinsi/kabupaten, kawasan metro, wilayah/negara kode pos, kolom jadwal rutin

Hasil seed: **530 / 530** Super Admin.

Tidak mengembalikan hak pengajian — modul itu sudah digabung ke kegiatan.

## Cek

1. Login `admin` / `password`
2. Master → Matriks Akses: jumlah hak = 530, Super Admin tercentang semua
3. Master Kategori Kegiatan: tombol Tambah terlihat
4. Master Kelompok: kolom Singkatan bisa di-gate
5. Logout/login setelah reseed RBAC
