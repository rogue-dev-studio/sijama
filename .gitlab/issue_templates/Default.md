## Konteks

<!-- Masalah / kebutuhan bisnis, siapa yang terdampak -->

## Acceptance criteria

- [ ] 
- [ ] 

## Catatan teknis

<!-- Modul, API, migration, risiko — opsional -->

## Cara uji

```powershell
cd project/sijama
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose exec backend php artisan test
```

## Label (satu utama)

`bug` | `feature` | `qa` | `docs` | `infra`
