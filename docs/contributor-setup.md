# SIJAMA — Setup kolaborator (mesin kosong)

Panduan untuk developer baru yang **belum punya** toolchain SIJAMA. Fokus: jalankan app lokal + push branch + MR.

## Yang perlu diinstal

### Wajib

| Software | Versi min. | Untuk apa |
|----------|------------|-----------|
| **Git** | 2.40+ | Clone, branch, commit |
| **Docker Desktop** | dengan Compose v2 | Postgres + Laravel + React (semua di container) |
| **SSH key** | — | Push ke `git@gitlab.com` (bukan HTTPS password) |

**Tidak wajib** di laptop jika pakai Docker dev (disarankan):

- PHP, Composer, Node.js, npm — sudah di dalam image Docker

### Opsional

| Software | Untuk apa |
|----------|-----------|
| **glab** | MR/CI dari terminal |
| **Cursor / VS Code** | Edit kode |
| **WSL2** (Windows) | Backend Docker Desktop |

### Akun & akses

1. Akun GitLab + diundang ke project `rogue-dev-studio/sijama` role **Developer**
2. SSH public key terdaftar: GitLab → **Preferences → SSH Keys**
3. Tes: `ssh -T git@gitlab.com`

## Checklist mesin kosong (Windows)

```powershell
# 1. Verifikasi toolchain
git --version
docker --version
docker compose version

# 2. Clone
git clone git@gitlab.com:rogue-dev-studio/sijama.git
cd sijama

# 3. Env lokal (default sudah cukup untuk dev)
copy .env.example .env

# 4. Jalankan dev (HMR frontend + bind-mount backend)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# 5. Seed data uji (opsional, pertama kali)
docker compose exec backend php artisan db:seed

# 6. Buka browser
#    Frontend: http://localhost:5173
#    API:      http://localhost:8080/api
```

Login uji (setelah seed): `admin@sijama.local` / `password` — lihat README.

## Checklist mesin kosong (Linux / macOS)

Sama seperti Windows; ganti `copy` dengan `cp .env.example .env`.

Pastikan Docker daemon jalan dan user punya permission `docker` (Linux).

## Setelah app jalan — alur kontribusi

```powershell
git checkout main
git pull origin main
git checkout -b feat/nama-fitur
# ... edit ...
git add .
git commit -m "feat: deskripsi"
git push -u origin feat/nama-fitur
# buat Merge Request ke main di GitLab UI
```

Detail MR & protected `main`: [gitlab-collaboration.md](gitlab-collaboration.md).

> **Kolaborasi hanya via GitLab** (MR + CI). GitHub = mirror kode; jangan push kontribusi ke GitHub `main`.

## Uji sebelum push (sama dengan CI)

```powershell
docker compose exec backend php artisan test
docker compose exec frontend sh -c "cd /app && npm ci && npm run build"
```

Atau dari host (jika Node/PHP terinstal):

```powershell
cd backend
composer install
cp .env.example .env
php artisan test

cd ../frontend
npm ci
npm run build
```

## Yang tidak perlu / tidak dibagikan

| Item | Catatan |
|------|---------|
| Aiven DB production | Hanya maintainer deploy; dev pakai Postgres di Docker |
| `.env.production`, SSH deploy key | Server saja — **jangan** commit |
| GitLab CI variables | Maintainer isi di GitLab Settings |
| Akun production | Tidak diperlukan untuk develop MR |

## Troubleshooting awal

| Masalah | Solusi |
|---------|--------|
| `docker compose` tidak dikenal | Update Docker Desktop; gunakan `docker compose` (bukan `docker-compose` legacy) |
| Port 5173 / 8080 bentrok | Edit `FRONTEND_PORT` / `BACKEND_PORT` di `.env` |
| `Permission denied (publickey)` | Pasang SSH key ke GitLab |
| Build lambat pertama kali | Normal — image pull + `npm ci` / `composer install` |
| Windows: Docker error | Aktifkan WSL2 backend di Docker Desktop |

## Dokumen terkait

- [README.md](../README.md) — quick start singkat
- [gitlab-collaboration.md](gitlab-collaboration.md) — MR & protected branch
- [dev-docker-hot-reload.md](architecture/dev-docker-hot-reload.md) — kapan rebuild vs HMR
- [database-aiven.md](database-aiven.md) — hanya jika sengaja pakai DB cloud dev
