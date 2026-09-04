# QA — Dual Wilayah

| Field | Value |
|-------|--------|
| Date | 2026-08-01 |
| Related | SRS-wilayah-fung-administrasi-v1.0.0, ADR-004 |

## Checks

| # | Case | Expected | Status |
|---|------|----------|--------|
| 1 | Migrate 220000–220200 | Tables pusat + adm_* + jamaah link | pass |
| 2 | Seed administrasi sampel | ID → 32 → 32.73 → … → 40152 | pass |
| 3 | Menu Fungsional vs Administrasi | Dua parent terpisah | pass (seed) |
| 4 | CRUD pusat + daerah.pusat_id | Daerah wajib pusat | pending-manual |
| 5 | Scope tingkat pusat | Jamaah terbatas ke daerah di bawah pusat | pending-manual |
| 6 | Cascading adm UI | Filter parent berantai | pending-manual |
| 7 | Jamaah kode_pos + adm desa/kel | Opsional tersimpan | pending-manual |

## Notes

- Full dump Kemendagri tidak di-seed (Phase 1).
- Verifikasi otomatis backend dilakukan di DB sementara oleh agent (migrate+seed+service smoke).
