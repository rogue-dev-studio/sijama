# QA — Maintenance 2026-09-02 — SIJAMA

Shift: `SHIFT-2026-09-02-01`

---

## Test plan (tick 1)

| Case | Area | Expected | Status |
|------|------|----------|--------|
| QA-M-001 | Master user show | Non-superadmin GET superadmin → 422 | pending run |
| QA-M-002 | Laporan kehadiran | Scoped user tidak lihat jamaah luar wilayah | pending run |
| QA-M-003 | Jamaah update | PATCH tanpa foto_path field | manual |
| QA-M-004 | Master Hak Akses list | No infinite refetch (network tab) | manual |
| QA-M-005 | Sidebar nav | Active child route expands parent | manual |

---

## Commands

```bash
cd project/sijama/backend
php artisan test --filter=MasterUser
```

**Note (2026-09-02):** Local run blocked — `could not find driver (sqlite)`. Enable `pdo_sqlite` in PHP or run tests in Docker/CI.

---

## Regression watch

- Laporan jamaah/kegiatan (unchanged scope pattern — kegiatan still global, note for MAINT-future)
- Face enroll flow after foto_path rule change
