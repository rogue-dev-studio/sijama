/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 18:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 18:05:00
 */
import type { CameraAccessState } from '../face/cameraAccess'

type CameraPermissionPanelProps = {
  state: Exclude<CameraAccessState, 'checking' | 'granted'>
  message?: string | null
  busy?: boolean
  onRequest: () => void
  title?: string
  className?: string
}

const COPY: Record<
  Exclude<CameraAccessState, 'checking' | 'granted'>,
  { title: string; detail: string; action: string }
> = {
  prompt: {
    title: 'Izin kamera diperlukan',
    detail:
      'Halaman ini membutuhkan kamera. Ketuk tombol di bawah untuk menampilkan permintaan izin peramban.',
    action: 'Izinkan kamera',
  },
  denied: {
    title: 'Izin kamera ditolak',
    detail:
      'Aktifkan kamera untuk situs ini lewat ikon gembok/izin di bilah alamat peramban, lalu ketuk coba lagi.',
    action: 'Coba lagi',
  },
  unavailable: {
    title: 'Kamera tidak tersedia',
    detail: 'Pastikan perangkat punya kamera, tidak dipakai aplikasi lain, dan situs berjalan di HTTPS/localhost.',
    action: 'Coba lagi',
  },
  error: {
    title: 'Gagal membuka kamera',
    detail: 'Terjadi kendala saat mengakses kamera. Coba lagi setelah menutup aplikasi lain yang memakai kamera.',
    action: 'Coba lagi',
  },
}

export function CameraPermissionPanel({
  state,
  message,
  busy = false,
  onRequest,
  title,
  className,
}: CameraPermissionPanelProps) {
  const copy = COPY[state]

  return (
    <div
      className={['camera-permission', className].filter(Boolean).join(' ')}
      role="region"
      aria-label="Izin kamera"
    >
      <div className="camera-permission__card">
        <div className="camera-permission__icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M15 10l4.5-3v10L15 14" />
            <rect x="3" y="6" width="12" height="12" rx="2" />
          </svg>
        </div>
        <h2 className="camera-permission__title">{title || copy.title}</h2>
        <p className="camera-permission__detail">{message?.trim() || copy.detail}</p>
        <button
          type="button"
          className="btn btn--primary"
          disabled={busy}
          onClick={onRequest}
        >
          {busy ? 'Meminta izin…' : copy.action}
        </button>
      </div>
    </div>
  )
}

export function needsCameraPermissionUi(state: CameraAccessState): boolean {
  return state === 'prompt' || state === 'denied' || state === 'unavailable' || state === 'error'
}

export function toCameraPermissionPanelState(
  state: CameraAccessState,
): Exclude<CameraAccessState, 'checking' | 'granted'> {
  if (state === 'denied' || state === 'unavailable' || state === 'error') return state
  return 'prompt'
}
