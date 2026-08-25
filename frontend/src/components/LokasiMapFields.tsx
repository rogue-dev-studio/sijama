/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 13:59:25
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:50:00
 */

import { useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { ApiError } from '../api/client'
import { masterLokasiService } from '../api/services'
import {
  buildGoogleMapsShareUrl,
  copyText,
  extractMapsPlaceName,
  formatResolveHint,
  isValidCoords,
  looksLikeAutoResolvablePaste,
  normalizeCoords,
  parseGoogleMapsLocation,
  roundCoord,
} from '../lib/googleMaps'
import { LokasiMapPicker } from './LokasiMapPicker'

type Props = {
  lat: number | null | undefined
  lng: number | null | undefined
  onChange: (next: { lat: number | null; lng: number | null }) => void
}

export function LokasiMapFields({ lat, lng, onChange }: Props) {
  const [mapsInput, setMapsInput] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [resolveLoading, setResolveLoading] = useState(false)
  const resolveSeq = useRef(0)

  const hasPoint = isValidCoords(lat, lng)
  const shareUrl = hasPoint ? buildGoogleMapsShareUrl(lat as number, lng as number) : null

  useEffect(() => {
    return () => {
      resolveSeq.current += 1
    }
  }, [])

  function applyCoords(nextLat: number, nextLng: number, message: string) {
    const point = normalizeCoords(nextLat, nextLng)
    if (!point) {
      setError('Koordinat tidak valid.')
      return
    }
    onChange(point)
    setHint(message)
    setError(null)
  }

  function setLat(value: string) {
    const next = value.trim() === '' ? null : Number(value)
    onChange({
      lat: next != null && Number.isFinite(next) ? roundCoord(next) : null,
      lng: lng ?? null,
    })
    setHint(null)
    setError(null)
  }

  function setLng(value: string) {
    const next = value.trim() === '' ? null : Number(value)
    onChange({
      lat: lat ?? null,
      lng: next != null && Number.isFinite(next) ? roundCoord(next) : null,
    })
    setHint(null)
    setError(null)
  }

  async function resolveInput(raw: string, options?: { silentEmpty?: boolean }) {
    const trimmed = raw.trim()
    if (!trimmed) {
      if (!options?.silentEmpty) {
        setError('Tempel tautan Google Maps, kode iframe, koordinat, atau alamat lengkap.')
      }
      return
    }

    setError(null)
    setHint(null)

    const parsed = parseGoogleMapsLocation(trimmed)
    if (parsed) {
      applyCoords(parsed.lat, parsed.lng, `Titik diterapkan: ${parsed.lat}, ${parsed.lng}`)
      return
    }

    const placeName = extractMapsPlaceName(trimmed)
    const seq = ++resolveSeq.current
    setResolveLoading(true)
    try {
      const result = await masterLokasiService.resolveLocation(trimmed)
      if (seq !== resolveSeq.current) return
      applyCoords(result.lat, result.lng, formatResolveHint(result))
    } catch (err) {
      if (seq !== resolveSeq.current) return
      setError(
        err instanceof ApiError
          ? err.message
          : placeName
            ? `Tidak menemukan koordinat untuk “${placeName}”. Coba cari nama tempat di peta.`
            : 'Tidak menemukan koordinat. Coba tautan/iframe/koordinat/alamat yang lebih spesifik.',
      )
    } finally {
      if (seq === resolveSeq.current) setResolveLoading(false)
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = event.clipboardData.getData('text')
    if (!pasted || !looksLikeAutoResolvablePaste(pasted)) return

    // Let the paste update the textarea, then auto-resolve.
    window.setTimeout(() => {
      setMapsInput(pasted)
      void resolveInput(pasted)
    }, 0)
  }

  function clearPoint() {
    onChange({ lat: null, lng: null })
    setMapsInput('')
    setHint(null)
    setError(null)
  }

  function useDeviceLocation() {
    setError(null)
    setHint(null)
    if (!navigator.geolocation) {
      setError('Peramban tidak mendukung geolokasi.')
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyCoords(
          pos.coords.latitude,
          pos.coords.longitude,
          'Koordinat diambil dari lokasi perangkat.',
        )
        setGeoLoading(false)
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Izinkan akses lokasi di peramban.'
            : 'Gagal membaca lokasi perangkat.',
        )
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  async function handleCopyShare() {
    if (!shareUrl) return
    const ok = await copyText(shareUrl)
    setHint(ok ? 'Tautan Google Maps disalin.' : 'Gagal menyalin. Salin manual dari tautan di bawah.')
  }

  function handleMapPick(coords: { lat: number; lng: number }, meta?: { label?: string }) {
    const label = meta?.label ? ` (${meta.label})` : ''
    applyCoords(
      coords.lat,
      coords.lng,
      `Titik dipilih di peta${label}: ${roundCoord(coords.lat)}, ${roundCoord(coords.lng)}`,
    )
  }

  return (
    <section className="lokasi-map" aria-labelledby="lokasi-map-heading">
      <div className="lokasi-map__intro">
        <h2 id="lokasi-map-heading">Titik peta & share Google Maps</h2>
        <p>
          Cari nama tempat di peta, klik/geser penanda, atau tempel tautan/iframe Google Maps (otomatis
          diterapkan).
        </p>
      </div>

      <LokasiMapPicker lat={lat} lng={lng} onPick={handleMapPick} />

      <div className="form-grid form-grid--2">
        <div className="field">
          <label htmlFor="lat">Latitude</label>
          <input
            id="lat"
            type="number"
            step="any"
            min={-90}
            max={90}
            inputMode="decimal"
            placeholder="-6.200000"
            value={lat ?? ''}
            onChange={(event) => setLat(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lng">Longitude</label>
          <input
            id="lng"
            type="number"
            step="any"
            min={-180}
            max={180}
            inputMode="decimal"
            placeholder="106.816666"
            value={lng ?? ''}
            onChange={(event) => setLng(event.target.value)}
          />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="maps_input">Tempel dari Google Maps (opsional)</label>
          <textarea
            id="maps_input"
            rows={4}
            placeholder="Tempel link pendek / iframe / place URL / alamat — otomatis diterapkan saat tempel"
            value={mapsInput}
            onChange={(event) => setMapsInput(event.target.value)}
            onPaste={handlePaste}
          />
          <p className="field-hint">
            Saat tempel, titik diterapkan otomatis. Prioritas: pin tempat Google (`!3d/!4d`), bukan pusat
            kamera peta.
          </p>
        </div>
      </div>

      <div className="lokasi-map__actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => void resolveInput(mapsInput)}
          disabled={resolveLoading}
        >
          {resolveLoading ? 'Memproses…' : 'Terapkan dari tempelan'}
        </button>
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={useDeviceLocation}
          disabled={geoLoading || resolveLoading}
        >
          {geoLoading ? 'Mengambil lokasi…' : 'Gunakan lokasi perangkat'}
        </button>
        {(lat != null || lng != null) && (
          <button type="button" className="btn btn--secondary btn--small" onClick={clearPoint}>
            Hapus titik
          </button>
        )}
        {shareUrl && (
          <>
            <a
              className="btn btn--secondary btn--small"
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Buka di Google Maps
            </a>
            <button type="button" className="btn btn--primary btn--small" onClick={() => void handleCopyShare()}>
              Salin tautan share
            </button>
          </>
        )}
      </div>

      {error && <p className="field-hint field-hint--error">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}

      {shareUrl && (
        <p className="lokasi-map__share-url">
          <span>Tautan share:</span>{' '}
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            {shareUrl}
          </a>
        </p>
      )}
    </section>
  )
}
