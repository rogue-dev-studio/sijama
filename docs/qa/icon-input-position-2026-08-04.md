# QA — Posisi icon input

Tanggal: 2026-08-04  
Scope: Login (`#username`, `#password`) + pola `.field-control`

## Temuan (before)

| Cek | Hasil |
|-----|--------|
| Vertikal (deltaY center icon vs input) | OK (`0`) |
| Padding kiri untuk teks | **FAIL** — `10.4px` (rule `.field input` menimpa `.field-control input`) |
| Visual | Icon overlap teks (`admin` / dots password) |

Screenshot: `docs/qa/icon-input-login-before.png`

## Perbaikan

- Naikkan spesifisitas: `.field .field-control input/select`
- Padding kiri `2.35rem`
- Icon: `top: 50%` + `translateY(-50%)`

## Hasil (after)

| Cek | Hasil |
|-----|--------|
| deltaY | `0` |
| paddingLeft | `37.6px` |
| iconLeft | `12px` (jarak aman ke teks) |

Screenshot: `docs/qa/icon-input-login-after.png`  
Status: **PASS**
