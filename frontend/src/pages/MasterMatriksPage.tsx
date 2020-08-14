import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { masterMatriksService } from '../api/services'
import { useAuth } from '../auth/AuthContext'
import type { Dapukan, HakAkses } from '../api/types'

export function MasterMatriksPage() {
  const { can } = useAuth()
  const [dapukanList, setDapukanList] = useState<Dapukan[]>([])
  const [hakAksesList, setHakAksesList] = useState<HakAkses[]>([])
  const [selectedDapukanId, setSelectedDapukanId] = useState<number | ''>('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await masterMatriksService.get()
      setDapukanList(data.dapukan)
      setHakAksesList(data.hak_akses)
      if (data.dapukan.length > 0) {
        const first = data.dapukan[0]
        setSelectedDapukanId(first.id)
        setSelectedIds(first.hak_akses_ids ?? [])
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal memuat matriks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const selectedDapukan = useMemo(
    () => dapukanList.find((item) => item.id === selectedDapukanId),
    [dapukanList, selectedDapukanId],
  )

  function handleDapukanChange(id: number) {
    setSelectedDapukanId(id)
    setSuccess(null)
    const dapukan = dapukanList.find((item) => item.id === id)
    setSelectedIds(dapukan?.hak_akses_ids ?? [])
  }

  function toggleHakAkses(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    )
    setSuccess(null)
  }

  async function handleSave() {
    if (!selectedDapukanId) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await masterMatriksService.update(selectedDapukanId, selectedIds)
      setDapukanList((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? { ...item, hak_akses_ids: updated.hak_akses_ids ?? selectedIds }
            : item,
        ),
      )
      setSuccess('Matriks akses berhasil disimpan.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan matriks')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h1>Matriks Hak Akses</h1>
            <p>Atur hak akses per dapukan.</p>
          </div>
        </div>
      </header>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading && <div className="loading-state">Memuat matriks…</div>}

      {!loading && (
        <>
          <div className="form-panel inline-form">
            <div className="field" style={{ maxWidth: '320px' }}>
              <label htmlFor="dapukan_id">Dapukan</label>
              <select
                id="dapukan_id"
                value={selectedDapukanId}
                onChange={(event) => handleDapukanChange(Number(event.target.value))}
              >
                {dapukanList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} ({item.kode})
                  </option>
                ))}
              </select>
            </div>

            {selectedDapukan && (
              <p className="field-hint">
                {selectedDapukan.deskripsi || 'Pilih hak akses yang dimiliki dapukan ini.'}
              </p>
            )}
          </div>

          {hakAksesList.length === 0 ? (
            <div className="empty-state">Belum ada data hak akses.</div>
          ) : (
            <div className="checkbox-grid" style={{ marginTop: '1rem' }}>
              {hakAksesList.map((item) => (
                <label key={item.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleHakAkses(item.id)}
                    disabled={!can('matriks.update')}
                  />
                  <span>
                    {item.nama}
                    <span className="checkbox-item__code">{item.kode}</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {can('matriks.update') && hakAksesList.length > 0 && (
            <div className="form-actions">
              <button
                type="button"
                className="btn btn--primary"
                disabled={saving || !selectedDapukanId}
                onClick={() => void handleSave()}
              >
                {saving ? 'Menyimpan…' : 'Simpan matriks'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
