# Integration logs & database config

Version: 1.1.0  
Date: 2026-09-04

## Scope

1. **Tab Database** di Konfigurasi Sistem — metadata generik (driver PostgreSQL/MySQL/dll., host, plan, masa berlaku). Kredensial tetap di env.
2. **Log integrasi** per provider sebagai sub-menu di **Aplikasi → Log** (bukan panel di tab Integrasi).

## Menus

| Menu | Path | Permission |
|------|------|------------|
| Log Database | `/aplikasi/log/database` | `integration_log_database.view` |
| Log Telegram | `/aplikasi/log/telegram` | `integration_log_telegram.view` |
| Log SMTP | `/aplikasi/log/smtp` | `integration_log_smtp.view` |
| Log Fonnte | `/aplikasi/log/fonnte` | `integration_log_fonnte.view` |
| Log n8n | `/aplikasi/log/n8n` | `integration_log_n8n.view` |
| Log api.co.id | `/aplikasi/log/api-co-id` | `integration_log_api_co_id.view` |

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/aplikasi/konfig/integration-logs?provider=` | log view / konfig.view |
| GET | `/aplikasi/konfig/integration-logs/{id}` | same |
| POST | `/aplikasi/konfig/integration-logs` | `konfig.update` |
| POST | `/aplikasi/konfig/integrations/{provider}/check` | `konfig.update` |
| POST | `/aplikasi/konfig/integrations/expiry-sweep` | `konfig.update` |

Providers: `database`, `smtp`, `fonnte`, `telegram`, `n8n`, `api_co_id`.

## Columns (`konfigsystem_k`)

`db_enabled`, `db_driver`, `db_project`, `db_service_name`, `db_plan`, `db_region`, `db_host`, `db_port`, `db_database`, `db_valid_until`, `db_notes`, `db_last_check_*` + `*_valid_until` untuk SMTP/Fonnte/Telegram/n8n/api.co.id.

## Migrations

- `2026_09_04_000058_alter_konfigsystem_k_add_integration_meta.php` (definisi `db_*`)
- `2026_09_04_000059_create_integration_log_t_table.php`
- `2026_09_04_000060_rename_aiven_to_db_konfig.php` (rename legacy `aiven_*` → `db_*`, provider `aiven` → `database`)

## Ops

```bash
php artisan integrations:health-check
php artisan integrations:health-check --expiry-only
```

Schedule: daily di `bootstrap/app.php`.
