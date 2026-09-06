# SIJAMA

Unggulan: **face recognition** di browser — absensi pengajian lewat kamera lokal, tanpa kirim wajah ke cloud (`face-api.js`).

Aplikasi web pendataan anggota organisasi: data jamaah & keluarga, wilayah berjenjang, jadwal/kegiatan (termasuk **jadwal rutin** yang generate otomatis), absensi wajah, laporan, serta kotak masukan (ide/saran & testimoni).

**Rilis terkini:** [v0.3.0](docs/release/RELEASE-v0.3.0.md) — object storage R2/S3, galeri testimoni, cuplikan UI (`github-contents/`), UX jadwal rutin.  
Sebelumnya: [v0.2.0](https://github.com/rogue-dev-studio/sijama/releases/tag/v0.2.0) (CI/CD & Render).

Demo production: https://sijama-web.onrender.com

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 11, Sanctum |
| Frontend | React + Vite + TypeScript |
| DB | PostgreSQL 16 (lokal Docker / Aiven production) |
| Media | Lokal `storage` atau S3/Cloudflare R2 |
| Infra | Docker Compose · GitLab CI · Render |
| Face ID | face-api.js (browser, tanpa cloud) |

## Quick start

**Production-like (nginx build + image bake):**

```powershell
cd project/sijama
docker compose up -d --build
```

**Development (bind-mount, tanpa rebuild tiap edit kode):**

```powershell
cd project/sijama
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

| Perubahan | Tindakan |
|-----------|----------|
| Kode FE (React/CSS) | Otomatis (Vite HMR) |
| Kode BE (PHP) | Otomatis (bind-mount) |
| `.env` / `environment:` di compose | `docker compose … up -d` (recreate, tanpa `--build`) |
| `Dockerfile` / `composer.lock` / `package-lock.json` | `… up -d --build` |

- Frontend: http://localhost:5173  
- API: http://localhost:8080/api  

Container hanya menjalankan `migrate` (skema). Data dummy anggota/NIK tidak ikut. Seed master + akun uji (local/testing):

```powershell
docker compose exec backend php artisan db:seed
# setelah ubah migration / fresh DB — wajib sertakan seed:
docker compose exec backend php artisan migrate:fresh --seed --force
```

9 akun demo (`admin`, `admin.pusat`, …) dibuat otomatis lewat `WilayahSeeder` → `DemoUsersSeeder` (lokal **dan** release). Password lokal: `password`; release: env `BOOTSTRAP_DEMO_PASSWORD` (min. 8 karakter). Akun demo dilindungi — tidak dapat diedit, dinonaktifkan, diganti password, atau dihapus dari aplikasi. Dapukan sistem terkait juga terkunci.

## Hierarki wilayah

Wilayah fungsional berjenjang (pusat → daerah → desa → kelompok → sub-kelompok) plus master wilayah administrasi, lalu data jamaah/keluarga.

## Peran & cakupan

| Peran | Akses data |
|-------|------------|
| Super Admin | Semua |
| Admin wilayah atas | Sesuai wilayah |
| Admin unit | Sesuai unit |
| Operator | Sesuai unit |
| Anggota | Lihat terbatas di unitnya |

## Akun seed (password: `password`)

| Email | Peran | Cakupan |
|-------|-------|---------|
| admin@sijama.local | Super Admin | global |
| admin.daerah@sijama.local | Admin wilayah | contoh wilayah |
| admin.desa@sijama.local | Admin unit | contoh unit |
| operator@sijama.local | Operator | contoh unit |
| 5s.daerah@sijama.local | Petugas wilayah | contoh wilayah |
| petugas@sijama.local | Petugas unit | contoh unit |

## Modul

1. Master RBAC (peran/dapukan, menu, fitur, hak akses, matriks, pengguna)
2. Master wilayah fungsional & administrasi, lokasi, pemateri, materi, kategori
3. Jamaah + keluarga + enroll wajah
4. Kegiatan, **jadwal rutin** (generate instance otomatis), kalender, absensi face recognition
5. Laporan kehadiran / jamaah / kegiatan
6. Aplikasi: konfig, audit, log, laporkan masalah, kotak masukan & galeri testimoni
7. Dashboard

Status kegiatan dapat diperbarui otomatis oleh scheduler (`events:update-statuses`, tiap ~5 menit): hari H → berlangsung; lewat jam selesai → selesai.

## Cuplikan UI

Screenshot PC/mobile (dengan blur data sensitif) ada di [`github-contents/`](github-contents/) — dipakai README/portfolio. Lihat [github-contents/README.md](github-contents/README.md).

## Deploy

- Render + Aiven: [docs/render-deploy.md](docs/render-deploy.md)
- DB cloud: [docs/database-aiven.md](docs/database-aiven.md)
- CI/CD GitLab: [docs/gitlab-ci.md](docs/gitlab-ci.md)
- Kolaborasi MR: [docs/gitlab-collaboration.md](docs/gitlab-collaboration.md)
- Release notes: [docs/release/](docs/release/)
- Backlog: [docs/planning/backlog-v0.3.md](docs/planning/backlog-v0.3.md)
- Setup kolaborator: [docs/contributor-setup.md](docs/contributor-setup.md)

## Attribution

Author catalog: [Rogue Development](https://github.com/rogue-dev-studio)
