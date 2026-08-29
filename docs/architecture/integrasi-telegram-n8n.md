# Integrasi Telegram & n8n

## Purpose

Simpan kredensial dan flag aktivasi bot Telegram serta n8n di `konfigsystem_k`, sinkron ke runtime via `config/integrations.php` + `SystemKonfig::applyRuntimeConfig()`.

## Fields

| Integrasi | Field | Catatan |
|-----------|-------|---------|
| Telegram | `telegram_enabled` | On/off |
| | `telegram_bot_token` | Encrypted; dari @BotFather |
| | `telegram_bot_username` | Opsional, display |
| | `telegram_default_chat_id` | Target notifikasi default |
| n8n | `n8n_enabled` | On/off |
| | `n8n_base_url` | URL instance |
| | `n8n_webhook_url` | Webhook workflow utama |
| | `n8n_api_key` | Encrypted; opsional |

## Env fallback

`.env`: `TELEGRAM_*`, `N8N_*`. DB meng-override saat terisi.

## UI

Tab **Aplikasi → Konfig → Integrasi** (`konfig.integrasi.view`).

## Catatan

Ini **penyimpanan konfig saja**. Pengiriman pesan Telegram / pemanggilan webhook n8n diimplementasikan terpisah saat fitur otomasi dibutuhkan.
