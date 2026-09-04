# Audit Aktivitas (Akses / Konfig / Jamaah)

Tanggal: 2026-09-04

## Ringkasan

Tiga submenu di **Aplikasi → Audit** memakai tabel generik `audit_activity_t`:

| Menu | Module | Mencatat |
|------|--------|----------|
| Audit Akses | `access` | Matriks, create/update/deactivate user, ganti password |
| Audit Konfigurasi | `konfig` | Konfig sistem/dokumen, aset, sync hari libur |
| Audit Jamaah | `jamaah` | Create/update/delete jamaah, enroll/reset wajah |

Secret (password, token, face descriptor, API key) di-mask / tidak disimpan.

## RBAC

- `audit_access.view`, `audit_konfig.view`, `audit_jamaah.view`
- Gate Super Admin + permission (pola sama Konfig)

## API

- `GET /api/aplikasi/audit/akses` (+ `/{id}`)
- `GET /api/aplikasi/audit/konfig` (+ `/{id}`)
- `GET /api/aplikasi/audit/jamaah` (+ `/{id}`)
