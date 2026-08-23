# Architecture Overview — SIJAMA

## Diagram

```text
Browser (React SPA)
  ├─ Auth UI
  ├─ Jamaah CRUD + Face Enroll (face-api.js + getUserMedia)
  ├─ Pengajian / Kegiatan
  └─ Absensi Kamera (match descriptor lokal → POST check-in)
           │ HTTPS/HTTP
           ▼
Laravel API (:8080)
  ├─ Sanctum auth
  ├─ Controllers / Services
  └─ Eloquent
           │
           ▼
PostgreSQL (:5432)
  tables: users, jamaah, pengajian, kegiatan,
          attendance_sessions, attendances
```

## Modules

| Module | Responsibility |
|--------|----------------|
| Auth | Login/logout, role gate |
| Jamaah | Master biodata + face descriptor |
| Pengajian | Jadwal rutin |
| Kegiatan | Event bulanan |
| Attendance | Session + check-in face/manual |
| Dashboard | Aggregates |

## Security notes

- Role middleware: `admin`, `pengurus`
- File foto di storage private / dilayani via auth route
- Tidak log NIK/HP penuh
- Threshold face configurable via `FACE_MATCH_THRESHOLD` env

## Deployment (local)

`docker compose up` → services: `db`, `backend`, `frontend`
