# SIJAMA — PostgreSQL di Aiven (Free 1 GB)

## 1. Buat service di Aiven Console

1. Login https://console.aiven.io
2. **Create service** → **PostgreSQL**
3. Plan: **Free** (1 GB storage, 1 CPU, 1 GB RAM)
4. Cloud: **DigitalOcean** — free tier **hanya** region terbatas (auto-assign):
   - **Bangalore, India** ← paling dekat dari Indonesia (Asia)
   - Alternatif free: Amsterdam, Frankfurt, London, NYC, SFO, Toronto
   - **Singapore tidak tersedia** di plan Free (hanya paid)
5. Service name: `sijama-pg`
6. Create service → tunggu status **Running** (region free biasanya **Bangalore/India**)

## 2. Buat database `sijama`

Di service → tab **Databases** → **Create database** → nama: `sijama`

## 3. Ambil kredensial

Service → **Overview** → **Connection information**:

| Field | Contoh |
|-------|--------|
| Host | `pg-xxxxx.a.aivencloud.com` |
| Port | `12345` (bukan 5432) |
| User | `avnadmin` |
| Password | (copy dari console) |
| Database | `sijama` |
| SSL | **required** |

## 4. Konfigurasi SIJAMA

```powershell
cd project/sijama
copy .env.aiven.example .env.aiven
# Edit .env.aiven — isi DB_HOST, DB_PORT, DB_PASSWORD, DB_DATABASE=sijama
```

Jalankan stack (backend + frontend, DB di Aiven):

```powershell
docker compose -f docker-compose.yml -f docker-compose.aiven.yml --env-file .env.aiven up -d --build
```

Migrate + seed (opsional; **wipe** data — cocok setelah squash baseline):

```powershell
docker compose -f docker-compose.yml -f docker-compose.aiven.yml --env-file .env.aiven exec backend php artisan migrate:fresh --seed --force
```

Atau dari host (SSL required):

```powershell
# load .env.aiven ke environment, lalu:
cd backend
php artisan migrate:fresh --seed --force
```

Baseline migrations: lihat `docs/architecture/ADR-migration-squash-baseline-v1.0.0.md`.

## 5. Tanpa Docker (backend lokal)

Edit `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=pg-xxxxx.a.aivencloud.com
DB_PORT=12345
DB_DATABASE=sijama
DB_USERNAME=avnadmin
DB_PASSWORD=xxxxx
DB_SSLMODE=require
```

```powershell
cd project/sijama/backend
php artisan migrate --force
php artisan db:seed
php artisan serve
```

## Catatan

- **Jangan commit** `.env.aiven` atau password ke Git.
- Data lokal Docker (`pgdata` volume) **tidak pindah otomatis** — perlu dump/restore manual jika mau migrasi data.
- Aiven free tier bisa **sleep** setelah idle — request pertama bisa lambat.
- Backup: Aiven Console → **Backups** (free tier: backup otomatis terbatas).
