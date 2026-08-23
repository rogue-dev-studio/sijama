# ADR-002 — RBAC berbasis Dapukan

## Decision

Master-driven RBAC:

`dapukan` → `dapukan_hak_akses` ← `hak_akses` → `fitur` → `menu`

User punya `dapukan_id`. Authorization via kode permission (`jamaah.view`, …).

## Why not Spatie

Kontrol penuh naming Indonesia (dapukan/menu/fitur/hak akses) dan seed matriks masjid lokal tanpa dependency baru.

## Consequences

- Migrasi dari `users.role` string ke FK dapukan
- Frontend nav dari `/api/me` (menus)
- Endpoint master dilindungi permission `rbac.*`
