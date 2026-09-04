/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-02 20:35:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:16:38
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError } from '../api/client'
import { attendanceService } from '../api/services'
import type { Attendance, AttendanceSession } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { SortableTh, bindSortableTh } from '../components/SortableTh'
import { listColumnPerm, listExportAccess } from '../lib/listUiAccess'
import { toggleSort, type ListSortState } from '../lib/listSort'
import { SearchableSelect } from '../components/SearchableSelect'
import { ExportPrintActions } from '../components/ExportPrintActions'
import { ListFilterBar } from '../components/ListFilterBar'
import {
  dateRangeFilterFields,
  isDefaultDateRange,
  todayIsoDate,
} from '../lib/dateRangeFilters'

type ColumnDef = {
  key: string
  label: string
  sortKey: string
  cell: (item: Attendance) => ReactNode
  exportValue: (item: Attendance) => string | number
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'nama',
    label: 'Nama',
    sortKey: 'nama',
    cell: (item) => item.jamaah?.nama ?? `Jamaah #${item.jamaah_id}`,
    exportValue: (item) => item.jamaah?.nama ?? `Jamaah #${item.jamaah_id}`,
  },
  {
    key: 'metode',
    label: 'Metode',
    sortKey: 'method',
    cell: (item) => methodLabel(item.method),
    exportValue: (item) => methodLabel(item.method),
  },
  {
    key: 'waktu',
    label: 'Waktu',
    sortKey: 'recorded_at',
    cell: (item) => formatDateTime(item.recorded_at),
    exportValue: (item) => formatDateTime(item.recorded_at),
  },
]

const PREFIX = 'kehadiran'
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

function compareAttendances(
  a: Attendance,
  b: Attendance,
  sortBy: string,
  sortDir: 'asc' | 'desc',
): number {
  const dir = sortDir === 'asc' ? 1 : -1
  if (sortBy === 'method') {
    return a.method.localeCompare(b.method) * dir
  }
  if (sortBy === 'nama') {
    const an = (a.jamaah?.nama ?? '').toLowerCase()
    const bn = (b.jamaah?.nama ?? '').toLowerCase()
    return an.localeCompare(bn, 'id') * dir
  }
  const aTime = a.recorded_at ? new Date(a.recorded_at).getTime() : 0
  const bTime = b.recorded_at ? new Date(b.recorded_at).getTime() : 0
  return (aTime - bTime) * dir
}

