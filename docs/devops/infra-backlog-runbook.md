# Infra Backlog — SIJAMA

Date: 2026-09-02 (closed — ops handoff)

Items GL-1, GL-5, GL-6 require external credentials and production/staging access. **Runbook siap**; eksekusi di dashboard ops.

---

## GL-1 — Render production smoke + seed admin

**Status:** `ops` — [production-smoke-checklist.md](production-smoke-checklist.md) · [render-deploy.md](../render-deploy.md)

| Step | Action |
|------|--------|
| 1 | Deploy `main` to Render via existing pipeline |
| 2 | Run `php artisan migrate --force` on production web service |
| 3 | Run seed via `SEED_ON_DEPLOY` / `BOOTSTRAP_ADMIN_*` (see render-deploy) |
| 4 | Smoke: checklist production-smoke-checklist.md |

**Local verified:** Docker stack `:8080` / `:5173` · demo `admin` / `password` · PHPUnit **57** tests

---

## GL-5 — Aiven backup policy + restore docs

**Status:** `ops` — [backup-restore.md](backup-restore.md)

| Step | Action |
|------|--------|
| 1 | Enable automated backup window in Aiven PostgreSQL service |
| 2 | Document RPO/RTO (template in backup-restore.md) |
| 3 | Quarterly restore drill to staging |

---

## GL-6 — Render custom domain + HTTPS

**Status:** `ops`

| Step | Action |
|------|--------|
| 1 | Render Dashboard → service → Custom Domains → add domain |
| 2 | DNS: CNAME ke Render target |
| 3 | Enable managed TLS (automatic after DNS propagate) |
| 4 | Update `APP_URL`, `FRONTEND_URL`, Sanctum stateful domains, `VITE_API_URL` rebuild |
| 5 | Update `render.yaml` rewrite destinations if API custom domain |

---

## GL-8 — Object storage (S3/R2)

**Status:** `done` (code)

**Prereq production cutover:** bucket + IAM keys in env (`AWS_*` or R2 equivalent). Set `FILESYSTEM_UPLOAD_DISK=s3`.

**Implemented:**

1. `config/filesystems.php` → `upload_disk` + `App\Support\UploadStorage`
2. Artisan: `php artisan storage:migrate-uploads` (`--dry-run`, `--delete-source`, `--source=public`, `--target=s3`)
3. Tests: `MigrateUploadsCommandTest`
4. Docs: [render-deploy.md](../render-deploy.md) section R2

**Ops cutover:**

```bash
php artisan storage:migrate-uploads --dry-run
php artisan storage:migrate-uploads
# optional after verify:
php artisan storage:migrate-uploads --delete-source
```

---

## GL-2 / GL-3 — Browser smoke (camera)

**Status:** `done` (API) · browser optional

API: `JamaahFaceEnrollTest`, `AttendanceFlowTest` (face check-in). Manual UX: `docs/qa/smoke-mvp.md` optional section.
