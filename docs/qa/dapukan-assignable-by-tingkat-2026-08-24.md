# Filter dapukan by tingkat aktor (admin only)

Tanggal: 2026-08-24

## Aturan

1. **Siapa yang bisa input:** hanya **admin** (`admin_*` / superadmin).
2. **Apa yang tampil:** semua dapukan aktif (kecuali superadmin) dengan **tingkat sama atau di bawah** aktor — termasuk 4S, PNKB, KU, dll.

| Aktor | Contoh opsi |
|-------|-------------|
| Admin Kelompok | Admin Kelompok, 4S Kelompok, PNKB Kelompok, … (**bukan** Admin Desa / 4S Desa) |
| Admin Desa | Semua tingkat desa + kelompok |
| Admin Daerah | Daerah + desa + kelompok |
| Admin Pusat / Superadmin | Pusat → kelompok |

## Implementasi

- `DapukanService::canAssignJamaahDapukan` — gate aktor admin
- `listForJamaahForm` / `isAssignableByUser` — filter tingkat, bukan hanya `admin_%`
- Sync menolak dapukan di atas tingkatan; pertahankan dapukan protected
