# Code Review Notes — SIJAMA MVP

Date: 2026-08-01

## Findings

| Severity | Item | Action |
|----------|------|--------|
| Low | Face descriptor dikirim ke client saat `enrolled=1` | Diterima untuk MVP lokal; batasi role di M2 |
| Low | Seed password default `password` | Hanya untuk local; ganti sebelum production |
| Info | Matching wajah di browser | Sesuai ADR-001 |

## Critical

Tidak ada blocker critical untuk local MVP.

## Verdict

Approve for local Docker MVP, with security hardening before any internet exposure.
