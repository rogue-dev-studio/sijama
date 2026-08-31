# SIJAMA — Kolaborasi GitLab (protected `main` + Merge Request)

Repo: `git@gitlab.com:rogue-dev-studio/sijama.git`  
Default branch: **`main`** (protected — tidak bisa push langsung kecuali Maintainer).

## Ringkas alur

```text
clone → branch fitur → commit → push branch → Merge Request → review → merge ke main → CI deploy (manual)
```

Kontributor **Developer** boleh push ke branch mereka sendiri, **tidak** boleh push ke `main`.

## 1. Undang kolaborator

GitLab project → **Manage → Members → Invite member**

| Role | Push ke `main` | Push branch lain | Buka MR | Merge ke `main` |
|------|----------------|------------------|---------|-----------------|
| **Developer** | ❌ | ✅ | ✅ | ❌ (default) |
| **Maintainer** | ✅ | ✅ | ✅ | ✅ |

Untuk kolaborasi umum: undang sebagai **Developer**. Merge ke `main` oleh Maintainer (owner/tim inti).

**Setup mesin kosong (install Git, Docker, clone, jalankan app):** [contributor-setup.md](contributor-setup.md)

## 2. Clone & remote

```powershell
git clone git@gitlab.com:rogue-dev-studio/sijama.git
cd sijama
```

Jika repo lokal sudah ada:

```powershell
git remote add gitlab git@gitlab.com:rogue-dev-studio/sijama.git
git fetch gitlab
git checkout main
git pull gitlab main
```

## 3. Branch fitur (wajib)

```powershell
git checkout main
git pull gitlab main
git checkout -b feat/nama-fitur
```

Konvensi: `feat/`, `fix/`, `chore/`, `docs/` + slug pendek.

## 4. Commit & push branch

```powershell
git add .
git commit -m "feat: deskripsi singkat perubahan"
git push -u gitlab feat/nama-fitur
```

Push ke `main` akan **ditolak** (protected branch).

## 5. Merge Request

Setelah push, buka link **Create merge request** atau **Merge requests → New**.

- Source: branch fitur
- Target: `main`
- Isi template MR
- Assign reviewer Maintainer

### CI pada MR

Pipeline **test** (PHPUnit + `npm build`) jalan untuk MR.

**Build** dan **deploy production** hanya pada `main` setelah merge (deploy manual).

## 6. Review & merge

Maintainer merge setelah pipeline hijau. Developer tidak merge ke `main` (default).

```powershell
git checkout main
git pull gitlab main
git branch -d feat/nama-fitur
```

## 7. Protected branch (status)

`main` di GitLab:

- Push: Maintainers saja
- Merge: Maintainers saja
- Force push: tidak

Settings → **Repository → Protected branches**.

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Tidak boleh push ke `main` | Normal — branch + MR |
| Permission denied (SSH) | Tambah SSH key di GitLab |
| Pipeline MR gagal | `php artisan test` + `npm run build` lokal |

Lihat: [gitlab-ci.md](gitlab-ci.md).
