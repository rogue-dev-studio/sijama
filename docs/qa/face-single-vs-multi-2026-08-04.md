# Face scan: enroll single vs absensi multi

Date: 2026-08-04

## Rules

| Mode | Deteksi | Perilaku |
|------|---------|----------|
| Pendaftaran wajah | Hanya **1** wajah | >1 wajah → invalid, tidak disimpan |
| Absensi | **Multi** (hingga 5 di overlay) | Setiap wajah yang cocok di-check-in otomatis |

## Catatan teknis

- Enroll: MediaPipe `numFaces=1` + `face-api detectAllFaces` gate sebelum sample/save.
- Absensi: MediaPipe `numFaces=5` overlay; `detectAllFaces` + match + check-in batch per frame.
