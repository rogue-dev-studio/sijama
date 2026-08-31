# SIJAMA — Deploy ke Render.com

Hosting app online (bukan database). **PostgreSQL tetap di Aiven.**

## Arsitektur

```
Render Static Site (sijama-web)  →  React build (VITE_API_URL → API Render)
Render Web Service (sijama-api)  →  Laravel Docker
Aiven PostgreSQL                 →  DB cloud (sudah running)
GitLab                           →  sumber kode (+ CI test/build opsional)
```

## Prasyarat

- Akun [Render](https://render.com) (login GitLab/GitHub)
- Repo GitLab: `rogue-dev-studio/sijama`
- Aiven service `pg-1a25e67a-sijama` sudah jalan + database `sijama` ada
- `APP_KEY` production (generate lokal):

```powershell
cd backend
php artisan key:generate --show
```

## Deploy via Blueprint (disarankan)

1. Push commit yang berisi `render.yaml` ke GitLab `main`.
2. Render Dashboard → **New** → **Blueprint**.
3. Connect GitLab → pilih repo **sijama**.
4. Render membaca `render.yaml` → buat 2 service: `sijama-api` + `sijama-web`.
5. Saat diminta, isi **secret** env vars untuk `sijama-api`:
   - `APP_KEY` — dari `php artisan key:generate --show`
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — dari Aiven Console
6. **Deploy**. Backend entrypoint menjalankan `migrate --force` otomatis.

URL contoh:

- API: `https://sijama-api.onrender.com`
- Web: `https://sijama-web.onrender.com`

## Deploy manual (tanpa Blueprint)

### Backend — Web Service (Docker)

| Setting | Nilai |
|---------|--------|
| Root Directory | *(kosong — repo root)* |
| Dockerfile | `backend/Dockerfile` |
| Docker Context | `backend` |
| Health Check | `/up` |

Env vars: lihat `.env.render.example` + `APP_URL` = URL service backend.

### Frontend — Static Site

| Setting | Nilai |
|---------|--------|
| Root Directory | `frontend` |
| Build | `npm ci && npm run build` |
| Publish | `dist` |
| Rewrite | `/*` → `/index.html` (SPA) |

Env build: `VITE_API_URL=https://<sijama-api>.onrender.com`

Set `FRONTEND_URL` di backend = URL frontend Render.

## Setelah deploy

1. Cek health: `https://<sijama-api>.onrender.com/up`
2. Seed master data (wajib sekali setelah deploy besar / matriks akses kosong).

**Free tier (tanpa Shell):**

1. Render Dashboard → **sijama-api** → **Environment**
2. Tambah env:
   - `SEED_ON_DEPLOY` = `true`
   - `BOOTSTRAP_ADMIN_USERNAME` = `admin` (atau username pilihan)
   - `BOOTSTRAP_ADMIN_EMAIL` = email admin production
   - `BOOTSTRAP_ADMIN_PASSWORD` = password kuat (min. 8 karakter)
   - `BOOTSTRAP_ADMIN_NAME` = opsional (default: Super Admin SIJAMA)
3. **Manual Deploy** → buka **Logs**, tunggu baris `Seed finished` dan `Production admin ... siap`
4. **Hapus** `SEED_ON_DEPLOY` dan `BOOTSTRAP_ADMIN_*` agar deploy berikutnya tidak seed / reset admin

Entrypoint menjalankan `scripts/seed-aiven-only.sh` (RBAC, konfig, wilayah, lookup, event, hari libur — tanpa akun demo lokal).

**Paid Shell (alternatif):**

```bash
bash scripts/seed-aiven-only.sh
```

> **Jangan** pakai `php artisan db:seed --force` saja — `DatabaseSeeder` sengaja di-skip di production.

Verifikasi (PostgreSQL): `hak_akses` dan grant Super Admin harus ~545 baris. Setelah seed, **logout/login** agar permission session ter-refresh.

Login seed lokal: `admin@sijama.local` / `password` — **ganti password di production.**

3. Buka frontend → login → tes modul utama.

## GitLab CI vs Render

- **GitLab CI** (`/.gitlab-ci.yml`): test + build image registry + deploy SSH VPS (opsional).
- **Render**: pull dari GitLab, build & run otomatis per push (aktifkan Auto-Deploy di service settings).

Keduanya bisa dipakai: CI untuk quality gate, Render untuk hosting tanpa VPS.

## Upload file — Cloudflare R2 (persisten)

Upload (foto, tanda tangan, logo) disimpan di **R2 bucket**, bukan disk Render.

### Cloudflare (sekali)

1. Bucket `sijama-uploads`
2. **Public Development URL** → Enable → catat `https://pub-xxxxx.r2.dev`
3. **R2 API Token** → Object Read & Write → bucket ini saja
4. **S3 API endpoint** dari bucket Settings

### Render (`sijama-api` → Environment)

```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=<R2 token>
AWS_SECRET_ACCESS_KEY=<R2 token>
AWS_DEFAULT_REGION=auto
AWS_BUCKET=sijama-uploads
AWS_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
AWS_URL=https://pub-xxxxx.r2.dev
AWS_USE_PATH_STYLE_ENDPOINT=true
```

`AWS_ENDPOINT` tanpa `/sijama-uploads` di akhir. Secret hanya di Render, tidak di git.

### CORS (jika gambar tidak tampil)

Bucket → CORS → allow origin frontend Render (`https://sijama-web.onrender.com`), methods `GET`, `HEAD`.

Setelah env + redeploy, upload baru masuk R2 dan **tetap ada** setelah redeploy.

Browser memuat gambar lewat **`https://sijama-api.onrender.com/storage/...`** (API stream dari R2) — **CORS di bucket R2 tidak diperlukan** untuk logo/foto di UI. CORS R2 hanya relevan jika browser fetch langsung ke `pub-...r2.dev`.

## Batasan plan Free Render

| Item | Catatan |
|------|---------|
| Cold start | Web service tidur ~15 menit idle; wake up ~30–60 detik |
| Disk | Upload persisten via **R2** (`FILESYSTEM_DISK=s3`) — lihat section di atas |
| DB | **Jangan** pakai Render Postgres free (expired 30 hari) — tetap Aiven |
| Scheduler | `schedule:work` tidak jalan di free web service — butuh cron job terpisah atau upgrade |

## Troubleshooting

| Gejala | Solusi |
|--------|--------|
| 502 / service tidak start | Cek log Render; pastikan `DB_*` + `APP_KEY` benar |
| CORS error | `FRONTEND_URL` harus exact URL frontend (https, tanpa slash akhir) |
| Frontend API gagal | Rebuild frontend setelah `VITE_API_URL` benar |
| DB connection timeout | Aiven → allowed IP: Render egress IP atau `0.0.0.0/0` sementara untuk uji |
