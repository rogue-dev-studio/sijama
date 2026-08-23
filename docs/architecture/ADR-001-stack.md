# ADR-001 — Stack SIJAMA

## Status

Accepted — 2026-08-01

## Context

Butuh aplikasi web lokal untuk pendataan jamaah, jadwal, kegiatan, dan absensi face recognition kamera lokal, dengan Docker + PostgreSQL.

## Decision

| Layer | Choice | Alasan |
|-------|--------|--------|
| Backend | Laravel 11 + Sanctum | Sesuai Phase 1 AGENTS.md; Form Request, Eloquent, migration matang |
| Frontend | React + Vite + TS | Integrasi face-api.js & kamera lebih natural di SPA |
| DB | PostgreSQL 16 | Diminta user; jsonb untuk face descriptor |
| Infra | Docker Compose | Dev lokal seragam |
| Face | face-api.js (browser) | Kamera lokal, tanpa cloud API, privacy on-device matching |

## Consequences

- Matching wajah di client; server menyimpan descriptor JSON
- Perlu CORS + Sanctum SPA cookie/token config
- Bundle frontend memuat model (~beberapa MB)

## Alternatives considered

- Face recognition di server (Python): lebih kompleks ops, ditunda
- Next.js fullstack: menyimpang dari standar Laravel house
- Blade + Livewire: kamera/FR lebih berat diintegrasikan
