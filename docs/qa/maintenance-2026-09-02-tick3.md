# QA — Maintenance Shift TICK-3 (SHIFT-2026-09-02-02)

## Automated

| Check | Result |
|-------|--------|
| `php artisan test` (Docker) | **45/45 pass** |
| `npm run build` | **pass** (lazy chunks emitted) |
| PHP syntax | OK (via test bootstrap) |

## Manual / browser (GL-2..4)

Stack: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` → FE `:5173`, API `:8080`.

| ID | Scenario | Status |
|----|----------|--------|
| GL-4 | Create jamaah E2E | **partial** — covered by `JamaahContactValidationTest`; UI manual per `smoke-mvp.md` |
| GL-2 | Face enroll browser | **pending** — needs camera + models loaded |
| GL-3 | Absensi kamera | **pending** — needs camera |

## Regression notes

- Attendance close session: fixed missing `Request` injection
- Kelompok scope on session list: fixed `jamaah_r` table alias
