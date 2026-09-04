# Production Smoke Checklist (GL-1)

Date: 2026-09-02  
Project: sijama

Checklist setelah deploy Render + seed admin. Detail deploy: [render-deploy.md](../render-deploy.md).

## Pre-flight

- [ ] `APP_KEY`, `DB_*`, `FRONTEND_URL` ter-set di `sijama-api`
- [ ] `VITE_API_URL` ter-set di `sijama-web` build
- [ ] R2 env (`AWS_*`, `FILESYSTEM_DISK=s3`) bila upload production aktif

## Automated (CI / lokal)

```bash
docker compose exec -T backend php artisan test
cd frontend && npm run build
```

Target: **57** PHPUnit tests pass + build FE.

## Post-deploy API smoke

Ganti `<API>` dengan URL production (mis. `https://sijama-api.onrender.com`).

| # | Check | Command / expected |
|---|-------|-------------------|
| 1 | Health | `GET <API>/up` → 200 |
| 2 | Login admin | `POST <API>/api/login` → token |
| 3 | Me | `GET <API>/api/me` + Bearer → permissions |
| 4 | List jamaah | `GET <API>/api/jamaah` → items |
| 5 | Dashboard | `GET <API>/api/dashboard` → success |
| 6 | Logout | `POST <API>/api/logout` → token revoked |

## Post-deploy UI smoke

| # | Check | Expected |
|---|-------|----------|
| 1 | Buka frontend URL | Login page |
| 2 | Login admin | Dashboard |
| 3 | Navigasi jamaah / kegiatan | List load |
| 4 | Logout | Redirect login |

## Seed admin (first deploy)

Ikuti section **Setelah deploy** di `render-deploy.md` (`SEED_ON_DEPLOY` / `BOOTSTRAP_ADMIN_*`).

## Status GL-1

Runbook + checklist siap. Eksekusi di Render production membutuhkan akses dashboard ops.
