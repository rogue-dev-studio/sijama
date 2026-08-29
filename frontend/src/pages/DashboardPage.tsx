/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:40:00
 */
import { useEffect, useState } from 'react'
import { dashboardService } from '../api/services'
import { AbsensiOverviewCard } from '../components/AbsensiOverviewCard'
import { SimpleBarChart, SimpleColumnChart } from '../components/Charts'
import type { DashboardStats } from '../api/types'
import { useAuth } from '../auth/AuthContext'

export function DashboardPage() {
  const { can, permissions } = useAuth()
  const canKpi = can('dashboard.kpi.view')
  const canAbsensiOverview = can('dashboard.absensi_overview.view')
  const canJamaahKelompok = can('dashboard.jamaah_kelompok.view')
  const canKategoriUmur = can('dashboard.kategori_umur.view')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await dashboardService.getStats()
        if (active) setStats(data)
      } catch {
        if (active) setError('Gagal memuat ringkasan dashboard')
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [permissions])

  const showAbsensi =
    canAbsensiOverview &&
    !!stats?.absensi_overview?.week &&
    !!stats.absensi_overview.month &&
    !!stats.absensi_overview.year
  const showJamaahKelompok = canJamaahKelompok && stats?.chart_jamaah_per_kelompok != null
  const showKategoriUmur = canKategoriUmur && stats?.chart_kategori_umur != null
  const showCharts = showAbsensi || showJamaahKelompok || showKategoriUmur

  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Ringkasan aktivitas jamaah dan kegiatan masjid.</p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}
      {loading && <div className="loading-state">Memuat data…</div>}

      {!loading && stats && (
        <>
          {canKpi && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__label">Jamaah aktif</div>
                <div className="stat-card__value">{stats.jamaah_aktif}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Pengajian minggu ini</div>
                <div className="stat-card__value">{stats.pengajian_minggu_ini}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Absensi hari ini</div>
                <div className="stat-card__value">{stats.absensi_hari_ini}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Kegiatan bulan ini</div>
                <div className="stat-card__value">{stats.kegiatan_bulan_ini}</div>
              </div>
            </div>
          )}

          {showCharts && (
            <section className="dash-charts">
              {showAbsensi && stats.absensi_overview && (
                <AbsensiOverviewCard
                  week={stats.absensi_overview.week}
                  month={stats.absensi_overview.month}
                  year={stats.absensi_overview.year}
                />
              )}
              {showJamaahKelompok && stats.chart_jamaah_per_kelompok && (
                <SimpleBarChart
                  title="Jamaah per kelompok"
                  data={stats.chart_jamaah_per_kelompok}
                  emptyText="Belum ada data kelompok."
                />
              )}
              {showKategoriUmur && stats.chart_kategori_umur && (
                <SimpleColumnChart
                  title="Kategori umur (jamaah aktif)"
                  data={stats.chart_kategori_umur}
                  emptyText="Belum ada data kategori umur."
                  yAxisLabel="Jumlah jamaah"
                  xAxisLabel="Kategori"
                  denseLabels
                />
              )}
            </section>
          )}
        </>
      )}
    </>
  )
}
