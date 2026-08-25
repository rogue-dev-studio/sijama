# Coding Standards Hardening — SIJAMA

Version: 1.0.0  
Date: 2026-08-25

## Scope

Perbaikan prioritas setelah review standar coding (DRY / maintainability / security / testability).

## Changes

### 1. Security — debug face-enroll

- Route `debug/face-enroll` hanya didaftarkan jika `config('app.debug')` true.
- Controller menolak request dengan 404 bila debug off (gate runtime).
- Frontend `enrollDebug.ts` hanya flush ke API saat `import.meta.env.DEV`.

### 2. DRY — Master CRUD FE

- Komponen baru:
  - `frontend/src/components/SimpleMasterListPage.tsx`
  - `frontend/src/components/SimpleMasterNamaFormPage.tsx`
- Dimigrasi ke shell bersama:
  - Materi (list + form)
  - Pekerjaan (list + form)
  - Kategori Kegiatan (list + form, dengan slot warna)

Master lain (Adm wilayah, Pemateri, RBAC, dll.) masih clone — follow-up.

### 3. Testability — Feature API

- `tests/Support/CreatesAuthorizedUser.php`
- `tests/Feature/AuthApiTest.php` — login, 401 `/me`, payload auth
- `tests/Feature/PermissionAndMasterApiTest.php` — 403 tanpa permission, CRUD materi, debug 404

### 4. API envelope

- `AccessDeniedHttpException` dipetakan ke `ApiResponse` 403 di `bootstrap/app.php`.

### 5. Bugfix — permissionCodes

- `User::permissionCodes()` memanggil `loadMissing` pada `Support\Collection` (dari `effectiveDapukan()`).
- Diperbaiki dengan membungkus ke `Eloquent\Collection` sebelum `loadMissing`.

## Round 2 (2026-08-25 lanjut)

### DRY Master FE

- Shell diperluas: `showStatusFilter`, `searchPlaceholder`, leading columns (`kode`)
- Shell baru: `SimpleMasterKodeFormPage`
- Migrasi tambahan: Pusat, AdmNegara, Pemateri (list)
- Total entity di shell: Materi, Pekerjaan, Kategori Kegiatan, Pusat, AdmNegara, Pemateri list

### Tests

- `ScopeServiceTest` — assert jamaah/daerah + applyPusatScope
- `AttendancePermissionTest` — 403/200 pada `/api/attendance/sessions`

## Round 3 (2026-08-25 lanjut)

### Prod hygiene

- `LoginPage`: field login kosong; hint akun demo hanya di `import.meta.env.DEV`

### DRY Master FE

- Shell list: `parentFilter` (filter induk pusat/daerah/negara)
- Shell form kode: `parentSelect`
- Migrasi: Daerah, Desa, AdmProvinsi (+ sebelumnya Pusat/Negara/…)

### Tests

- `AttendanceFlowTest` — open → check-in → close → check-in ditolak

## Verdict residual

| Area | Status |
|------|--------|
| DRY Master FE | Partial+ (hierarki 1-level + simple masters) |
| Adm cascade dalam (Kab→KodePos) | Masih clone (multi-filter) |
| Kelompok/SubKelompok/RBAC/Lokasi | Masih clone |
| File gemuk Jamaah/Absensi/App | Belum |

## Round 4 (2026-08-25 lanjut)

### DRY

- Migrasi: Kelompok, SubKelompok, AdmKabupaten/Kota (list+form)
- `App.tsx` diperkecil lewat `appRoutes.tsx` (`masterCrud` + `renderAppRoutes`)

### Catatan UX

- Filter cascade multi-level (negara→provinsi, daerah→desa) disederhanakan ke 1 parent select dengan label gabungan bila perlu.

## Round 5 (2026-08-25 lanjut)

### DRY Adm + Lokasi

- Migrasi: Adm Kecamatan, Desa/Kelurahan, Kode Pos (list+form)
- `MasterLokasiPage` memakai shell list (Maps copy/buka tetap); form Maps tetap khusus
- `parentSelect.allowEmptyOptions` untuk kode pos tanpa induk wajib

## Round 6 (2026-08-25 lanjut)

### DRY RBAC list + Lokasi filter

- Shell list: `selectFilter`, `canDeleteItem`, `showStatusColumn`, `renderStatusExtra`, `actionsHeaderLabel`
- Migrasi list: Dapukan, Menu, Fitur, Hak Akses
- Filter jenis lokasi dipulihkan lewat `selectFilter`
- Form RBAC / Matriks / Lokasi Maps tetap khusus (domain berbeda)

### Maintainability — pecah file gemuk

- `AbsensiPage` → `pages/absensi/*` (Controls, LiveBar, LiveStage, Notify, types)
- `JamaahFormPage` → `pages/jamaah/*` (ProfileFields, AddressFields, utils)

### Verdict residual

| Area | Status |
|------|--------|
| Master list FE (simple + hierarki + RBAC) | Done (shell) |
| Form khusus (Maps, Menu/Fitur/Hak/Dapukan, Matriks) | Tetap khusus — wajar |
| Absensi / Jamaah | Dipecah modul |
| Feature tests backend | Ada (Rounds 2–3) |

**Hardening coding standards untuk residual Round 5 dinyatakan selesai.**

