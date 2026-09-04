# QA Smoke — SIJAMA MVP

Date: 2026-09-02  
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
| TC-02 | Login invalid | 422/error message | pass (`AuthApiTest::test_login_rejects_invalid_credentials`) |
| TC-03 | List jamaah | Seed data tampil | pass |
| TC-04 | Create jamaah | Data tersimpan | pass (API `JamaahCreateFlowTest`; manual FE optional) |
| TC-05 | Enroll face | Descriptor tersimpan, badge Terdaftar | pass (API `JamaahFaceEnrollTest`; kamera browser optional) |
| TC-06 | CRUD pengajian | Create/update/delete OK | list pass |
| TC-07 | CRUD kegiatan | Create/update/delete OK | list pass |
| TC-08 | Buka sesi absensi | Session open | pass (API `AttendanceFlowTest`) |
| TC-09 | Check-in manual | Hadir tercatat unik | pass (API `AttendanceFlowTest`) |
| TC-10 | Check-in face | Match nama + hadir | pass (API `AttendanceFlowTest` method=face; kamera browser optional) |
| TC-11 | Dashboard | Angka non-error | pass |
| TC-12 | Logout | Token hilang, ke login | pass (API `AuthApiTest::test_logout_revokes_token`; manual FE optional) |

## Optional browser verification (GL-2 / GL-3)

Jalankan sekali di mesin dengan webcam untuk validasi UX kamera:

1. Login → Jamaah → Wajah → enroll (TC-05 browser)
2. Absensi → buka sesi → check-in face (TC-10 browser)

API sudah tercover PHPUnit; browser opsional sebelum production cutover.

## Notes

- Face recognition bergantung kamera lokal & pencahayaan
- Model face-api di-load dari CDN
- Production smoke: [production-smoke-checklist.md](../devops/production-smoke-checklist.md)
