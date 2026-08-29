# QA — Matriks dashboard widget respects permissions

Tanggal: 2026-08-27  
Project: sijama

## Root cause

`User::hasPermission` / frontend `can()` selalu `true` untuk **superadmin**, sehingga uncentang matriks tidak memengaruhi Dashboard.

## Fix

- Izin mengikuti pivot dapukan (tanpa bypass superadmin)
- Superadmin tetap punya semua izin via `RbacSeeder` sync
- Simpan matriks untuk dapukan user login → `auth.refresh()`
- API dashboard: chart tanpa izin → `null` (bukan `[]`)

## Cek

1. Login sebagai dapukan yang diedit (atau edit dapukan login sendiri)
2. Matriks → uncentang Jamaah per Kelompok → Simpan
3. Dashboard: chart Jamaah per kelompok hilang
4. Centang lagi → Simpan → chart muncul
