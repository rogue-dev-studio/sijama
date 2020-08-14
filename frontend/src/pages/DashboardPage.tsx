import { useEffect, useState } from 'react'
import { dashboardService } from '../api/services'
import { AbsensiOverviewCard } from '../components/AbsensiOverviewCard'
import { SimpleBarChart, SimpleColumnChart } from '../components/Charts'
import type { DashboardStats } from '../api/types'

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
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
  }, [])

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

          <section className="dash-charts">
            {stats.absensi_overview?.week && stats.absensi_overview?.month && stats.absensi_overview?.year && (
              <AbsensiOverviewCard
                week={stats.absensi_overview.week}
                month={stats.absensi_overview.month}
                year={stats.absensi_overview.year}
              />
            )}
            <SimpleBarChart
              title="Jamaah per kelompok"
              data={stats.chart_jamaah_per_kelompok}
              emptyText="Belum ada data kelompok."
            />
            <SimpleColumnChart
              title="Kategori umur (jamaah aktif)"
              data={stats.chart_kategori_umur}
              emptyText="Belum ada data kategori umur."
              yAxisLabel="Jumlah jamaah"
              xAxisLabel="Kategori"
              denseLabels
            />
          </section>
        </>
      )}
    </>
  )
}
