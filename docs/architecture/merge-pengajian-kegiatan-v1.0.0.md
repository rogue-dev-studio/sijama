# Merge Pengajian → Kegiatan

Version: 1.0.0 · Date: 2026-08-31

## Keputusan

Modul transaksi **Pengajian** digabung ke **Kegiatan**. Satu tabel `kegiatan` menampung semua acara (PPG, Daerahan, Pengajian, CAI, Kemandirian).

## Schema

Kolom baru pada `kegiatan`:

- `pemateri`, `pemateri_id`, `materi_id`
- `jam_mulai`, `jam_selesai`
- `catatan`

Jadwal rutin (`kegiatan_jadwal_rutin`) juga menyimpan default pemateri/materi.

## Master data (seed)

**Materi:** Al-Quran, Al-Hadits, Nasehat, Teks Daerahan, PPG Daerah, FKKI Daerah, Organisasi Daerah, ST, CAI, ASAD

**Kategori kegiatan:** Kemandirian, PPG, Daerahan, Pengajian, CAI

## Migrasi data

Migration `2026_08_31_190000_merge_pengajian_into_kegiatan`:

1. Salin baris `pengajian` → `kegiatan` (status `scheduled` → `planned`)
2. Remap `attendance_sessions` (`type=pengajian` → `kegiatan`)
3. Drop tabel `pengajian`

## UI / RBAC

- Menu Transaksi: Kegiatan, Jadwal Rutin, Absensi
- Menu Pengajian & Laporan Pengajian dinonaktifkan
- Form kegiatan: field pemateri/materi/waktu opsional (wajib praktis untuk kategori Pengajian)

## Absensi & kalender

Polymorphic `attendance_sessions.type` hanya `kegiatan`. Kalender membaca satu sumber `kegiatan`.
