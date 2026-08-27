# konfigsystem_k — System Configuration

## Purpose

Single-row (or few-row) system settings for mail/SMTP, UI branding, identity, locale, and maintenance. Soft-delete via `is_deleted`, not Laravel `SoftDeletes`.

## Columns

| Group | Columns |
|-------|---------|
| PK / audit | `konfigsystem_id`, `additional_data`, created/modified/deleted + `modified_count`, `is_active`, `is_deleted` |
| Mail | `mail_protocol`, `smtp_hostname`, `mail_parameter`, `smtp_username`, `smtp_password`, `smtp_port`, `smtp_timeout`, `smtp_encryption`, `mail_from_address`, `mail_from_name`, `mail_reply_to` |
| Identity | `app_nama`, `nama_instansi` — **tab browser**; `alamat`, `telepon`, `email_kontak` |
| Branding | `header`, `header_detail` — **sidebar/header aplikasi**; `footer`, `website`, `footer_link`, `footer_detail`, `footer_detail_link` — **footer developer**; `path_logoheader`, `path_favicon`, `path_logofooter` — **upload gambar** (`POST /api/aplikasi/konfig/assets/{logo-header|favicon|logo-footer|background}`) |
| Tema | `path_background` + `background_style` + `background_repeat_size` (tile saat repeat); palet + warna `color_*` |
| Locale | `timezone`, `locale` |
| Ops | `maintenance_mode`, `maintenance_message` |

Prefer one active row (`is_active=true`, `is_deleted=false`). Keep secrets out of logs; `smtp_password` hidden + encrypted cast.

## Menu & API

- Menu Aplikasi: slug `aplikasi-konfig`, path `/aplikasi/konfig`
- **Singleton:** hanya satu baris aktif; GET membuat default jika belum ada
- **Super Admin only:** middleware `superadmin` + permission `konfig.view` / `konfig.update`
- Tidak bisa di-assign lewat Matriks Akses ke dapukan lain
- API admin: `GET/PUT /api/aplikasi/konfig`
- API publik (branding/maintenance): `GET /api/public/konfig`
- Runtime: `SystemKonfig::applyRuntimeConfig()` mengisi `app.name`, timezone, locale, mail SMTP dari DB
- Frontend: tab browser ← `app_nama` + `nama_instansi`; sidebar/header/login ← `header` + `header_detail`; footer developer ← `footer` + `website`/`footer_link` + `footer_detail` + `footer_detail_link`

## Seeder

`KonfigSystemSeeder` — nilai default SIJAMA (`Asia/Jakarta`, mail dari `.env`; logo/favicon kosong sampai di-upload)

## Migrations

1. `2026_08_27_103600_create_konfigsystem_k_table.php`
2. `2026_08_27_103800_add_identity_ops_columns_to_konfigsystem_k_table.php`
