/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 20:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-02 20:35:00
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { attendanceService } from '../api/services'
import type { Attendance, AttendanceSession } from '../api/types'

import { SearchableSelect } from '../components/SearchableSelect'
const REFRESH_MS = 5000

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function methodLabel(method: Attendance['method']) {
  return method === 'face' ? 'Wajah' : 'Manual'
}

export function KehadiranPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [sessionId, setSessionId] = useState('')
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [sessionStatusFilter, setSessionStatusFilter] = useState<'' | 'open' | 'closed'>('')
  const [methodFilter, setMethodFilter] = useState<'' | 'face' | 'manual'>('')
  const [namaQuery, setNamaQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const attendances = useMemo(() => {
    const items = activeSession?.attendances ?? []
    const q = namaQuery.trim().toLowerCase()
    return [...items]
      .filter((item) => {
        if (methodFilter && item.method !== methodFilter) return false
        if (q) {
          const nama = (item.jamaah?.nama ?? '').toLowerCase()
          if (!nama.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const aTime = a.recorded_at ? new Date(a.recorded_at).getTime() : 0
        const bTime = b.recorded_at ? new Date(b.recorded_at).getTime() : 0
        return bTime - aTime
      })
  }, [activeSession?.attendances, methodFilter, namaQuery])

  const loadSessions = useCallback(async () => {
    const result = await attendanceService.listSessions({
      status: sessionStatusFilter || undefined,
      per_page: 100,
    })
    setSessions(result.items)
    return result.items
  }, [sessionStatusFilter])

  const loadSessionDetail = useCallback(async (id: number, quiet = false) => {
    if (!quiet) setRefreshing(true)
    try {
      const session = await attendanceService.getSession(id)
      setActiveSession(session)
      setError(null)
      return session
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat daftar kehadiran')
      return null
    } finally {
      if (!quiet) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function init() {
      setLoading(true)
      try {
        const items = await loadSessions()
        if (!active) return

        setSessionId((currentId) => {
          const preferred =
            items.find((item) => String(item.id) === currentId) ??
            items.find((item) => item.status === 'open') ??
            items[0]
          if (preferred) {
            void loadSessionDetail(preferred.id)
            return String(preferred.id)
          }
          setActiveSession(null)
          return ''
        })
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat sesi absensi')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void init()
    return () => {
      active = false
    }
  }, [loadSessionDetail, loadSessions])

  useEffect(() => {
    if (!sessionId || activeSession?.status !== 'open') return

    const timer = window.setInterval(() => {
      void loadSessionDetail(Number(sessionId), true)
    }, REFRESH_MS)

    return () => window.clearInterval(timer)
  }, [activeSession?.status, loadSessionDetail, sessionId])

  async function handleSelectSession(value: string) {
    setSessionId(value)
    if (!value) {
      setActiveSession(null)
      return
    }
    await loadSessionDetail(Number(value))
  }

  return (
    <>
      <header className="page-header">
        <h1>Kehadiran</h1>
        <p>Daftar jamaah yang sudah absen per sesi.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="form-panel absensi-controls">
        <div className="field">
          <label htmlFor="kehadiran-session-status">Status sesi</label>
          <SearchableSelect
            id="kehadiran-session-status"
            value={sessionStatusFilter}
            onChange={(next) => setSessionStatusFilter(next as '' | 'open' | 'closed')}
            placeholder="Semua"
            options={[
              { value: "", label: "Semua" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="kehadiran-session">Sesi absensi</label>
          <SearchableSelect
            id="kehadiran-session"
            value={sessionId ? String(sessionId) : ''}
            onChange={(next) => void handleSelectSession(next)}
            placeholder="— Pilih sesi —"
            options={[
              { value: "", label: "— Pilih sesi —" },
              ...sessions.map((session) => ({ value: String(session.id), label: (session.title) + " · " + (session.status) + " · " + (session.attendance_count ?? 0) + " hadir" })),
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="kehadiran-method">Metode</label>
          <SearchableSelect
            id="kehadiran-method"
            value={methodFilter}
            onChange={(next) => setMethodFilter(next as '' | 'face' | 'manual')}
            placeholder="Semua"
            options={[
              { value: "", label: "Semua" },
              { value: "face", label: "Wajah" },
              { value: "manual", label: "Manual" },
            ]}
          />
        </div>
        <div className="field">
          <label htmlFor="kehadiran-nama">Cari nama</label>
          <input
            id="kehadiran-nama"
            type="search"
            placeholder="Filter nama jamaah…"
            value={namaQuery}
            onChange={(event) => setNamaQuery(event.target.value)}
          />
        </div>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn--secondary"
            disabled={!sessionId || refreshing}
            onClick={() => {
              if (!sessionId) return
              void loadSessionDetail(Number(sessionId))
            }}
          >
            {refreshing ? 'Memuat…' : 'Muat ulang'}
          </button>
        </div>
      </div>

      {loading && <div className="loading-state">Memuat daftar kehadiran…</div>}

      {!loading && activeSession && (
        <section className="dash-panel kehadiran-panel">
          <div className="kehadiran-panel__head">
            <h2>{activeSession.title}</h2>
            <p>
              Status: {activeSession.status} · Dibuka {formatDateTime(activeSession.opened_at)} ·{' '}
              {attendances.length} jamaah hadir
              {activeSession.status === 'open' ? ' · diperbarui otomatis' : ''}
            </p>
          </div>

          {attendances.length === 0 ? (
            <p className="empty-state">Belum ada jamaah yang absen pada sesi ini.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    <th scope="col">Nama</th>
                    <th scope="col">Metode</th>
                    <th scope="col">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((item, index) => (
                    <tr key={item.id}>
                      <td className="col-no">{index + 1}</td>
                      <td>{item.jamaah?.nama ?? `Jamaah #${item.jamaah_id}`}</td>
                      <td>{methodLabel(item.method)}</td>
                      <td>{formatDateTime(item.recorded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {!loading && !activeSession && !error && (
        <p className="empty-state">Belum ada sesi absensi. Buka sesi dari menu Absensi terlebih dahulu.</p>
      )}
    </>
  )
}
