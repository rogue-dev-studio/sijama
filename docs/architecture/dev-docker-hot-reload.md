# Dev Docker — no rebuild for code edits

Date: 2026-08-08

## Rule of thumb

| Change | Action |
|--------|--------|
| FE/BE application source | None (bind-mount / Vite HMR) |
| Compose/` .env` environment | `docker compose … up -d` (recreate) |
| Dockerfile, lockfiles, OS packages | `docker compose … up -d --build` |

## Command

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

File: `docker-compose.dev.yml`
