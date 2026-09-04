# Demo account lock — 2026-09-04

## Policy

Akun `is_demo` / username reserved (`DemoUserGuard::DEMO_USERNAMES`) **tidak dapat**:

- diedit (data master pengguna)
- dinonaktifkan (termasuk Super Admin)
- diganti password (master, profil, reset forgot-password)
- dihapus

Dapukan sistem (`is_system` / slug peran demo) **tidak dapat** diubah, dinonaktifkan, atau dihapus dari Master Dapukan.

Seeder `DemoUsersSeeder` tetap boleh menyinkron ulang akun demo di luar API aplikasi.

## Surfaces

| Layer | Guard |
|-------|--------|
| API users update/deactivate | `MasterUserService` + `DemoUserGuard` |
| API dapukan update/delete | `DapukanService` + `DemoUserGuard::assertCanMutateDapukan` |
| Profil ganti password | `ProfileService::updatePassword` — demo + Super Admin ditolak |
| Forgot password | `PasswordResetService` (request diam; reset ditolak untuk demo) |
| UI profil | Tab Keamanan menyembunyikan form ubah password untuk demo & Super Admin |
| UI master | list/form pengguna & dapukan menyembunyikan aksi edit/nonaktif |

## Tests

`tests/Feature/DemoUserGuardTest.php`
