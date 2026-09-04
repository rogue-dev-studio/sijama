# Log Error Aplikasi (Aplikasi → Log)

Tanggal: 2026-09-04

## Ringkasan

Menu **Aplikasi → Log → Error Aplikasi** menampilkan exception runtime untuk tracing bug.

Tidak dicatat (bukan error aplikasi):

- validasi input (`ValidationException`)
- 401 / 403 / 404 / maintenance 503 yang diharapkan

## RBAC

| Item | Nilai |
|------|--------|
| Menu grup | `aplikasi-log` |
| Menu leaf | `aplikasi-log-error` → `/aplikasi/log/error` |
| Hak akses | `app_error_log.view` (+ chrome kolom/export) |
| Gate | Super Admin + permission |

## Backend

- Tabel `app_error_log_t`
- API `GET /api/aplikasi/log/error`, `GET /api/aplikasi/log/error/{id}`
- Pencatatan via `bootstrap/app.php` → `AppErrorLogService::recordFromException`
