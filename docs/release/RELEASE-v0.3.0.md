# SIJAMA v0.3.0 — Storage cloud, testimoni, screenshot & jadwal UX

Tanggal rilis: 2026-09-06  
Tag: `v0.3.0`  
Baseline sebelumnya: [`v0.2.0`](https://github.com/rogue-dev-studio/sijama/releases/tag/v0.2.0) (2026-08-31)

## Ringkasan dibanding v0.2.0

v0.2.0 fokusasikan CI/CD GitLab, kolaborasi MR, dan opsi deploy Render.  
**v0.3.0** menambah object storage (R2/S3), perbaikan upload & galeri testimoni/laporan, cuplikan UI siap portfolio (dengan blur privasi), serta UX jadwal rutin ↔ daftar kegiatan.

## Ditambahkan

### Object storage (Closes #8)
- Upload file ke S3-compatible / Cloudflare R2 saat `FILESYSTEM_DISK=s3`
- Proxy `/storage` di API (dan web Render) agar media same-origin
- CORS publik untuk media; rewrite URL legacy R2
- Upload tanpa ACL (kompatibel R2); deteksi MIME aman; serve via `get()` (hindari stream 500)

### Feedback & laporan masalah
- Upload gambar di form testimoni / ide saran / laporan teknis & nonteknis
- Galeri testimoni: kartu dipotong + tombol “Selengkapnya” → modal isi penuh + gambar
- Privasi galeri publik: username & kontak tidak ditampilkan di API/UI publik
- Multi-submit testimoni diperbolehkan (alur UX setelah simpan)

### Dokumentasi & cuplikan UI (`github-contents/`)
- Screenshot PC + mobile hampir seluruh modul (`pc_halaman_*.png` / `mobile_halaman_*.png`)
- Frame konsisten: PC 1440×900, mobile 390×844
- Blur data sensitif (NIK, kontak, nama orang, kata LDII per-kata)
- BrandMark fallback ke `/logo.svg` jika logo konfig gagal
- Hanya PNG root yang di-push; tooling capture & backup `pc/`/`mobile/` lokal

### Deploy / seed Render
- Baseline remigrate + definisi SQL migration ikut di repo
- Seeder production Aiven dengan logging start/ok di stdout Render
- Flag remigrate/seed one-shot yang lebih aman (tidak auto setiap deploy)

### Jadwal rutin → Kegiatan (UX)
- Default filter tanggal Kegiatan: **hari ini → +90 hari** (hasil generate terlihat)
- Create/generate mengembalikan jumlah kegiatan dibuat + pesan jelas jika horizon kosong
- Kolom “Ter-generate s.d.” di daftar jadwal rutin

## Diperbaiki

- Upload gambar & form testimoni/laporan setelah save
- Serving media R2 (CORS, proxy, ACL, stream)
- CI / satu kali remigrate+seed di Render

## Tidak berubah (masih dari rilis sebelumnya)

- Face recognition absensi di browser (tanpa cloud)
- Stack Laravel 11 + React + PostgreSQL + Docker
- CI GitLab, protected `main`, Render Blueprint + Aiven DB
- Auto-status kegiatan via `events:update-statuses` (tiap 5 menit)

## Catatan deploy

| Layanan | URL / catatan |
|---------|----------------|
| Web | https://sijama-web.onrender.com |
| API | Render `sijama-api` |
| DB | Aiven PostgreSQL |
| Media | R2/S3 jika `FILESYSTEM_DISK=s3` |

Pastikan env storage (key, bucket, endpoint, `FILESYSTEM_DISK`) dan scheduler (`schedule:work` / cron) aktif di production.

## Verifikasi singkat

- [ ] Login + dashboard
- [ ] Upload gambar testimoni / laporan terlihat di UI
- [ ] Galeri publik tanpa username/kontak
- [ ] Buat jadwal rutin → kegiatan muncul di filter 90 hari
- [ ] Absensi / enroll wajah (smoke lama)

## Referensi

- Backlog: [docs/planning/backlog-v0.3.md](../planning/backlog-v0.3.md)
- Deploy Render: [docs/render-deploy.md](../render-deploy.md)
- Screenshot tooling: [github-contents/README.md](../../github-contents/README.md)
