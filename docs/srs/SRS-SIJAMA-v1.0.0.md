# SRS — Sistem Informasi Jamaah (SIJAMA)

Version: 1.0.0  
Status: Approved (E2E assumption)  
Author: business-analyst, system-analyst  
Last Updated: 2026-08-01  
Project: sijama

---

## 1. Pendahuluan

### 1.1 Tujuan

Menyediakan spesifikasi untuk aplikasi web **SIJAMA** yang mengelola pendataan warga kelompok/jamaah, jadwal pengajian, kegiatan masjid, dan absensi berbasis face recognition kamera lokal.

### 1.2 Ruang Lingkup

**In Scope (MVP):**
- Login admin/pengurus
- CRUD data jamaah (biodata lengkap)
- Enroll wajah (foto + descriptor) per jamaah
- CRUD jadwal pengajian
- CRUD kegiatan bulanan
- Absensi kegiatan/pengajian via kamera lokal + matching wajah
- Dashboard ringkas (jumlah jamaah, kegiatan hari ini, absensi terakhir)
- Deploy lokal via Docker Compose + PostgreSQL

**Out of Scope (v1):**
- Multi-masjid / multi-tenant
- Aplikasi mobile native
- Notifikasi WhatsApp/SMS
- Pembayaran / kas masjid
- Face recognition cloud (AWS Rekognition, dll.)
- Integrasi CCTV IP camera

### 1.3 Definisi & Singkatan

| Istilah | Definisi |
|---------|----------|
| Jamaah | Warga/anggota kelompok yang didata |
| Pengajian | Kegiatan kajian rutin terjadwal |
| Descriptor | Vektor numerik wajah dari face-api.js |
| Pengurus | Operator yang mengelola data dan absensi |

### 1.4 Referensi

| Dokumen | Lokasi |
|---------|--------|
| Brief user | chat 2026-08-01 |
| Architecture | docs/architecture/ADR-001-stack.md |

---

## 2. Gambaran Umum

### 2.1 Perspektif Produk

SIJAMA adalah sistem monolitik modular (API Laravel + SPA React) untuk satu kelompok/masjid, dijalankan on-premise via Docker.

### 2.2 Fungsi Produk

1. Master data jamaah
2. Penjadwalan pengajian & kegiatan
3. Absensi otomatis berbasis wajah (kamera perangkat lokal)
4. Laporan kehadiran sederhana

### 2.3 Karakteristik Pengguna

| Role | Deskripsi | Hak Akses |
|------|-----------|-----------|
| admin | Super user | Semua modul + kelola user |
| pengurus | Operator harian | Jamaah, jadwal, kegiatan, absensi |
| viewer | Baca saja (opsional v1.1) | Dashboard + daftar jadwal |

### 2.4 Batasan

- Face matching berjalan di browser; server hanya menyimpan descriptor
- Akurasi bergantung kualitas kamera dan pencahayaan
- Satu instalasi = satu kelompok

### 2.5 Asumsi & Ketergantungan

- Asumsi: bahasa UI Indonesia
- Asumsi: auth email/password (bukan SSO)
- Asumsi: enroll wajah wajib sebelum absensi face
- Ketergantungan: model face-api.js di-load di browser (CDN atau static)

---

## 3. Kebutuhan Fungsional

| ID | Requirement | Prioritas | Acceptance Criteria |
|----|-------------|-----------|---------------------|
| FR-001 | Login dengan email & password | P0 | Given kredensial valid, When login, Then dapat token/session dan diarahkan ke dashboard |
| FR-002 | CRUD jamaah | P0 | Given pengurus login, When create/edit/delete jamaah, Then data tersimpan di DB dan tampil di list |
| FR-003 | Biodata lengkap jamaah | P0 | Field: NIK (opsional), nama, gender, tgl lahir, alamat, RT/RW, no HP, email, status anggota, foto profil |
| FR-004 | Enroll wajah jamaah | P0 | Given jamaah, When ambil foto via kamera dan deteksi wajah, Then descriptor tersimpan |
| FR-005 | CRUD jadwal pengajian | P0 | Field: judul, pemateri, lokasi, mulai, selesai, catatan, status |
| FR-006 | CRUD kegiatan bulanan | P0 | Field: judul, jenis, tanggal, lokasi, deskripsi, status |
| FR-007 | Absensi via face recognition | P0 | Given sesi absensi dibuka, When wajah cocok ≥ threshold, Then absensi tercatat (unik per orang per sesi) |
| FR-008 | Absensi manual fallback | P1 | Pengurus dapat tandai hadir manual jika wajah gagal |
| FR-009 | Dashboard ringkas | P1 | Tampilkan jumlah jamaah aktif, pengajian minggu ini, absensi hari ini |
| FR-010 | Logout | P0 | Session/token dibersihkan |

