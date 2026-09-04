# ADR — Squash migrations ke baseline bersih

Version: 1.1.0  
Date: 2026-09-04  
Status: Accepted

## Context

Project early; environment boleh `migrate:fresh --seed`. Incremental alter/rename/add memperpanjang history tanpa nilai untuk remigrate.

## Decision

- Schema kanonik hanya di `database/migrations/definitions/*.sql` (+ mirror `SqliteSchema`).
- Migration PHP = create (atau reporting object) saja.
- Kolom baru: edit definition create, lalu remigrate — jangan sisakan fragment alter di tree selama fase remigrate-first.

## Consequences

- Environment lama: `migrate:fresh --seed` (data hilang).
- `users` scope columns tanpa FK DB (circular create order); lihat `definitions/README.md`.
