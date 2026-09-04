# Backlog — SIJAMA (shift index)

Index kanonik untuk **continuous dev shift** auto-pick. Detail milestone v0.3: [backlog-v0.3.md](../planning/backlog-v0.3.md).

Tracking utama: **GitLab Issues** · milestone [v0.3.0](https://gitlab.com/rogue-dev-studio/sijama/-/milestones/1).

**Closure note (2026-09-02):** Semua deliverable kode/docs/test selesai. Tiga item infra (**GL-1, GL-5, GL-6**) menunggu eksekusi ops (Render/Aiven/DNS) — runbook siap.

---

## Pick table (shift)

| ID | Title | Type | Priority | Status | Effort | Source | Agent |
|----|-------|------|----------|--------|--------|--------|-------|
| GL-1 | Render production: smoke test + seed admin | infra | high | **ops** | M | [#1](https://gitlab.com/rogue-dev-studio/sijama/-/issues/1) | DevOps |
| GL-2 | Smoke QA: face enroll di browser | qa | high | **done** | S | [#2](https://gitlab.com/rogue-dev-studio/sijama/-/issues/2) | QA → FE |
| GL-3 | Smoke QA: absensi kamera / face recognition | qa | high | **done** | S | [#3](https://gitlab.com/rogue-dev-studio/sijama/-/issues/3) | QA → BE/FE |
| GL-4 | Smoke QA: create jamaah end-to-end | qa | critical | **done** | M | [#4](https://gitlab.com/rogue-dev-studio/sijama/-/issues/4) | QA |
| GL-5 | Aiven: backup policy + dokumentasi restore | infra | medium | **ops** | M | [#5](https://gitlab.com/rogue-dev-studio/sijama/-/issues/5) | DevOps |
| GL-6 | Render: custom domain + HTTPS | infra | medium | **ops** | M | [#6](https://gitlab.com/rogue-dev-studio/sijama/-/issues/6) | DevOps |
| GL-7 | Scheduler: update status kegiatan (cron) | infra | high | **done** | M | [#7](https://gitlab.com/rogue-dev-studio/sijama/-/issues/7) | Backend |
| GL-8 | Migrasi upload ke object storage (S3/R2) | feature | medium | **done** | L | [#8](https://gitlab.com/rogue-dev-studio/sijama/-/issues/8) | Backend |

**Status values:** `ready` · `in_progress` · `blocked` · `done` · `ops` (runbook siap, eksekusi butuh akses dashboard)

**Shift pick order:** critical/high QA smoke (GL-4, GL-2, GL-3) → infra high (GL-1, GL-7) → sisanya by priority.

### GL deliverables (repo)

| ID | Artifact |
|----|----------|
| GL-1 | [production-smoke-checklist.md](../devops/production-smoke-checklist.md), [render-deploy.md](../render-deploy.md) |
| GL-2 | `JamaahFaceEnrollTest`, smoke TC-05 |
| GL-3 | `AttendanceFlowTest` (manual + face check-in), smoke TC-08–10 API |
| GL-5 | [backup-restore.md](../devops/backup-restore.md) |
| GL-6 | Custom domain steps di [render-deploy.md](../render-deploy.md) + runbook |
| GL-8 | `storage:migrate-uploads`, `MigrateUploadsCommandTest`, `UploadStorage` |

---

## Local tasks

| ID | Title | Type | Priority | Status | Path |
|----|-------|------|----------|--------|------|
| TASK-lokasi | Google Maps pin lokasi | feature | medium | **done** | [tasks/TASK-lokasi-google-maps-pin.md](tasks/TASK-lokasi-google-maps-pin.md) |

---

## Alur kerja

Issue → branch `feat/<id>-slug` → MR (`Closes #id`) → review → merge.

Label GitLab: `bug` · `feature` · `qa` · `docs` · `infra`

Lihat: [gitlab-collaboration.md](../gitlab-collaboration.md)

---

## Maintenance findings (shift SHIFT-2026-09-02-01)

| ID | Title | Priority | Status | Effort |
|----|-------|----------|--------|--------|
| MAINT-001 | Laporan kehadiran scope | P0 | **done** | M |
| MAINT-002 | Master user show IDOR | P0 | **done** | S |
| MAINT-003 | Public media users/share | P0 | done | L |
| MAINT-004 | Face descriptor export | P1 | done | M |
| MAINT-005 | foto_path client bypass | P1 | done | S |
| MAINT-007 | Attendance session scope | P1 | done | M |
| MAINT-008 | Dashboard 7-day query batch | P1 | done | M |
| MAINT-FE-001 | parentFilter refetch loop | high | done | S |
| MAINT-FE-012 | Sidebar nav expand active | low | done | S |
| MAINT-006 | Face uniqueness scoped + chunked | P1 | **done** | M |
| MAINT-010 | User fillable privilege fields | P1 | **done** | S |
| MAINT-012 | Maps geocoding logging | P2 | **done** | S |
| MAINT-FE-002 | Route lazy loading | medium | **done** | M |
| MAINT-FE-003 | Mobile menu a11y | low | **done** | S |
| MAINT-FE-004 | Bottom nav aria-expanded | low | **done** | S |
| MAINT-FE-008 | Parent list per_page cap | medium | **done** | S |
| MAINT-FE-011 | Loading aria-live | low | **done** | S |
| MAINT-009 | Jamaah saving hook → service | P2 | **done** | S |
| MAINT-FE-005 | Form loading drops chrome | medium | **done** | M |
| MAINT-011 | Dashboard MV parity vs legacy | P2 | **done** | M |
| MAINT-FE-009 | List consolidation | medium | **done** | L |

Detail: `docs/shift/maintenance-audit-2026-09-02.md` · Infra runbook: `docs/devops/infra-backlog-runbook.md`

**Note MAINT-FE-009:** `KategoriUmurPage` tetap bespoke (baris agregat client-side); sisanya memakai `SimpleMasterListPage`.
