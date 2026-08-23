# ADR-003 — Scope wilayah Daerah → Desa → Kelompok

## Decision

- Master `daerah`, `desa`, `kelompok`
- Jamaah milik `kelompok`
- User punya `dapukan` + `daerah_id` / `desa_id` / `kelompok_id`
- Query operasional (jamaah, absensi enrolled list) di-scope via `ScopeService`
- Superadmin bypass scope

## Dapukan kode

Aktif: `superadmin`, `admin_pusat`, `admin_daerah`, `admin_desa`, `admin_kelompok`, `pnkb_{daerah|desa|kelompok}`, `4s_{daerah|desa|kelompok}`, `jamaah_kelompok`, `ku_*`, `kmm_*`, `pjp_*`, `bk_*`, `keputrian_*`, `mubaligh_*`, `faroid_*`, `kematian_*` (masing-masing daerah/desa/kelompok kecuali jamaah hanya kelompok).
