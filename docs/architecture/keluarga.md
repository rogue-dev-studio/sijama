# Keluarga (Kepala Keluarga & Anggota)

Version: 1.0.0  
Date: 2026-08-29

## Ringkasan

Modul **Keluarga** mengelompokkan jamaah sebagai rumah tangga dengan satu **kepala keluarga** dan **anggota** (istri, anak, orang tua, dll.) beserta hubungan keluarga.

## Schema

| Tabel | Fungsi |
|-------|--------|
| `keluarga` | Header KK: kelompok, kepala, no_kk, alamat, status |
| `jamaah_keluarga` | Pivot anggota + `hubungan_keluarga` + flag `is_kepala_keluarga` |

Lookup `hubungan_keluarga`: kepala, istri, suami, anak, orang_tua, saudara, lainnya.

## API

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/keluarga` | `keluarga.view` |
| POST | `/api/keluarga` | `keluarga.create` |
| GET | `/api/keluarga/{id}` | `keluarga.view` |
| PUT/PATCH | `/api/keluarga/{id}` | `keluarga.update` |
| DELETE | `/api/keluarga/{id}` | `keluarga.delete` |

## Menu & RBAC

- Menu: **Master → Keluarga** (`/keluarga`, slug `keluarga`)
- Permissions: `keluarga.view|create|update|delete` + kolom/tombol UI chrome

## Aturan bisnis

- Satu jamaah hanya boleh aktif di satu keluarga (`jamaah_id` unique di pivot).
- Tepat satu kepala keluarga per record; disinkronkan ke `kepala_jamaah_id`.
- Semua anggota harus dari **kelompok yang sama** dengan header keluarga.
- Scope akses mengikuti `kelompok_id` (sama seperti jamaah).
- Hapus keluarga = soft-delete header; data jamaah tidak dihapus.

## Frontend

- `KeluargaListPage` — daftar dengan sort, filter, export
- `KeluargaFormPage` — form header + grid anggota + salin alamat dari kepala
