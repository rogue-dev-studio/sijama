# SIJAMA

Unggulan: **face recognition** di browser — absensi pengajian lewat kamera lokal, tanpa kirim wajah ke cloud (`face-api.js`).

Aplikasi web pendataan anggota organisasi: data anggota, jadwal pengajian, kegiatan, dan absensi pengajian.

## Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 11, Sanctum |
| Frontend | React + Vite + TypeScript |
| DB | PostgreSQL 16 |
| Infra | Docker Compose |
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

Container hanya menjalankan `migrate` (skema). Data dummy anggota/NIK tidak ikut. Seed master + akun uji (opsional, local):

```powershell
docker compose exec backend php artisan db:seed
```  

## Hierarki wilayah

Wilayah berjenjang sampai unit terkecil, lalu data anggota.

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

1. Master RBAC (peran, menu, fitur, hak akses, matriks, pengguna)
2. Master wilayah
3. Anggota + enroll wajah
4. Pengajian, kegiatan, dan absensi pengajian (face recognition)
5. Dashboard

## Deploy (GitLab CI + Aiven)

- DB cloud: [docs/database-aiven.md](docs/database-aiven.md)
- CI/CD + VPS deploy: [docs/gitlab-ci.md](docs/gitlab-ci.md)
- Kolaborasi (MR, protected `main`): [docs/gitlab-collaboration.md](docs/gitlab-collaboration.md)
- Setup kolaborator (mesin kosong): [docs/contributor-setup.md](docs/contributor-setup.md)

## Attribution

Author catalog: [Rogue Development](https://github.com/rogue-dev-studio)
