/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-08 18:46:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-08 19:00:00
 */
import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { dashboardService } from '../api/services'
import type { AbsensiOverviewPeriod } from '../api/types'
import { SimpleColumnChart } from './Charts'
import { DateField } from './DateField'

type PeriodKey = 'week' | 'month' | 'year' | 'custom'

function localDateIso(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function daysAgoIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return localDateIso(date)
}

export function AbsensiOverviewCard({
  week,
  month,
  year,
}: {
  week: AbsensiOverviewPeriod
  month: AbsensiOverviewPeriod
  year: AbsensiOverviewPeriod
}) {
  const [period, setPeriod] = useState<PeriodKey>('week')
  const [customFrom, setCustomFrom] = useState(daysAgoIso(29))
  const [customTo, setCustomTo] = useState(localDateIso())
  const [customData, setCustomData] = useState<AbsensiOverviewPeriod | null>(null)
  const [customLoading, setCustomLoading] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)

  const presetActive =
    period === 'week' ? week : period === 'month' ? month : period === 'year' ? year : null

  const active = period === 'custom' ? customData : presetActive

  const periodLabel =
    active?.period_label ??
    (period === 'week'
      ? '7 hari terakhir'
      : period === 'month'
        ? '30 hari terakhir'
        : period === 'year'
          ? '365 hari terakhir'
          : 'Rentang khusus')

  const chartData = useMemo(
    () => (active?.series ?? []).map((item) => ({ label: item.label, value: item.value })),
    [active?.series],
  )

  useEffect(() => {
    if (period !== 'custom') return
    if (!customFrom || !customTo) return
    if (customFrom > customTo) {
      setCustomError('Tanggal mulai tidak boleh setelah tanggal akhir.')
      setCustomData(null)
      return
    }

    let cancelled = false

    async function loadCustom() {
      setCustomLoading(true)
      setCustomError(null)
      try {
        const data = await dashboardService.getAbsensiOverview({
          from: customFrom,
          to: customTo,
        })
        if (!cancelled) setCustomData(data)
      } catch (err) {
        if (!cancelled) {
          setCustomData(null)
          setCustomError(err instanceof ApiError ? err.message : 'Gagal memuat rentang khusus')
        }
      } finally {
        if (!cancelled) setCustomLoading(false)
      }
    }

    void loadCustom()
    return () => {
      cancelled = true
    }
  }, [period, customFrom, customTo])

  return (
    <section className="absensi-overview chart-panel chart-panel--wide" aria-label="Ringkasan absensi">
      <div className="absensi-overview__main">
        <div className="absensi-overview__head">
          <div className="absensi-overview__titles">
            <h2>Ringkasan Absensi</h2>
            <p className="absensi-overview__period-label muted">{periodLabel}</p>
          </div>
          <div className="absensi-overview__toggles" role="tablist" aria-label="Periode absensi">
            {(
              [
                ['week', 'Minggu'],
                ['month', 'Bulan'],
                ['year', 'Tahun'],
                ['custom', 'Custom'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                className={`absensi-overview__toggle${period === key ? ' is-active' : ''}`}
                onClick={() => setPeriod(key)}
                aria-selected={period === key}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="absensi-overview__custom">
            <div className="field">
              <label htmlFor="absensi-from">Dari</label>
              <DateField
                id="absensi-from"
                value={customFrom}
                max={customTo || undefined}
                onChange={setCustomFrom}
              />
            </div>
            <div className="field">
              <label htmlFor="absensi-to">Sampai</label>
              <DateField
                id="absensi-to"
                value={customTo}
                min={customFrom || undefined}
                max={localDateIso()}
                onChange={setCustomTo}
              />
            </div>
          </div>
        )}

        {customError && period === 'custom' && (
          <div className="alert alert--error absensi-overview__alert">{customError}</div>
        )}
        {customLoading && period === 'custom' && (
          <div className="loading-state absensi-overview__loading">Memuat rentang…</div>
        )}

        {!customLoading && active && (
          <SimpleColumnChart
            key={`${period}-${active.from ?? ''}-${active.to ?? ''}-${active.total}`}
            title=""
            data={chartData}
            emptyText="Belum ada absensi pada periode ini."
            yAxisLabel="Jumlah absensi"
            xAxisLabel="Kategori umur"
            denseLabels
            embedded
          />
        )}

        {period === 'custom' && !customLoading && !active && !customError && (
          <p className="empty-state">Pilih rentang tanggal.</p>
        )}
      </div>

      <aside className="absensi-overview__side" key={`side-${period}-${active?.total ?? 'x'}`}>
        <div className="absensi-overview__side-block">
          <h3>Top kategori</h3>
          {!active || active.top.length === 0 ? (
            <p className="muted">Belum ada data.</p>
          ) : (
            <ul className="absensi-overview__top-list">
              {active.top.map((item) => (
                <li key={item.kode} className="absensi-overview__top-item">
                  <span className="absensi-overview__top-label">{item.label}</span>
                  <span
                    className={`absensi-overview__top-delta${
                      item.delta > 0 ? ' is-up' : item.delta < 0 ? ' is-down' : ''
                    }`}
                  >
                    {item.delta > 0 ? '+' : ''}
                    {item.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="absensi-overview__side-block absensi-overview__total">
          <span className="absensi-overview__total-label">Total absensi</span>
          <strong className="absensi-overview__total-value">
            {(active?.total ?? 0).toLocaleString('id-ID')}
          </strong>
          <div
            className="absensi-overview__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={active?.progress_pct ?? 0}
            aria-label="Progress absensi terhadap jamaah aktif"
          >
            <div
              className="absensi-overview__progress-fill"
              style={{ width: `${active?.progress_pct ?? 0}%` }}
            />
          </div>
          <span className="absensi-overview__progress-hint muted">
            {active?.progress_pct ?? 0}% vs jamaah aktif · {periodLabel}
          </span>
        </div>
      </aside>
    </section>
  )
}
