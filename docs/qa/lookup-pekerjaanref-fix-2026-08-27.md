# QA — Fix error setelah migrasi Lookup

Date: 2026-08-27  
Project: sijama

## Root cause

`JamaahService::list` eager-load `pekerjaanRef:id,nama` — kolom lama tabel `pekerjaan`.  
`lookup_m` memakai `lookup_id` / `lookup_name` / `lookup_value` → SQL `column "id" does not exist` (HTTP 500 di `/api/jamaah` dan halaman yang memuat jamaah).

## Fix

- `pekerjaanRef:lookup_id,lookup_name,lookup_value`
- Hapus duplikat `handleKecamatanChange` di `MasterLokasiFormPage.tsx` (error TS2393)

## Checklist

- [ ] `/jamaah` list 200, tidak 500
- [ ] Form jamaah / profil load opsi lookup
- [ ] Master Lookup list/edit OK
- [ ] Form lokasi tanpa error compile
