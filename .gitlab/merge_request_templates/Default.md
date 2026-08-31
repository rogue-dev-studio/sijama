## Ringkasan

<!-- Apa yang berubah dan mengapa (1–3 kalimat) -->

## Jenis perubahan

- [ ] feat (fitur baru)
- [ ] fix (perbaikan bug)
- [ ] chore / docs / refactor
- [ ] breaking change

## Cara uji

```powershell
docker compose exec backend php artisan test
docker compose exec frontend sh -c "cd /app && npm run build"
```

## Checklist

- [ ] Tidak commit `.env`, secret, atau data PII nyata
- [ ] Migration reversible (jika ada perubahan DB)
- [ ] UI: loading / error state (jika ubah frontend)

## Issue / tiket

<!-- Link issue GitLab jika ada -->

## Catatan deploy

<!-- Perlu migrate, env baru, atau langkah deploy? -->
