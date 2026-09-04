/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:44:00
 */

import { useState } from 'react'
import type { AttendanceSession, Jamaah } from '../../api/types'
import { MenuIcon } from '../../components/MenuIcon'
import { MobileFilterDrawer } from '../../components/MobileFilterDrawer'
import { SearchableSelect } from '../../components/SearchableSelect'
import { useIsMobileFilterLayout } from '../../hooks/useMediaQuery'
import type { RefOption } from './types'

type AbsensiControlsProps = {
  sessions: AttendanceSession[]
  activeSession: AttendanceSession | null
  jamaahOptions: Jamaah[]
  refOptions: RefOption[]
  refId: string
  manualJamaahId: string
  busy: boolean
  canCheckIn: boolean
  canManageSession: boolean
  onSelectSession: (sessionId: string) => void
  onManualJamaahChange: (id: string) => void
  onManualCheckIn: () => void
  onRefIdChange: (id: string) => void
  onOpenSession: () => void
}

export function AbsensiControls({
  sessions,
  activeSession,
  jamaahOptions,
  refOptions,
  refId,
  manualJamaahId,
  busy,
  canCheckIn,
  canManageSession,
  onSelectSession,
  onManualJamaahChange,
  onManualCheckIn,
  onRefIdChange,
  onOpenSession,
}: AbsensiControlsProps) {
  const isMobile = useIsMobileFilterLayout()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const sessionSelect = (
    <SearchableSelect
      id={isMobile ? 'session-select-mobile' : 'session-select'}
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
  )

  const manualSelect = (
    <SearchableSelect
      id={isMobile ? 'manual-jamaah-mobile' : 'manual-jamaah'}
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
  )

  const refSelect = (
    <SearchableSelect
      id={isMobile ? 'absensi-ref-mobile' : 'absensi-ref'}
      value={refId}
      onChange={onRefIdChange}
      placeholder="— Pilih referensi —"
      options={[
        { value: '', label: '— Pilih referensi —' },
        ...refOptions.map((item) => ({
          value: String(item.id),
          label: item.label,
        })),
      ]}
    />
  )

  if (isMobile) {
    return (
      <>
        <div className="absensi-controls absensi-controls--mobile">
          <div className="absensi-controls__row absensi-controls__row--mobile-summary">
            <div className="field absensi-controls__field">
              <label>Sesi</label>
              <p className="absensi-controls__session-summary">
                {activeSession ? activeSession.title : 'Belum dipilih'}
              </p>
            </div>
            <button
              type="button"
              className={`btn btn--secondary btn--icon absensi-controls__drawer-toggle${
                drawerOpen || activeSession ? ' is-active' : ''
              }`}
              aria-expanded={drawerOpen}
              aria-haspopup="dialog"
              aria-label="Kontrol absensi"
              title="Kontrol absensi"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon name="list-filter" size={16} />
            </button>
          </div>
        </div>

        <MobileFilterDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Kontrol Absensi"
        >
          <div className="filter-drawer__fields">
            <div className="filter-drawer__field">
              <div className="field">
                <label htmlFor="session-select-mobile">Sesi aktif</label>
                {sessionSelect}
              </div>
            </div>
            {canCheckIn ? (
              <div className="filter-drawer__field">
                <div className="field">
                  <label htmlFor="manual-jamaah-mobile">Absensi manual</label>
                  {manualSelect}
                </div>
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={busy || !manualJamaahId || !activeSession}
                  onClick={onManualCheckIn}
                >
                  Catat manual
                </button>
              </div>
            ) : null}
            {canManageSession ? (
              <div className="filter-drawer__field">
                <div className="field">
                  <label htmlFor="absensi-ref-mobile">Referensi kegiatan</label>
                  {refSelect}
                </div>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={busy || !refId}
                  onClick={onOpenSession}
                >
                  Buka sesi
                </button>
              </div>
            ) : null}
          </div>
        </MobileFilterDrawer>
      </>
    )
  }

  return (
    <div className="absensi-controls">
      <div
        className={`absensi-controls__row${canCheckIn ? ' absensi-controls__row--ops' : ''}`}
      >
        <div className="field absensi-controls__field">
          <label htmlFor="session-select">Sesi aktif</label>
          {sessionSelect}
        </div>

        {canCheckIn ? (
          <>
            <div className="field absensi-controls__field">
              <label htmlFor="manual-jamaah">Absensi manual</label>
              {manualSelect}
            </div>
            <div className="absensi-controls__action">
              <span className="absensi-controls__action-spacer" aria-hidden="true">
                &nbsp;
              </span>
              <button
                type="button"
                className="btn btn--secondary absensi-controls__btn"
                disabled={busy || !manualJamaahId || !activeSession}
                onClick={onManualCheckIn}
              >
                Catat manual
              </button>
            </div>
          </>
        ) : null}
      </div>

      {canManageSession ? (
        <div className="absensi-controls__row absensi-controls__row--open">
          <div className="field absensi-controls__field">
            <label htmlFor="absensi-ref">Referensi kegiatan</label>
            {refSelect}
          </div>
          <div className="absensi-controls__action">
            <span className="absensi-controls__action-spacer" aria-hidden="true">
              &nbsp;
            </span>
            <button
              type="button"
              className="btn btn--primary absensi-controls__btn"
              disabled={busy || !refId}
              onClick={onOpenSession}
            >
              Buka sesi
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
