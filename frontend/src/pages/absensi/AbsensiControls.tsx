/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import type { AttendanceSession, Jamaah } from '../../api/types'
import { SearchableSelect } from '../../components/SearchableSelect'
import type { RefOption } from './types'

type AbsensiControlsProps = {
  sessions: AttendanceSession[]
  activeSession: AttendanceSession | null
  jamaahOptions: Jamaah[]
  refOptions: RefOption[]
  sessionType: 'pengajian' | 'kegiatan'
  refId: string
  manualJamaahId: string
  busy: boolean
  canCheckIn: boolean
  canManageSession: boolean
  onSelectSession: (sessionId: string) => void
  onManualJamaahChange: (id: string) => void
  onManualCheckIn: () => void
  onSessionTypeChange: (type: 'pengajian' | 'kegiatan') => void
  onRefIdChange: (id: string) => void
  onOpenSession: () => void
}

export function AbsensiControls({
  sessions,
  activeSession,
  jamaahOptions,
  refOptions,
  sessionType,
  refId,
  manualJamaahId,
  busy,
  canCheckIn,
  canManageSession,
  onSelectSession,
  onManualJamaahChange,
  onManualCheckIn,
  onSessionTypeChange,
  onRefIdChange,
  onOpenSession,
}: AbsensiControlsProps) {
  return (
    <>
      <div className="form-panel absensi-controls">
        <div className="field">
          <label htmlFor="session-select">Sesi aktif</label>
          <SearchableSelect
            id="session-select"
            value={activeSession?.id ? String(activeSession.id) : ''}
            onChange={(next) => onSelectSession(next)}
            placeholder="— Pilih sesi —"
            options={[
              { value: '', label: '— Pilih sesi —' },
              ...sessions.map((session) => ({
                value: String(session.id),
                label: `${session.title} (${session.status})`,
              })),
            ]}
          />
        </div>

        {canCheckIn && (
          <>
            <div className="field">
              <label htmlFor="manual-jamaah">Absensi manual</label>
              <SearchableSelect
                id="manual-jamaah"
                value={manualJamaahId ? String(manualJamaahId) : ''}
                onChange={onManualJamaahChange}
                placeholder="— Pilih jamaah —"
                options={[
                  { value: '', label: '— Pilih jamaah —' },
                  ...jamaahOptions.map((item) => ({
                    value: String(item.id),
                    label: item.nama,
                  })),
                ]}
              />
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="btn btn--secondary"
                disabled={busy || !manualJamaahId || !activeSession}
                onClick={onManualCheckIn}
              >
                Catat manual
              </button>
            </div>
          </>
        )}
      </div>

      {canManageSession && (
        <div className="form-panel inline-form">
          <h2>Buka sesi baru</h2>
          <div className="form-grid form-grid--2">
            <div className="field">
              <label htmlFor="session-type">Tipe</label>
              <SearchableSelect
                id="session-type"
                value={sessionType}
                onChange={(next) => onSessionTypeChange(next as 'pengajian' | 'kegiatan')}
                options={[
                  { value: 'pengajian', label: 'Pengajian' },
                  { value: 'kegiatan', label: 'Kegiatan' },
                ]}
              />
            </div>
            <div className="field">
              <label htmlFor="session-ref">Referensi</label>
              <SearchableSelect
                id="session-ref"
                value={refId ? String(refId) : ''}
                onChange={onRefIdChange}
                placeholder="— Pilih —"
                options={[
                  { value: '', label: '— Pilih —' },
                  ...refOptions.map((item) => ({
                    value: String(item.id),
                    label: item.label,
                  })),
                ]}
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={onOpenSession}
            >
              Buka sesi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
