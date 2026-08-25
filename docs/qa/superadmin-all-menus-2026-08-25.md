# Super Admin — semua menu

Tanggal: 2026-08-25

## Masalah

Akun `admin` (dapukan `superadmin`) bisa kehilangan akses penuh jika tertaut jamaah yang hanya punya dapukan lain (`jamaah_kelompok`, dll.), karena `effectiveDapukan()` sebelumnya **mengganti** dapukan akun dengan dapukan jamaah.

## Perbaikan

1. `User::effectiveDapukan()` menggabungkan `users.dapukan_id` + dapukan jamaah (union unik).
2. `isSuperAdmin()` juga cek langsung `users.dapukan`.
3. `RbacMenuService`: Super Admin melihat **semua** menu aktif, termasuk section kosong (Laporan, Aplikasi).

Relogin sebagai `admin` setelah deploy.
