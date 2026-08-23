# QA — Izin kamera (enroll + absensi)

Tanggal: 2026-08-04

## Scope

Panel izin kamera tampil di semua halaman yang memakai kamera jika izin belum diberikan / ditolak / kamera tidak tersedia.

Halaman:
- Pendaftaran wajah (`/jamaah/:id/face`)
- Layar absensi (sesi `open`)

## AC

1. Status `prompt` (belum memutuskan): panel "Izin kamera diperlukan" + tombol Izinkan kamera.
2. Status `denied`: panel petunjuk aktifkan izin di peramban + Coba lagi.
3. Status `unavailable` / error perangkat: panel pesan jelas + Coba lagi.
4. Status `granted`: kamera langsung dibuka tanpa panel.
5. Setelah izin sukses, pratinjau/scan berjalan seperti biasa.
6. Tidak ada `getUserMedia` mentah di luar `face/cameraAccess.ts`.

## Catatan uji

- Uji di Chrome: set Site settings → Camera → Ask / Block.
- Absensi: buka sesi dulu; panel muncul di area kiosk jika belum diizinkan.
