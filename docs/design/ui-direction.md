# Design System Notes — SIJAMA

## Direction

Nuansa tenang, bersih, islami-kontemporer tanpa klise ungu/gradient generik.

## Brand mark

Icon SIJAMA: kubah sederhana + tiga siluet jamaah di atas kotak hijau masjid (`#0f6b4c`).

| Asset | Path |
|-------|------|
| Favicon | `frontend/public/favicon.svg` |
| Logo UI | `frontend/public/logo.svg` |
| Artifact | `artifacts/images/sijama-logo.svg`, `sijama-favicon.svg` |

Dipakai di favicon browser, login, dan app shell (komponen `BrandMark`).

## Tokens

| Token | Value |
|-------|-------|
| `--color-bg` | `#f7f4ef` warm sand (subtle, not cream-serif AI default) |
| `--color-surface` | `#ffffff` |
| `--color-ink` | `#1a2e28` deep green-black |
| `--color-accent` | `#0f6b4c` mosque green |
| `--color-accent-soft` | `#d8eee4` |
| `--color-muted` | `#5c6b64` |
| `--color-danger` | `#b42318` |
| `--font-display` | "Fraunces", serif |
| `--font-body` | "Source Sans 3", sans-serif |

## Layout

- App shell: sidebar kiri (desktop) / bottom nav (mobile)
- Satu tujuan per halaman
- Absensi: kamera full-bleed (mode layar), notifikasi sudah/belum absen di bawah — tanpa daftar hadir

## Motion

1. Fade-in page content 200ms
2. Pulse lembut saat wajah terdeteksi
3. Toast slide untuk check-in sukses
4. Dashboard chart bar/column: hover scale + warna aksen lebih terang (~220ms); hormati `prefers-reduced-motion`

## Avoid

- Purple gradients, pill clusters, hero clutter
- Card tanpa aksi
- Overlay info berlebih di atas video absensi