---

## 4. Kebutuhan Non-Fungsional

| ID | Kategori | Requirement |
|----|----------|-------------|
| NFR-001 | Security | Password di-hash; API auth Sanctum; default deny |
| NFR-002 | Privacy | NIK/HP tidak di-log; foto wajah hanya untuk enroll/absensi |
| NFR-003 | Performance | List jamaah 500 record < 2s; matching face client < 1s setelah model load |
| NFR-004 | Usability | Mobile-responsive; kamera absensi full-bleed di viewport |
| NFR-005 | Ops | Seluruh stack jalan via `docker compose up` |
| NFR-006 | Audit | Absensi menyimpan timestamp, method (face/manual), operator |

---

## 5. Business Rules

| ID | Rule |
|----|------|
| BR-001 | Satu jamaah maksimal satu enroll wajah aktif |
| BR-002 | Absensi face duplikat dalam sesi yang sama ditolak |
| BR-003 | Threshold matching default 0.5 (euclidean distance); configurable |
| BR-004 | Soft-delete jamaah; absensi historis tetap ada |
| BR-005 | Hanya admin/pengurus yang boleh enroll & absensi |

---

## 6. Use Case (ringkas)

### UC-001 — Login
Actor: admin/pengurus · Related: FR-001

### UC-002 — Kelola Jamaah
Actor: pengurus · Related: FR-002, FR-003

### UC-003 — Enroll Wajah
Actor: pengurus · Related: FR-004

### UC-004 — Kelola Jadwal & Kegiatan
Actor: pengurus · Related: FR-005, FR-006

### UC-005 — Absensi Face
Actor: pengurus · Related: FR-007, FR-008

**Main flow UC-005:**
1. Pengurus buka sesi absensi (pilih pengajian/kegiatan)
2. Browser aktifkan kamera, load model face-api
3. Deteksi wajah → hitung descriptor → bandingkan dengan enroll aktif
4. Jika match: catat hadir + tampilkan nama
5. Jika tidak: tampilkan "tidak dikenali" + opsi manual

---

## 7. Data Requirement (inti)

| Entity | Field utama |
|--------|-------------|
| users | id, name, email, password, role |
| jamaah | id, nik, nama, gender, tanggal_lahir, alamat, rt, rw, no_hp, email, status, foto_path, face_descriptor (jsonb), enrolled_at |
| pengajian | id, judul, pemateri, lokasi, starts_at, ends_at, catatan, status |
| kegiatan | id, judul, jenis, tanggal, lokasi, deskripsi, status |
| attendance_sessions | id, type (pengajian/kegiatan), ref_id, opened_by, opened_at, closed_at, status |
| attendances | id, session_id, jamaah_id, method, matched_distance, recorded_by, recorded_at |

---

## 8. API Requirement (ringkas)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /api/login | No | Login |
| POST | /api/logout | Yes | Logout |
| GET/POST | /api/jamaah | Yes | List/create |
| GET/PUT/DELETE | /api/jamaah/{id} | Yes | Detail/update/delete |
| POST | /api/jamaah/{id}/face | Yes | Simpan descriptor |
| CRUD | /api/pengajian | Yes | Jadwal pengajian |
| CRUD | /api/kegiatan | Yes | Kegiatan |
| POST | /api/attendance/sessions | Yes | Buka sesi |
| POST | /api/attendance/sessions/{id}/check-in | Yes | Catat absensi |
| GET | /api/attendance/sessions/{id} | Yes | Detail + list hadir |
| GET | /api/dashboard | Yes | Ringkasan |

---

## 9. Open Questions

| # | Pertanyaan | Keputusan sementara |
|---|------------|---------------------|
| Q1 | Multi kelompok? | Tidak — single kelompok |
| Q2 | Role jamaah self-service? | Belum — hanya admin/pengurus |
| Q3 | Export Excel? | P2 backlog |

---

## 10. Risks

| Risk | Mitigasi |
|------|----------|
| Akurasi face rendah | Threshold + fallback manual; panduan pencahayaan |
| Model face-api besar | Cache browser; load progress UI |
| PII (NIK, foto) | Akses role-based; jangan expose public URL tanpa auth |

---

## 11. Approval

| Role | Status | Date |
|------|--------|------|
| Product Owner | Approved (E2E) | 2026-08-01 |
| System Analyst | Approved (E2E) | 2026-08-01 |
