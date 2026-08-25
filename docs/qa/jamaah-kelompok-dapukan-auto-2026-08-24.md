# Auto dapukan Jamaah Kelompok

Tanggal: 2026-08-24

## Aturan

- Saat jamaah punya `kelompok_id`, dapukan `jamaah_kelompok` selalu di-assign.
- Di form: checkbox Jamaah Kelompok tercentang otomatis, disabled, label “otomatis dari kelompok”.
- Backend `applyDapukanSync` / `ensureJamaahKelompokDapukan` memaksa ID ini meskipun klien mengirim daftar tanpa itu.
