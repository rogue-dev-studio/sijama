# Backup & Restore — Aiven PostgreSQL (GL-5)

Date: 2026-09-02  
Project: sijama

## Scope

Database production SIJAMA di **Aiven PostgreSQL**. Aplikasi API di Render; upload file di R2 (GL-8).

## RPO / RTO (target)

| Metric | Target | Catatan |
|--------|--------|---------|
| RPO | ≤ 24 jam | Sesuai jendela backup harian Aiven |
| RTO | ≤ 4 jam | Restore ke service baru + update `DB_*` di Render |

Sesuaikan angka dengan tier/plan Aiven aktif.

## Backup policy (Aiven Console)

1. Buka project Aiven → service PostgreSQL `sijama`
2. **Backups** → aktifkan automated backup (daily minimum)
3. Catat retention (hari) dan region backup
4. Simpan snapshot manual sebelum migrasi besar / release major

## Restore drill (quarterly)

| Step | Action |
|------|--------|
| 1 | Buat service PostgreSQL **staging** di Aiven (atau fork dari backup) |
| 2 | Restore backup terbaru ke service staging |
| 3 | Update env staging Render (`DB_HOST`, `DB_PASSWORD`, dll.) |
| 4 | `php artisan migrate --force` (jika schema staging behind) |
| 5 | Smoke: login admin, list jamaah, dashboard |
| 6 | Dokumentasikan durasi restore + blocker |

## Env vars setelah restore

```env
DB_CONNECTION=pgsql
DB_HOST=<aiven-host>
DB_PORT=<port>
DB_DATABASE=sijama
DB_USERNAME=<user>
DB_PASSWORD=<secret>
DB_SSLMODE=require
```

Redeploy `sijama-api` setelah ganti credential.

## Yang tidak di-backup Aiven

| Asset | Backup |
|-------|--------|
| Upload R2 | Lifecycle/versioning bucket Cloudflare |
| Redis/cache | Ephemeral — tidak perlu restore |
| Laravel `storage/logs` | Render logs — arsip manual bila perlu |

## Kontak / eskalasi

- Owner infra: tim DevOps project
- Issue GitLab: [#5 — Aiven backup](https://gitlab.com/rogue-dev-studio/sijama/-/issues/5)

**Status GL-5:** runbook siap — eksekusi policy di Aiven Console membutuhkan akses ops.