export function KehadiranPage() {
  const { can } = useAuth()
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [sessionId, setSessionId] = useState('')
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [sessionStatusFilter, setSessionStatusFilter] = useState<'' | 'open' | 'closed'>('')
  const [methodFilter, setMethodFilter] = useState<'' | 'face' | 'manual'>('')
  const [dateFrom, setDateFrom] = useState(todayIsoDate)
  const [dateTo, setDateTo] = useState(todayIsoDate)
  const [namaQuery, setNamaQuery] = useState('')
  const [sort, setSort] = useState<ListSortState>({ sortBy: 'recorded_at', sortDir: 'desc' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const visibleColumns = COLUMNS.filter((column) => can(listColumnPerm(PREFIX, column.key)))
  const exportAccess = listExportAccess(can, PREFIX)

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
      .sort((a, b) => compareAttendances(a, b, sort.sortBy, sort.sortDir))
  }, [activeSession?.attendances, methodFilter, namaQuery, sort])

  function handleSort(column: string) {
    setSort((current) => toggleSort(current, column))
  }

  const sortBind = bindSortableTh(sort, handleSort)

  const loadSessions = useCallback(async () => {
    const result = await attendanceService.listSessions({
      status: sessionStatusFilter || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      per_page: 100,
    })
    setSessions(result.items)
    return result.items
  }, [dateFrom, dateTo, sessionStatusFilter])

  const loadSessionDetail = useCallback(async (id: number) => {
    try {
      const session = await attendanceService.getSession(id)
      setActiveSession(session)
      setError(null)
      return session
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat daftar kehadiran')
      return null
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
      void loadSessionDetail(Number(sessionId))
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
        <div className="page-header__row">
          <div>
            <h1>Kehadiran</h1>
            <p>Daftar jamaah yang sudah absen per sesi.</p>
          </div>
          <div className="page-header__actions">
            <ExportPrintActions
              title={activeSession ? `Kehadiran — ${activeSession.title}` : 'Kehadiran'}
              dokumenKey="kehadiran"
              disabled={loading || attendances.length === 0 || visibleColumns.length === 0}
              {...exportAccess}
              getPayload={() => ({
                title: activeSession ? `Kehadiran — ${activeSession.title}` : 'Kehadiran',
                headers: ['No', ...visibleColumns.map((column) => column.label)],
                columnKeys: ['no', ...visibleColumns.map((column) => column.key)],
                rows: attendances.map((item, index) => [
                  index + 1,
                  ...visibleColumns.map((column) => column.exportValue(item)),
                ]),
              })}
            />
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <ListFilterBar
        search={{
          value: namaQuery,
          onChange: setNamaQuery,
          onSubmit: () => undefined,
          placeholder: 'Filter nama jamaah…',
          label: 'Cari nama',
          ariaLabel: 'Cari nama jamaah',
        }}
        primaryFilters={[
          ...dateRangeFilterFields({
            fromId: 'kehadiran-date-from',
            toId: 'kehadiran-date-to',
            dateFrom,
            dateTo,
            onDateFromChange: setDateFrom,
            onDateToChange: setDateTo,
          }),
          <div className="field" key="status">
            <label htmlFor="kehadiran-session-status">Status sesi</label>
            <SearchableSelect
              id="kehadiran-session-status"
              value={sessionStatusFilter}
              onChange={(next) => setSessionStatusFilter(next as '' | 'open' | 'closed')}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
          </div>,
          <div className="field" key="session">
            <label htmlFor="kehadiran-session">Sesi absensi</label>
            <SearchableSelect
              id="kehadiran-session"
              value={sessionId ? String(sessionId) : ''}
              onChange={(next) => void handleSelectSession(next)}
              placeholder="— Pilih sesi —"
              options={[
                { value: '', label: '— Pilih sesi —' },
                ...sessions.map((session) => ({
                  value: String(session.id),
                  label: `${session.title} · ${session.status} · ${session.attendance_count ?? 0} hadir`,
                })),
              ]}
            />
          </div>,
          <div className="field" key="method">
            <label htmlFor="kehadiran-method">Metode</label>
            <SearchableSelect
              id="kehadiran-method"
              value={methodFilter}
              onChange={(next) => setMethodFilter(next as '' | 'face' | 'manual')}
              placeholder="Semua"
              options={[
                { value: '', label: 'Semua' },
                { value: 'face', label: 'Wajah' },
                { value: 'manual', label: 'Manual' },
              ]}
            />
          </div>,
        ]}
        secondaryActive={Boolean(sessionId || methodFilter)}
        hasActiveFilters={
          Boolean(namaQuery.trim()) ||
          Boolean(sessionStatusFilter) ||
          Boolean(sessionId) ||
          Boolean(methodFilter) ||
          !isDefaultDateRange(dateFrom, dateTo)
        }
        onReset={() => {
          const today = todayIsoDate()
          setNamaQuery('')
          setSessionStatusFilter('')
          setMethodFilter('')
          setDateFrom(today)
          setDateTo(today)
          setSessionId('')
          setActiveSession(null)
        }}
      />

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
          ) : visibleColumns.length === 0 ? (
            <p className="empty-state">Tidak ada kolom yang diizinkan untuk ditampilkan.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">No</th>
                    {visibleColumns.map((column) => (
                      <SortableTh
                        key={column.key}
                        label={column.label}
                        column={column.sortKey}
                        {...sortBind}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((item, index) => (
                    <tr key={item.id}>
                      <td className="col-no">{index + 1}</td>
                      {visibleColumns.map((column) => (
                        <td key={column.key}>{column.cell(item)}</td>
                      ))}
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
