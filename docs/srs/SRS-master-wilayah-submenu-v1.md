# Master Wilayah — submenu

## Ringkasan

Di menu **Master**, wilayah dipecah menjadi dua submenu:

1. **Wilayah Fungsional** — Pusat → Daerah → Desa → Kelompok → Sub Kelompok  
2. **Wilayah Administrasi** — Negara → Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan → Kode Pos  

Sidebar merender hierarki menu secara nested (bukan flat).

## Sub Kelompok (baru)

- Tabel `sub_kelompok` (FK `kelompok_id`)
- API `/master/sub-kelompok`
- Permission `sub_kelompok.*`
- Halaman `/master/sub-kelompok`
