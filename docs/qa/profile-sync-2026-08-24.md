# Sinkron profil jamaah

Tanggal: 2026-08-24

## Perubahan

- Profil menampilkan **dapukan efektif** (multi dari jamaah) + **cakupan wilayah** (pindahan dari user-menu).
- Edit profil mendukung **rantai wilayah administratif** (negara → … → desa/kelurahan) + kode pos, selaras form jamaah.
- Lookup wilayah lewat `GET /api/profile/wilayah-options` (auth saja) agar akun tanpa permission master tetap bisa mengisi alamat.
- Field terkunci tetap: NIK, kelompok, dapukan, status — ditampilkan read-only di form edit.
- User menu: **Ubah profil jamaah** hanya jika `jamaah_id` terisi; `/profil?edit=1` tanpa jamaah di-redirect ke lihat profil.
