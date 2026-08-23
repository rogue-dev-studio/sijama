# SRS — Kategori Umur (Informasi)

Version: 1.2.0
Status: Approved
Author: business-analyst, system-analyst
Last Updated: 2026-08-03
Project: sijama

---

## 1. Tujuan

Menampilkan klasifikasi umur jamaah di menu **Informasi → Kategori Umur**, dihitung otomatis dari **tanggal lahir** + **status pernikahan**.

## 2. Klasifikasi

| Kode | Label | Aturan |
|------|-------|--------|
| paud … remaja | Caberawit / muda-mudi | Usia 0–20 (status nikah diabaikan) |
| pra_nikah | Pra Nikah | Usia 21–59 **dan** belum menikah |
| dewasa | Dewasa | Usia 21–59 **dan** sudah menikah |
| lansia | Lansia | Usia 60+ (status nikah diabaikan) |

Belum diklasifikasi: tanggal lahir kosong, atau usia 21–59 tanpa status pernikahan.

## 3. Field jamaah

- `status_pernikahan`: `belum_menikah` \| `sudah_menikah`
- `pekerjaan`, `pendidikan` tetap input manual
- `kategori_umur` derived (bukan input form)

## 4. API

`GET /api/kategori-umur?kategori=`
