# SRS — Relasi Master Jamaah / Wilayah / Pekerjaan

Version: 1.0.0  
Project: sijama  
Date: 2026-08-03

## Ringkasan

Menyelaraskan master data agar saling terhubung:

1. **Lokasi** → `adm_desa_kelurahan_id` (rantai kab/kota → kecamatan → kelurahan)
2. **Pemateri** → `jamaah_id` (nama & kontak dari jamaah)
3. **Pekerjaan** → master `pekerjaan` + `jamaah.pekerjaan_id`
4. **Pengguna** → `users.jamaah_id` (nama/email dapat diisi dari jamaah)
5. **Kategori umur** → menambah **Bayi (0–1)** dan **Balita (2–4)**; PAUD = usia 5

## Asumsi

- Seed lokasi LDII tetap boleh tanpa FK wilayah (nullable); form baru mengisi rantai administrasi.
- Satu jamaah maksimal satu pemateri dan satu user (unique FK).
- Snapshot `jamaah.pekerjaan` (teks) tetap diisi otomatis dari nama master untuk kompatibilitas tampilan lama.
