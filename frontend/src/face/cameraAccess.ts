/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 18:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 18:05:00
 */

export type CameraAccessState =
  | 'checking'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error'

export const DEFAULT_CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: false,
}

export function isCameraSupported(): boolean {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

/** Best-effort permission probe (Safari may not support Permissions API for camera). */
export async function queryCameraPermission(): Promise<CameraAccessState> {
  if (!isCameraSupported()) return 'unavailable'

  try {
    const permissions = navigator.permissions
    if (!permissions?.query) return 'prompt'

    const result = await permissions.query({ name: 'camera' as PermissionName })
    if (result.state === 'granted') return 'granted'
    if (result.state === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'prompt'
  }
}

export function describeCameraError(err: unknown): { state: CameraAccessState; message: string } {
  if (!isCameraSupported()) {
    return {
      state: 'unavailable',
      message: 'Peramban ini tidak mendukung akses kamera.',
    }
  }

  const name = err instanceof DOMException ? err.name : ''
  const raw = err instanceof Error ? err.message : ''

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || /permission|denied|notallowed/i.test(raw)) {
    return {
      state: 'denied',
      message:
        'Izin kamera ditolak. Izinkan akses kamera untuk situs ini di pengaturan peramban, lalu coba lagi.',
    }
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || /not found|no device/i.test(raw)) {
    return {
      state: 'unavailable',
      message: 'Kamera tidak ditemukan. Pastikan perangkat kamera terpasang dan tidak dipakai aplikasi lain.',
    }
  }

  if (name === 'NotReadableError' || name === 'TrackStartError' || /in use|busy|readable/i.test(raw)) {
    return {
      state: 'error',
      message: 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.',
    }
  }

  if (name === 'SecurityError' || /secure|https|insecure/i.test(raw)) {
    return {
      state: 'unavailable',
      message: 'Akses kamera membutuhkan koneksi aman (HTTPS) atau localhost.',
    }
  }

  return {
    state: 'error',
    message: raw.trim() || 'Gagal mengakses kamera.',
  }
}

export async function requestCameraStream(
  constraints: MediaStreamConstraints = DEFAULT_CAMERA_CONSTRAINTS,
): Promise<MediaStream> {
  if (!isCameraSupported()) {
    throw Object.assign(new Error('Kamera tidak didukung.'), { name: 'NotSupportedError' })
  }
  return navigator.mediaDevices.getUserMedia(constraints)
}

export function stopMediaStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop())
}
