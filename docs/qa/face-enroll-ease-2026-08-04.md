# QA — Enroll wajah / debug

Tanggal: 2026-08-04

## Root cause mentok 97%

`detectAllFaces(...).withFaceLandmarks().withFaceDescriptor()` salah API.
Yang benar: **`withFaceDescriptors()`** (jamak) untuk `detectAllFaces`.
Akibatnya sampling selalu `sample_error`, `buffer=0`, progress tertahan.

## Fix

- Enroll + Absensi: ganti ke `withFaceDescriptors()`
- Types di `face-api.d.ts` diselaraskan
