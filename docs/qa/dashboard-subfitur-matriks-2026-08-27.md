# QA — Dashboard sub-fitur di Matriks

Tanggal: 2026-08-27  
Project: sijama

## Perubahan

### RBAC
Sub-fitur di bawah menu Dashboard:
- `dashboard.view` — akses halaman + KPI
- `dashboard.absensi_overview.view` — Ringkasan Absensi
- `dashboard.jamaah_kelompok.view` — Jamaah per Kelompok
- `dashboard.kategori_umur.view` — Kategori Umur (widget)

### Matriks
- Daftar Fitur = menu leaf (Dashboard, …)
- Detail Fitur = baris SUB-FITUR per fitur (centang LIHAT per bagian)

### Dashboard UI/API
- Widget di-gate dengan `can(...)`
- `GET /dashboard` mengosongkan chart tanpa izin
- `GET /dashboard/absensi-overview` butuh `dashboard.absensi_overview.view`

## Setup

```bash
php artisan db:seed --class=RbacSeeder
```

(local) agar izin baru masuk ke dapukan.

## Cek

1. Matriks → Informasi → Dashboard → Detail Fitur: 4 baris SUB-FITUR
2. Matikan LIHAT Ringkasan Absensi → Simpan → Dashboard tanpa kartu absensi
3. Role lama setelah re-seed tetap punya ketiga widget (ops/view packs)
