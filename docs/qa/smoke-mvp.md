# QA Smoke — SIJAMA MVP

Date: 2026-08-01  
Project: sijama

## Environment

- Docker Compose: db + backend + frontend
- URL FE: http://localhost:5173
- URL API: http://localhost:8080/api
- Admin: admin@sijama.local / password

## Cases

| ID | Case | Expected | Result |
|----|------|----------|--------|
| TC-01 | Login valid | Token + redirect dashboard | pass (API + FE log) |
| TC-02 | Login invalid | 422/error message | pending manual |
| TC-03 | List jamaah | Seed data tampil | pass |
| TC-04 | Create jamaah | Data tersimpan | pending manual |
| TC-05 | Enroll face | Descriptor tersimpan, badge Terdaftar | pending (kamera) |
| TC-06 | CRUD pengajian | Create/update/delete OK | list pass |
| TC-07 | CRUD kegiatan | Create/update/delete OK | list pass |
| TC-08 | Buka sesi absensi | Session open | pending manual |
| TC-09 | Check-in manual | Hadir tercatat unik | pending manual |
| TC-10 | Check-in face | Match nama + hadir | pending (kamera) |
| TC-11 | Dashboard | Angka non-error | pass |
| TC-12 | Logout | Token hilang, ke login | pending manual |

## Notes

- Face recognition bergantung kamera lokal & pencahayaan
- Model face-api di-load dari CDN
