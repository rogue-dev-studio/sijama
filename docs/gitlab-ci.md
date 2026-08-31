# SIJAMA — GitLab CI/CD + deploy

Pipeline: **test** → **build** (Container Registry) → **deploy** (manual, SSH ke VPS).

- **Database:** Aiven PostgreSQL (tetap cloud, tidak di GitLab)
- **App:** Docker images di GitLab Registry → pull di server deploy

## Arsitektur

```
GitLab (kode + CI)
    ├─ test: PHPUnit + npm build
    ├─ build: push image backend + frontend
    └─ deploy (manual): SSH → VPS docker compose up
              atau
         Render.com (Blueprint render.yaml) → lihat docs/render-deploy.md
                              ↓
                         Aiven PostgreSQL
```

## 1. Buat repo GitLab

```powershell
cd d:\ZonaKreatif\explore\project\sijama
git init
git remote add origin git@gitlab.com:rogue-dev-studio/sijama.git
glab repo create sijama --private --description "SIJAMA - pendataan anggota & absensi"
git add .
git commit -m "Add GitLab CI/CD and Aiven database config"
git push -u origin main
```

(Jika repo sudah ada, cukup `git remote set-url` + push.)

## Kolaborasi (protected `main` + Merge Request)

Branch `main` **protected** — kontributor push ke branch fitur, merge lewat MR.

- Panduan lengkap: [docs/gitlab-collaboration.md](gitlab-collaboration.md)
- Setup mesin kosong: [docs/contributor-setup.md](contributor-setup.md)
- Undang member sebagai **Developer**; merge ke `main` oleh **Maintainer**
- CI **test** jalan pada MR; **build/deploy** hanya setelah merge ke `main`

## 2. Aktifkan Container Registry

GitLab project → **Deploy → Container Registry** (otomatis aktif setelah push image pertama).

## 3. CI/CD Variables

**Settings → CI/CD → Variables:**

| Variable | Value | Masked | Protected |
|----------|-------|--------|-----------|
| `PRODUCTION_API_URL` | `https://api.domain-kamu.com` | No | Yes |
| `PRODUCTION_APP_URL` | `https://app.domain-kamu.com` | No | Yes |
| `DEPLOY_HOST` | IP/hostname VPS | No | Yes |
| `DEPLOY_USER` | `ubuntu` / `root` | No | Yes |
| `SSH_PRIVATE_KEY` | Private key deploy | Yes | Yes |
| `SSH_KNOWN_HOSTS` | Output `ssh-keyscan -H VPS_IP` | No | Yes |

**DB Aiven** disimpan di server (`/opt/sijama/.env.production`), **bukan** di GitLab CI — kecuali kamu sengaja mau migrate via CI (tidak disarankan).

## 4. Siapkan VPS (sekali)

Di server (Ubuntu + Docker):

```bash
sudo mkdir -p /opt/sijama
sudo chown $USER:$USER /opt/sijama
cd /opt/sijama

# Copy dari repo (atau scp manual):
# - docker-compose.prod.yml
# - scripts/ci-deploy-remote.sh
# - .env.production (dari .env.production.example + password Aiven)

chmod +x scripts/ci-deploy-remote.sh
docker compose -f docker-compose.prod.yml config
```

Isi `.env.production` dengan kredensial Aiven + `APP_KEY` production:

```bash
php artisan key:generate --show   # jalankan lokal, copy ke server
```

Buka firewall: **80, 443, 8080** (sesuaikan).

## 5. Jalankan pipeline

1. Push ke branch `main`
2. GitLab → **CI/CD → Pipelines** → tunggu **test** + **build** hijau
3. Klik **deploy:production** → **Play** (manual)

Deploy job akan:
- Login registry GitLab
- Pull image backend + frontend
- `docker compose up -d`
- `php artisan migrate --force`

## 6. Dev lokal + Aiven (tanpa GitLab deploy)

```powershell
docker compose -f docker-compose.yml -f docker-compose.aiven.yml --env-file .env.aiven up -d --build
```

## Batas GitLab Free

- **400 menit CI/bulan** — build Docker boros menit; deploy manual saja
- Container Registry included
- Deploy butuh **VPS terpisah** (Oracle/Render/VPS murah)

## Tanpa VPS dulu

Pipeline **test + build** tetap jalan; job **deploy** skip sampai `DEPLOY_HOST` + SSH key diisi.

Alternatif app hosting tanpa VPS: Render/Railway (butuh setup terpisah, DB tetap Aiven).
