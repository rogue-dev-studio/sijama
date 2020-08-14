/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:25:00
 */
import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { kategoriUmurService } from '../api/services'
import type { KategoriUmurSummary } from '../api/types'

export function KategoriUmurPage() {
  const [data, setData] = useState<KategoriUmurSummary | null>(null)
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await kategoriUmurService.summary(
          selected && selected !== 'belum' ? { kategori: selected } : undefined,
        )
        if (active) setData(result)
      } catch (err) {
        if (active) {
          setError(err instanceof ApiError ? err.message : 'Gagal memuat kategori umur')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [selected])

  const activeGroup =
    selected === 'belum'
      ? data?.belum_diklasifikasi
      : data?.kategori.find((item) => item.kode === selected) ?? null

  return (
    <>
      <header className="page-header">
        <h1>Kategori umur</h1>
        <p>
          Klasifikasi otomatis dari tanggal lahir dan status pernikahan (bukan input kategori manual).
        </p>
      </header>

      {error && <div className="alert alert--error">{error}</div>}

      {loading && <div className="loading-state">Memuat kategori umur…</div>}

      {!loading && data && (
        <>
          <section className="dash-panel">
            <div className="kehadiran-panel__head">
              <h2>Ringkasan</h2>
              <p>Total jamaah aktif: {data.total_aktif}</p>
            </div>
            <div className="form-grid form-grid--2" style={{ marginTop: '1rem' }}>
              {data.kategori.map((item) => (
                <button
                  key={item.kode ?? item.nama}
                  type="button"
                  className={`btn ${selected === item.kode ? 'btn--primary' : 'btn--secondary'}`}
                  onClick={() =>
                    setSelected(item.kode && item.kode === selected ? '' : (item.kode ?? ''))
                  }
                >
                  {item.nama} · {item.jumlah}
                  <span className="field-hint" style={{ display: 'block', marginTop: 4 }}>
                    {item.rentang_usia}
                  </span>
                </button>
              ))}
              <button
                type="button"
                className={`btn ${selected === 'belum' ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setSelected(selected === 'belum' ? '' : 'belum')}
              >
                Belum diklasifikasi · {data.belum_diklasifikasi.jumlah}
                <span className="field-hint" style={{ display: 'block', marginTop: 4 }}>
                  Tanggal lahir kosong
                </span>
              </button>
            </div>
          </section>

          <section className="dash-panel" style={{ marginTop: '1rem' }}>
            <div className="kehadiran-panel__head">
              <h2>{activeGroup ? activeGroup.nama : 'Semua kategori'}</h2>
              <p>
                {activeGroup
                  ? `${activeGroup.jumlah} jamaah · ${activeGroup.rentang_usia}`
                  : 'Pilih kategori di atas untuk melihat daftar, atau lihat ringkasan jumlah.'}
              </p>
            </div>

            {activeGroup && activeGroup.items.length === 0 && (
              <div className="empty-state">Tidak ada jamaah di kategori ini.</div>
            )}

            {activeGroup && activeGroup.items.length > 0 && (
              <div className="data-table-wrap" style={{ marginTop: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama</th>
                      <th>Usia</th>
                      <th>Status nikah</th>
                      <th>Tgl lahir</th>
                      <th>Kelompok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeGroup.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="col-no">{index + 1}</td>
                        <td>{item.nama}</td>
                        <td>{item.usia ?? '—'}</td>
                        <td>{item.status_pernikahan_label || '—'}</td>
                        <td>{item.tanggal_lahir || '—'}</td>
                        <td>{item.kelompok?.nama || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!activeGroup && (
              <div className="data-table-wrap" style={{ marginTop: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Grup</th>
                      <th>Kategori</th>
                      <th>Rentang</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.asumsi_rentang.map((item) => {
                      const count =
                        data.kategori.find((row) => row.kode === item.kode)?.jumlah ?? 0
                      return (
                        <tr key={item.kode}>
                          <td>{item.grup}</td>
                          <td>{item.nama}</td>
                          <td>{item.rentang_usia}</td>
                          <td>{count}</td>
                        </tr>
                      )
                    })}
                    <tr>
                      <td>Lainnya</td>
                      <td>Belum diklasifikasi</td>
                      <td>Tanggal lahir kosong</td>
                      <td>{data.belum_diklasifikasi.jumlah}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  )
}
