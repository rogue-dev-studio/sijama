# lookup_m — Generic Master Lookup

## Purpose

`lookup_m` is a generic master table for key/value reference data keyed by `lookup_type` (e.g. status codes, kategori enums stored as rows). Application modules read typed lists via `lookup_type` + ordering (`lookup_urutan`) without hard-coding every enum in schema.

## Table

| Column | Type | Notes |
|--------|------|--------|
| `lookup_id` | int4 PK (`pk_lookup_m`) | Sequence-backed |
| `lookup_type` | varchar(100) NOT NULL | Group key; filtered via index |
| `lookup_name` | varchar(200) | Display label |
| `lookup_value` | varchar(200) | Stored / business value |
| `lookup_urutan` | int4 | Sort order within type |
| `lookup_kode` | varchar(50) | Optional short code |
| `additional_data` | text | Extra payload (JSON/text) |
| `created_date` | timestamp(6) NOT NULL | Default `(('now'::text)::date)` |
| `created_by` | int4 | Audit actor |
| `modified_count` | int4 | Optimistic edit counter |
| `last_modified_date` | timestamp(6) | Audit |
| `last_modified_by` | int4 | Audit |
| `is_deleted` | bool NOT NULL DEFAULT false | Soft-delete flag |
| `is_active` | bool NOT NULL DEFAULT true | Active flag |
| `deleted_date` | timestamp(6) | Soft-delete timestamp |
| `deleted_by` | int4 | Soft-delete actor |

## Index

- `idx_lookup_type_text` — btree expression index on `(lookup_type::text)` for type filters.

## Soft delete

Soft delete uses **`is_deleted` / `deleted_date` / `deleted_by`**, not Laravel `SoftDeletes` (`deleted_at`). Eloquent model: `App\Models\LookupM` with scopes `byType`, `active`, `notDeleted`.

## Menu & API

- Menu Master: slug `master-lookup`, path `/master/lookup`, permissions `lookup.view|create|update|delete`
- API CRUD: `/api/master/lookup` (list default excludes `is_deleted = true`)
- Options API (auth): `GET /api/lookups/options?types=pekerjaan,jenis_kelamin,golongan_darah,status_pernikahan,pendidikan`
  - Response `data` keyed by type: `{ id, name, value, kode }[]`
  - Frontend: `lookupOptionsService.byTypes(...)` — used by Jamaah form; Profile embeds the same lists under `lookups`

## Canonical `lookup_type` values (jamaah)

| `lookup_type` | Digunakan di | Stored on jamaah |
|---------------|--------------|-----------------|
| `pekerjaan` | Form jamaah / profil | `pekerjaan_id` → `lookup_id` (+ snapshot `pekerjaan`) |
| `jenis_kelamin` | Form jamaah / profil | `gender` = `lookup_value` (`L`/`P`) |
| `golongan_darah` | Form jamaah / profil | `golongan_darah` = `lookup_value` |
| `status_pernikahan` | Form jamaah / profil + kategori umur | `status_pernikahan` = `lookup_value` |
| `pendidikan` | Form jamaah / profil | `pendidikan` = `lookup_value` |

Constants: backend `App\Support\LookupTypes`; frontend `src/lib/lookupTypes.ts` (`JAMAAH_FORM_TYPES`, `LOOKUP_TYPE_LABELS`).

Seed: `LookupMSeeder`.

There is **no** separate master menu for pekerjaan / gender / blood type / marital / education — manage rows only via Master Lookup.
