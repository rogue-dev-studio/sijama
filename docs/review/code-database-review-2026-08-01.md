# Code & Database Review — SIJAMA

| Field | Value |
|-------|--------|
| Project | `project/sijama` |
| Date | 2026-08-01 |
| Reviewer role | Code Reviewer + Database Engineer |
| Skills | `code-review`, `database-engineering` |
| Rules | `coding` v0.3.0, `database`, `api`, `security` |
| Scope | Backend Laravel API, migrations/models/seeders, frontend SPA (spot-check) |
| **Verdict (initial)** | **Request changes** |
| **Follow-up** | Fixes applied 2026-08-01 (see § Remediation) |

Author/date file headers: out of review scope (identity only).

---

## Executive summary

Architecture dasar sudah sehat: controller tipis, service layer, Form Request, API Resources, Sanctum + permission middleware per route, pagination envelope, UI memanggil API (bukan DB).

Belum lulus gate karena: **unique NIK vs soft delete**, **delete kelompok vs soft-deleted jamaah**, **cascade wilayah vs intent restrict**, **raw/aggregate SQL di service**, **index hot-path kurang**, **tes otomatis hampir kosong**, dan beberapa risiko PII/biometric payload.

---

## Checklist `coding.md`

| Item | Status |
|------|--------|
| Readable / maintainable | Pass (umum) |
| Scalable / efficient | Partial — index & payload wajah |
| Secure / robust | Partial — biometric fillable, seed password |
| High performance / security | Partial |
| Language/framework conventions | Pass |
| No unnecessary comments | Pass |
| No duplicate / dead code | Pass (umum) |
| Errors at boundary | Pass (umum) |
| Sonar / pipeline clean | Not verified (no CI evidence) |
| Max one blank line | Fail — `DashboardService` banyak baris kosong beruntun |
| Modal isolation | Not fully audited |
| **Query ban** | **Fail / Major** — `selectRaw` / `DB::raw` / `whereRaw` di service |

---

## Blocker

| ID | Temuan | Path | Rekomendasi |
|----|--------|------|-------------|
| B1 | `jamaah.nik` `unique()` global + SoftDeletes: NIK soft-deleted mengunci reuse | `migrations/2026_08_01_120002_create_jamaah_table.php`, `Models/Jamaah.php` | Partial unique index PG: `UNIQUE (nik) WHERE deleted_at IS NULL` |
| B2 | Hapus kelompok cek `jamaah()->exists()` tanpa `withTrashed()`; FK `nullOnDelete` melepas riwayat soft-deleted | `KelompokService.php`, `120016_alter_jamaah_add_kelompok.php` | Guard `withTrashed()` dan/atau FK `restrict` |

---

## Major

### Code / architecture

| ID | Temuan | Path | Rekomendasi |
|----|--------|------|-------------|
| C1 | Aggregate/raw SQL di service layer (`selectRaw`, `DB::raw`, join) — bentrok rule “query di persistence” | `Services/DashboardService.php` | Pindah ke model scope / query object / repository; tetap parameterized |
| C2 | `whereRaw('1 = 0')` di ScopeService (aman, tapi raw) | `Services/ScopeService.php` | Prefer `whereKey([])` / `whereRaw` diganti ekspresi builder tanpa SQL string |
| C3 | List jamaah eager + kolom `face_descriptor` jsonb ikut ter-select → payload & memori berat | `JamaahService.php`, `JamaahResource.php` | `select` tanpa descriptor; flag `face_enrolled` via `whereNotNull` / subquery |
| C4 | `face_descriptor` di `$fillable` — risiko mass assignment biometric | `Models/Jamaah.php` | Keluarkan dari fillable; set hanya di `enrollFace` |
| C5 | Hampir tidak ada tes domain (hanya ExampleTest) | `backend/tests/` | Feature tests: authz, scope wilayah, unique NIK+soft delete, check-in |
| C6 | `ilike` di search — PG-specific; drift vs sqlite local | `JamaahService.php` | Abstraksi search per driver atau seragamkan env ke pgsql |
| C7 | `DashboardService` formatting: banyak baris kosong beruntun | `DashboardService.php` | Rapikan ke max 1 blank line |

### Database

| ID | Temuan | Path | Rekomendasi |
|----|--------|------|-------------|
| D1 | FK wilayah `cascadeOnDelete` sementara service berniat proteksi hierarki | `120014`, `120015`, services wilayah | Ubah ke `restrict` (migration baru) |
| D2 | `attendance_sessions` polymorphic tanpa FK/guard delete pengajian/kegiatan | `120005`, `AttendanceService`, event services | Guard delete + optional morph relation |
| D3 | Index kurang: status/waktu list & dashboard; scope FK users; `attendances.jamaah_id` / `recorded_at` | migrations domain | Migration index terarah |
| D4 | Cascade agresif menu → fitur → hak → pivot | RBAC migrations, `MenuService` | Pertimbangkan restrict + soft policy |
| D5 | Migration `120012` campur schema + seed dapukan; `down()` tidak lengkap | `120012_alter_users_rbac.php` | Data seed hanya di seeder; perbaiki rollback docs |
| D6 | Tidak ada CHECK enum status/type/tingkat di DB | create migrations | CHECK atau native enum sesuai PG |
| D7 | Seed demo password `password` + NIK/telepon berbentuk PII | `DatabaseSeeder.php` | Local-only; dokumentasikan; jangan di shared env |

