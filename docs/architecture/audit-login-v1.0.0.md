# Audit Login (Aplikasi → Audit)

Tanggal: 2026-09-04

## Ringkasan

Menu **Aplikasi → Audit → Audit Login** menampilkan jejak autentikasi (login berhasil/gagal, logout).

## RBAC

| Item | Nilai |
|------|--------|
| Menu grup | `aplikasi-audit` (path null) |
| Menu leaf | `aplikasi-audit-login` → `/aplikasi/audit/login` |
| Hak akses | `audit_login.view` (+ chrome kolom/export via matriks) |
| Gate route | Super Admin + permission (sama pola Konfig) |

Super Admin mendapat akses otomatis via `SuperAdminAccess::grantAll()`. Dapukan lain bisa diberi lewat Matriks; API aplikasi tetap di middleware `superadmin`.

## Backend

- Tabel `audit_login_t`
- API `GET /api/aplikasi/audit/login`
- Pencatatan di `AuthService` (login sukses/gagal + logout)

## Frontend

- Halaman list filterable: tanggal, event, hasil
- Route `aplikasi/audit/login`, permission `audit_login.view`
