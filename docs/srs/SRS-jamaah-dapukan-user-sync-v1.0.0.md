# SRS — Jamaah dapukan & pengguna otomatis

Version: 1.0.0  
Date: 2026-08-03

## Keputusan

1. Master **jamaah** punya banyak **dapukan** (`jamaah_dapukan`).
2. Master **pengguna** wajib taut ke jamaah (kecuali akun sistem lama tanpa jamaah).
3. Nama, email, **dapukan**, dan **cakupan wilayah** pengguna diisi otomatis dari jamaah:
   - Hak akses = gabungan semua dapukan jamaah
   - Tingkat cakupan = dapukan paling luas (global → pusat → daerah → desa → kelompok)
   - Wilayah diisi dari rantai kelompok jamaah sesuai tingkat itu
4. Form pengguna hanya: jamaah, username, password, status.

## Asumsi

- Akun demo `admin` / `admin.*` tetap boleh tanpa jamaah (legacy).
- Superadmin tidak dipilih di form jamaah.