### Security / API

| ID | Temuan | Path | Rekomendasi |
|----|--------|------|-------------|
| S1 | Authn/authz route-level permission: **baik** (default deny via middleware) | `routes/api.php` | Pertahankan; tambah tes negatif 403 |
| S2 | Scope wilayah di service: **baik** secara konsep | `ScopeService.php` | Tutup B2/D1 agar konsisten |

---

## Minor

| ID | Temuan | Rekomendasi |
|----|--------|-------------|
| m1 | Unique `kode` desa/kelompok global, bukan scoped parent | Unique `(parent_id, kode)` |
| m2 | Soft delete hanya di jamaah | Putuskan kebijakan soft-delete modul lain |
| m3 | Relasi morph attendance belum di model | Tambah `morphTo` / dokumentasi |
| m4 | Eager `kelompok.desa.daerah` berlebih vs Resource | Kurangi with() |
| m5 | Frontend: tidak akses DB langsung — **pass** | — |
| m6 | Tidak ada VIEW/TRIGGER/FUNCTION DB | OK untuk Phase 1; domain di PHP |

---

## Yang sudah baik

- Layering Controller → Service → Eloquent Model; Form Request + DTO + Resource
- Pagination `{ items, meta }` konsisten di banyak list
- Permission middleware per endpoint sensitif
- Pivot RBAC `dapukan_hak_akses` dengan PK komposit
- Unique check-in `(session_id, jamaah_id)`
- Index `(type, ref_id)` pada attendance sessions
- Frontend memakai API client (tidak ada SQL di UI)

---

## Priority fix order

1. B1 partial unique NIK + B2 guard soft-deleted / FK policy  
2. D1 restrict cascade wilayah  
3. C3–C4 biometric list/fillable  
4. D3 indexes hot path  
5. C1 pindahkan aggregate dashboard ke persistence-friendly API  
6. C5 feature tests kritis  
7. D7 harden seed non-local  

---

## Verdict

**Request changes** (initial) — 2 blocker + beberapa major.

**After remediation (2026-08-01):** blockers B1–B2 and majors C1–C4, C6–C7, D1–D3, D7, D2 (guard) addressed in code + migration. Remaining: C5 fuller feature/authz tests, D4–D6/m1 optional hardening, CI Sonar. Layak **Approve bersyarat**.

---

## Remediation (applied)

| ID | Fix | Evidence |
|----|-----|----------|
| B1 | Partial unique `jamaah_nik_active_unique` (PG) | Migration `2026_08_01_210000_…`; verified on DB |
| B2 | `jamaah()->withTrashed()->exists()` + FK `restrict` | `KelompokService`; `jamaah_kelompok_id_foreign` = `r` |
| D1 | Wilayah FK → `restrictOnDelete` | `desa`/`kelompok` FK confdeltype `r` |
| D3 | Indexes status/waktu/scope/attendance/RBAC | Same migration |
| C1/C7 | Dashboard tanpa `selectRaw`/`DB::raw`; formatting | `DashboardService` |
| C2 | `whereKey([])` mengganti `whereRaw('1 = 0')` | `ScopeService` |
| C3/C4 | List tanpa descriptor; keluar dari `$fillable`; enroll set + save | `JamaahService`, `Jamaah`, `JamaahResource` |
| C6 | `SearchHelper` `ilike`/`like` per driver | `Support/SearchHelper.php` |
| D2 | Block delete pengajian/kegiatan jika ada session | `PengajianService`, `KegiatanService` |
| D7 | Seeder skip di luar `local`/`testing` | `DatabaseSeeder` |
| C5 | Unit: kelompok soft-delete guard; NIK reuse (PG) | `tests/Unit/KelompokDeleteGuardTest.php`, `JamaahNikSoftDeleteTest.php` |

Ops: backend image rebuilt; migration batch 4 ran in container.

Unit tests: file ada (`KelompokDeleteGuardTest`, `JamaahNikSoftDeleteTest`). Host PHP tanpa `pdo_sqlite`; image production `--no-dev`. Jalankan via DB `sijama_testing` + `composer install` (dev) di container, atau enable sqlite di PHP lokal.

---

## Phase status

| Phase | Role | Status | Artifact |
|-------|------|--------|----------|
| Review | Code Reviewer + Database | done | `docs/review/code-database-review-2026-08-01.md` |
| Remediation | Engineering | done (core blockers) | migration + services + tests |
