# Release Checklist — SIJAMA MVP (local)

- [x] SRS & architecture written
- [x] Docker Compose: postgres + laravel + react
- [x] Auth Sanctum + seed admin
- [x] Modul jamaah, pengajian, kegiatan, absensi, dashboard
- [x] `docker compose up -d --build` verified on this machine
- [x] Smoke TC-01, TC-03, TC-06/07 list, TC-11
- [ ] Remaining smoke (create, face enroll, absensi kamera)
- [ ] User approval for commit/push
- [ ] **Do not deploy production** without HTTPS, secret rotation, backup

## Run

```powershell
cd project/sijama
copy .env.example .env
docker compose up -d --build
```

Frontend: http://localhost:5173  
API: http://localhost:8080/api  
Login: admin@sijama.local / password
