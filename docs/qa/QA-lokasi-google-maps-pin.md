# QA — Master Lokasi Google Maps pin

Project: sijama
Date: 2026-08-25
Status: Manual checklist ready

## Coverage

| AC | Cara uji | Hasil |
|----|----------|-------|
| Form lat/lng | Buka Tambah/Edit lokasi, isi koordinat, simpan, reload | Pending local |
| Paste URL Maps | Tempel `https://www.google.com/maps?q=-6.2,106.8` → Terapkan | Pending local |
| Geolokasi | Tombol lokasi perangkat (HTTPS/localhost + izin) | Pending local |
| Preview + share | Setelah titik valid, iframe + salin/buka tautan | Pending local |
| List Maps | Lokasi dengan lat/lng tampil Buka/Salin; tanpa titik = Belum ada | Pending local |
| Opsional | Simpan lokasi tanpa lat/lng tetap sukses | Pending local |

## Notes

- Backend `lat`/`lng` sudah ada; regresi API tidak diharapkan.
- Embed memakai `maps.google.com/...&output=embed` (tanpa API key).
- Short link `goo.gl` / `maps.app.goo.gl` tanpa koordinat di URL tidak bisa di-parse — user harus buka dulu lalu salin tautan yang memuat angka lat/lng, atau isi manual.
