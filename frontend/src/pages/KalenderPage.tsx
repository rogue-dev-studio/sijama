/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 17:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 18:25:00
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/client'
import { calendarService } from '../api/services'
import type { CalendarDay, CalendarEvent, CalendarMonth } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { SearchableSelect } from '../components/SearchableSelect'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as const
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const
const MAX_MARKERS = 3

function formatMonthTitle(year: number, month: number) {
  return `${MONTHS[month - 1]} ${year}`
}

function hijriLabel(dateIso: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${dateIso}T12:00:00`))
  } catch {
    try {
      return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${dateIso}T12:00:00`))
    } catch {
      return ''
    }
  }
}

function dayNumber(dateIso: string) {
  return Number(dateIso.slice(8, 10))
}

function localDateIso(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSunday(dateIso: string) {
  return new Date(`${dateIso}T12:00:00`).getDay() === 0
}

function buildGrid(days: CalendarDay[]): Array<CalendarDay | null> {
  if (days.length === 0) return []
  const first = new Date(`${days[0].date}T12:00:00`)
  const mondayOffset = (first.getDay() + 6) % 7
  const cells: Array<CalendarDay | null> = Array.from({ length: mondayOffset }, () => null)
  cells.push(...days)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function KalenderPage() {
  const { can } = useAuth()
  const canGrid = can('kalender.grid.view')
  const canHariLibur = can('kalender.hari_libur.view')
  const canDetailHari = can('kalender.detail_hari.view')
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState<CalendarMonth | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await calendarService.month({ year, month })
      setData(result)
      const todayIso = localDateIso()
      setSelectedDate((prev) => {
        if (prev && result.days.some((day) => day.date === prev)) return prev
        if (result.days.some((day) => day.date === todayIso)) return todayIso
        return result.days[0]?.date ?? null
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat kalender')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    void load()
  }, [load])

  const grid = useMemo(() => buildGrid(data?.days ?? []), [data?.days])
  const selectedDay = data?.days.find((day) => day.date === selectedDate) ?? null

  function eventLink(event: CalendarEvent) {
    return event.type === 'pengajian' ? `/pengajian/${event.id}/edit` : `/kegiatan/${event.id}/edit`
  }

  function handleYearChange(raw: string) {
    const next = Number(raw)
    if (!Number.isInteger(next) || next < 1) return
    setYear(next)
  }

  function goToToday() {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
    setSelectedDate(localDateIso(today))
  }

  const today = new Date()
  const todayIso = localDateIso(today)
  const viewingToday = year === today.getFullYear() && month === today.getMonth() + 1

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Kalender</h1>
            <p>Jadwal kegiatan dan pengajian per bulan (Masehi &amp; Hijriyah).</p>
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      <div className="form-panel calendar-card">
        <div className="calendar-toolbar">
          <h2 className="calendar-toolbar__title">{formatMonthTitle(year, month)}</h2>
          <div className="calendar-toolbar__filters">
            <div className="field">
              <label htmlFor="calendar-month">Bulan</label>
              <SearchableSelect
                id="calendar-month"
                value={String(month)}
                onChange={(next) => setMonth(Number(next))}
                placeholder="Pilih bulan"
                options={MONTHS.map((label, index) => ({
                  value: String(index + 1),
                  label,
                }))}
              />
            </div>
            <div className="field">
              <label htmlFor="calendar-year">Tahun</label>
              <input
                id="calendar-year"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={year}
                onChange={(event) => handleYearChange(event.target.value)}
              />
            </div>
            <div className="field calendar-toolbar__today">
              <span className="calendar-toolbar__today-spacer" aria-hidden="true">
                &nbsp;
              </span>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={goToToday}
                aria-label="Lompat ke hari ini"
                disabled={viewingToday && selectedDate === todayIso}
              >
                Hari ini
              </button>
            </div>
          </div>
        </div>

        {loading && <div className="loading-state">Memuat kalender…</div>}

        {!loading && data && (
          <>
            {canGrid && (
            <div className="calendar-grid" role="grid" aria-label={`Kalender ${formatMonthTitle(year, month)}`}>
              {WEEKDAYS.map((label) => (
                <div
                  key={label}
                  className={[
                    'calendar-grid__weekday',
                    label === 'Jum' ? 'calendar-grid__weekday--friday' : '',
                    label === 'Min' ? 'calendar-grid__weekday--sunday' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </div>
              ))}
              {grid.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="calendar-cell calendar-cell--empty" />
                }
                const isSelected = day.date === selectedDate
                const isToday = day.date === todayIso
                const sunday = isSunday(day.date)
                const visible = day.events.slice(0, MAX_MARKERS)
                const overflow = day.events.length - visible.length
                return (
                  <button
                    key={day.date}
                    type="button"
                    className={[
                      'calendar-cell',
                      day.is_friday ? 'calendar-cell--friday' : '',
                      sunday ? 'calendar-cell--sunday' : '',
                      day.holiday ? 'calendar-cell--holiday' : '',
                      isToday ? 'calendar-cell--today' : '',
                      isSelected ? 'calendar-cell--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => canDetailHari && setSelectedDate(day.date)}
                    aria-current={isToday ? 'date' : undefined}
                  >
                    <div className="calendar-cell__dates">
                      <span
                        className={`calendar-cell__day${
                          day.holiday || sunday ? ' calendar-cell__day--red' : ''
                        }`}
                      >
                        {dayNumber(day.date)}
                      </span>
                      <span className="calendar-cell__hijri">{hijriLabel(day.date)}</span>
                    </div>
                    <div className="calendar-cell__markers">
                      {visible.map((event) => (
                        <span
                          key={`${event.type}-${event.id}`}
                          className="calendar-marker"
                          style={{ backgroundColor: event.color }}
                          title={event.title}
                        />
                      ))}
                      {overflow > 0 && <span className="calendar-marker-more">+{overflow}</span>}
                    </div>
                  </button>
                )
              })}
            </div>
            )}

            {canGrid && (
            <div className="calendar-legend">
              {data.legend.length === 0 ? (
                <p className="muted">Belum ada kategori kegiatan aktif.</p>
              ) : (
                data.legend.map((item) => (
                  <div key={item.id} className="calendar-legend__item">
                    <span className="calendar-legend__swatch" style={{ backgroundColor: item.color }} />
                    <span>{item.nama}</span>
                  </div>
                ))
              )}
            </div>
            )}

            {canHariLibur && (
            <section className="calendar-holidays">
              <h3>Hari libur bulan ini</h3>
              {data.holidays.length === 0 ? (
                <p className="muted">Tidak ada tanggal merah pada bulan ini.</p>
              ) : (
                <ul className="calendar-holidays__list">
                  {data.holidays.map((item) => (
                    <li key={item.id} className="calendar-holidays__item">
                      <span className="calendar-holidays__date">
                        {dayNumber(item.tanggal)} {MONTHS[month - 1]}
                      </span>
                      <span className="calendar-holidays__name">{item.nama}</span>
                      <span className="muted"> ({item.jenis})</span>
                      <span className="muted"> · Hijri {hijriLabel(item.tanggal)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            )}
          </>
        )}
      </div>

      {!loading && data && canDetailHari && (
        <section className="calendar-day-detail form-panel">
          <h3>
            {selectedDay
              ? new Date(`${selectedDay.date}T12:00:00`).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : 'Pilih tanggal'}
          </h3>
          {selectedDay && (
            <p className="muted">
              Hijriyah: {hijriLabel(selectedDay.date) || '—'}
              {selectedDay.holiday ? ` · Libur: ${selectedDay.holiday.nama}` : ''}
            </p>
          )}
          {selectedDay && selectedDay.events.length === 0 && (
            <p className="empty-state">Tidak ada kegiatan/pengajian pada tanggal ini.</p>
          )}
          {selectedDay && selectedDay.events.length > 0 && (
            <ul className="calendar-event-list">
              {selectedDay.events.map((event) => (
                <li key={`${event.type}-${event.id}`} className="calendar-event-list__item">
                  <span className="calendar-legend__swatch" style={{ backgroundColor: event.color }} />
                  <div>
                    <div>
                      <strong>{event.title}</strong>
                      <span className="muted"> · {event.type}</span>
                    </div>
                    <div className="muted">
                      {[event.time_label, event.kategori_nama, event.status].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <Link to={eventLink(event)} className="btn btn--secondary btn--small">
                    Detail
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  )
}
