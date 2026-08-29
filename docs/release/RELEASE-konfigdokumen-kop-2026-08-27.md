# Release notes — Konfig Dokumen Kop Dinamis

Date: 2026-08-27  
Project: sijama

## Delivered

- Kolom `path_logo_kiri`, `path_logo_kanan`, `layout_mode`, `header_style` pada `konfigdokumen_k`
- Upload/hapus logo: `POST|DELETE /api/aplikasi/konfig-dokumen/{lookupId}/assets/{logo-kiri|logo-kanan}`
- Form konfig dokumen: logo kiri/kanan, mode kop/sederhana, kontrol tipografi, pratinjau
- Cetak/PDF memakai logo + style dinamis via `ExportPrintActions` / `tableExport`

## Deploy

1. `php artisan migrate` (sudah dijalankan di container `sijama-backend-1`)
2. Pastikan `storage:link` aktif untuk `/storage/konfig/dokumen/...`
3. Hard refresh FE

## Docs

- `docs/srs/SRS-konfigdokumen-kop-v1.0.0.md`
- `docs/architecture/konfigdokumen_k.md`
- `docs/qa/QA-konfigdokumen-kop.md`
