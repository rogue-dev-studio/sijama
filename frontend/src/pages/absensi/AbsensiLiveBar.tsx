/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import type { AttendanceSession } from '../../api/types'

type AbsensiLiveBarProps = {
  session: AttendanceSession
  cameraActive: boolean
  attendedCount: number
  showSetup: boolean
  busy: boolean
  canManageSession: boolean
  isFullscreen: boolean
  onToggleSetup: () => void
  onToggleFullscreen: () => void
  onCloseSession: () => void
}

export function AbsensiLiveBar({
  session,
  cameraActive,
  attendedCount,
  showSetup,
  busy,
  canManageSession,
  isFullscreen,
  onToggleSetup,
  onToggleFullscreen,
  onCloseSession,
}: AbsensiLiveBarProps) {
  return (
    <div className="absensi-screen__bar">
      <div>
        <strong>{session.title}</strong>
        <span className="absensi-screen__meta">
          {cameraActive ? 'Kamera aktif' : 'Kamera nonaktif'} · {attendedCount} hadir
        </span>
      </div>
      <div className="btn-group">
        <button type="button" className="btn btn--ghost" onClick={onToggleSetup}>
          {showSetup ? 'Sembunyikan pengaturan' : 'Pengaturan'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onToggleFullscreen}>
          {isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
        </button>
        {canManageSession && (
          <button
            type="button"
            className="btn btn--danger"
            disabled={busy}
            onClick={onCloseSession}
          >
            Tutup sesi
          </button>
        )}
      </div>
    </div>
  )
}
