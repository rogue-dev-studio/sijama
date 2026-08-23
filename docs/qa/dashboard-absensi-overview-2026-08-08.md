# Dashboard — Absensi overview by age

Date: 2026-08-08

## Periods

| Tab | Rentang |
|-----|---------|
| Minggu | 7 hari terakhir |
| Bulan | 30 hari terakhir |
| Tahun | 365 hari terakhir |
| Custom | `from`–`to` via `GET /dashboard/absensi-overview` |

## AC

1. Toggle Minggu / Bulan / Tahun mengganti chart + sidebar tanpa request tambahan.
2. Custom menampilkan input tanggal; mengubah tanggal memuat ulang data.
3. Validasi `to >= from`; error API tampil di kartu.
