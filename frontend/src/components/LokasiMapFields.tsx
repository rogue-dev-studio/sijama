/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 13:59:25
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 14:42:39
 */

import { useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { ApiError } from '../api/client'
import { masterLokasiService } from '../api/services'
import type { MapsLocationResolveResult } from '../api/types'
import {
  buildGoogleMapsShareUrl,
  copyText,
  extractMapsPlaceId,
  extractMapsPlaceName,
  extractMapsPlaceUrl,
  resolveMapsShareUrl,
  isStrongGoogleMapsUrl,
  formatAdmLabels,
  formatResolveHint,
  isValidCoords,
  looksLikeAutoResolvablePaste,
  normalizeCoords,
  parseGoogleMapsLocation,
  roundCoord,
} from '../lib/googleMaps'
import { LokasiMapPicker } from './LokasiMapPicker'

export type LokasiMapsApplyPayload = {
  lat: number
  lng: number
  place_name?: string | null
  place_id?: string | null
  maps_url?: string | null
  alamat?: string | null
  display_name?: string | null
  adm?: MapsLocationResolveResult['adm']
}

type Props = {
  lat: number | null | undefined
  lng: number | null | undefined
  placeName?: string | null
  mapsPlaceId?: string | null
  mapsUrl?: string | null
  onChange: (next: { lat: number | null; lng: number | null }) => void
  onApplyFromMaps?: (payload: LokasiMapsApplyPayload) => void | Promise<void>
}

type PendingMaps = {
  result: MapsLocationResolveResult
  sourceLabel: string
}

export function LokasiMapFields({
  lat,
  lng,
  placeName,
  mapsPlaceId,
  mapsUrl,
  onChange,
  onApplyFromMaps,
}: Props) {
  const [mapsInput, setMapsInput] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [resolveLoading, setResolveLoading] = useState(false)
  const [pending, setPending] = useState<PendingMaps | null>(null)
  const [lockedShareUrl, setLockedShareUrl] = useState<string | null>(null)
  const resolveSeq = useRef(0)

  const shareLabel = placeName?.trim() || pending?.result.place_name || null
  const sharePlaceId = mapsPlaceId?.trim() || pending?.result.place_id || null
  const shareMapsUrl =
    lockedShareUrl ||
    mapsUrl?.trim() ||
    pending?.result.maps_url ||
    null
  const hasPoint = isValidCoords(lat, lng)
  const shareUrl = hasPoint
    ? buildGoogleMapsShareUrl(lat as number, lng as number, {
        name: shareLabel,
        placeId: sharePlaceId,
        mapsUrl: shareMapsUrl,
      })
    : null

  useEffect(() => {
    return () => {
      resolveSeq.current += 1
    }
  }, [])

  useEffect(() => {
    if (mapsUrl?.trim()) {
      setLockedShareUrl(mapsUrl.trim())
    }
  }, [mapsUrl])

  function applyCoordsOnly(nextLat: number, nextLng: number, message: string) {
    const point = normalizeCoords(nextLat, nextLng)
    if (!point) {
      setError('Koordinat tidak valid.')
      return
    }
    onChange(point)
    setHint(message)
    setError(null)
  }

  async function confirmPending() {
    if (!pending) return
    const { result } = pending
    const point = normalizeCoords(result.lat, result.lng)
    if (!point) {
      setError('Koordinat tidak valid.')
      return
    }

    onChange(point)
    const nextShareUrl = buildGoogleMapsShareUrl(point.lat, point.lng, {
      name: result.place_name || placeName,
      placeId: result.place_id,
      mapsUrl: result.maps_url,
    })
    setLockedShareUrl(nextShareUrl)
    if (onApplyFromMaps) {
      await onApplyFromMaps({
        lat: point.lat,
        lng: point.lng,
        place_name: result.place_name ?? null,
        place_id: result.place_id ?? null,
        maps_url: nextShareUrl,
        alamat: result.alamat ?? result.display_name ?? null,
        display_name: result.display_name ?? null,
        adm: result.adm ?? null,
      })
    }

    setPending(null)
    setHint(formatResolveHint(result))
    setError(null)
  }

  function dismissPending() {
    setPending(null)
    setHint('Penerapan lokasi dari Maps dibatalkan.')
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

  async function presentResolved(result: MapsLocationResolveResult, sourceLabel: string, rawInput?: string) {
    const enriched: MapsLocationResolveResult = { ...result }
    if (rawInput) {
      if (!enriched.place_name) {
        enriched.place_name = extractMapsPlaceName(rawInput) ?? undefined
      }
      if (!enriched.place_id) {
        enriched.place_id = extractMapsPlaceId(rawInput) ?? undefined
      }
      if (!enriched.maps_url) {
        enriched.maps_url =
          extractMapsPlaceUrl(rawInput) ??
          resolveMapsShareUrl(rawInput, enriched.lat, enriched.lng) ??
          undefined
      }
    }
    if (!enriched.place_id && enriched.source_url) {
      enriched.place_id = extractMapsPlaceId(enriched.source_url) ?? undefined
    }
    if (!enriched.place_name && enriched.source_url) {
      enriched.place_name = extractMapsPlaceName(enriched.source_url) ?? undefined
    }
    if (!enriched.maps_url && enriched.source_url) {
      enriched.maps_url =
        extractMapsPlaceUrl(enriched.source_url) ??
        resolveMapsShareUrl(enriched.source_url, enriched.lat, enriched.lng) ??
        undefined
    }
    if (!enriched.maps_url || !isStrongGoogleMapsUrl(enriched.maps_url)) {
      enriched.maps_url = buildGoogleMapsShareUrl(enriched.lat, enriched.lng, {
        name: enriched.place_name,
        placeId: enriched.place_id,
        mapsUrl: enriched.maps_url,
      })
    }
    setPending({ result: enriched, sourceLabel })
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

    const seq = ++resolveSeq.current
    setResolveLoading(true)
    try {
      const isMapsPaste =
        /https?:\/\//i.test(trimmed) || /<iframe/i.test(trimmed) || /maps\.app\.goo\.gl/i.test(trimmed)

      if (isMapsPaste) {
        const result = await masterLokasiService.resolveLocation(trimmed)
        if (seq !== resolveSeq.current) return
        const placeName = result.place_name || extractMapsPlaceName(trimmed)
        await presentResolved(
          result,
          placeName ? `tempat “${placeName}”` : 'tempelan Google Maps',
          trimmed,
        )
        return
      }

      const parsed = parseGoogleMapsLocation(trimmed)
      if (parsed) {
        const result = await masterLokasiService.resolveCoords(parsed.lat, parsed.lng)
        if (seq !== resolveSeq.current) return
        await presentResolved(result, 'tempelan koordinat', trimmed)
        return
      }

      const placeName = extractMapsPlaceName(trimmed)
      const result = await masterLokasiService.resolveLocation(trimmed)
      if (seq !== resolveSeq.current) return
      await presentResolved(
        result,
        placeName ? `tempat “${placeName}”` : 'tempelan Google Maps',
        trimmed,
      )
    } catch (err) {
      if (seq !== resolveSeq.current) return
      const placeName = extractMapsPlaceName(trimmed)
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

    window.setTimeout(() => {
      setMapsInput(pasted)
      void resolveInput(pasted)
    }, 0)
  }

  function clearPoint() {
    onChange({ lat: null, lng: null })
    setMapsInput('')
    setPending(null)
    setLockedShareUrl(null)
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
        void (async () => {
          const seq = ++resolveSeq.current
          setResolveLoading(true)
          try {
            const result = await masterLokasiService.resolveCoords(
              pos.coords.latitude,
              pos.coords.longitude,
            )
            if (seq !== resolveSeq.current) return
            await presentResolved(result, 'lokasi perangkat')
          } catch (err) {
            if (seq !== resolveSeq.current) return
            setError(err instanceof ApiError ? err.message : 'Gagal menyiapkan wilayah dari lokasi perangkat.')
          } finally {
            if (seq === resolveSeq.current) {
              setResolveLoading(false)
              setGeoLoading(false)
            }
          }
        })()
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

  function handleMapPick(
    coords: { lat: number; lng: number },
    meta?: { label?: string; source?: 'click' | 'drag' | 'place' },
  ) {
    if (meta?.source === 'drag') {
      applyCoordsOnly(
        coords.lat,
        coords.lng,
        `Titik digeser: ${roundCoord(coords.lat)}, ${roundCoord(coords.lng)}`,
      )
      return
    }

    const sourceLabel =
      meta?.source === 'place'
        ? meta.label
          ? `pencarian “${meta.label}”`
          : 'hasil pencarian peta'
        : 'klik di peta'

    void (async () => {
      const seq = ++resolveSeq.current
      setResolveLoading(true)
      setError(null)
      try {
        const result = await masterLokasiService.resolveCoords(coords.lat, coords.lng)
        if (seq !== resolveSeq.current) return
        if (meta?.label && !result.place_name) {
          result.place_name = meta.label
        }
        await presentResolved(result, sourceLabel)
      } catch (err) {
        if (seq !== resolveSeq.current) return
        setError(err instanceof ApiError ? err.message : 'Gagal menyiapkan wilayah dari titik peta.')
      } finally {
        if (seq === resolveSeq.current) setResolveLoading(false)
      }
    })()
  }

  const pendingAdmLabel = pending ? formatAdmLabels(pending.result.adm) : null

  return (
    <section className="lokasi-map" aria-labelledby="lokasi-map-heading">
      <div className="lokasi-map__intro">
        <h2 id="lokasi-map-heading">Titik peta & share Google Maps</h2>
        <p>
          Cari nama tempat di peta, klik penanda, atau tempel tautan/iframe embed Google Maps. Sebelum
          diterapkan, Anda diminta konfirmasi; negara hingga desa dan tautan share (dengan nama tempat)
          akan diisi otomatis bila dikenali.
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
            placeholder="Tempel link pendek / iframe embed / place URL / alamat — akan diminta konfirmasi sebelum diterapkan"
            value={mapsInput}
            onChange={(event) => setMapsInput(event.target.value)}
            onPaste={handlePaste}
          />
          <p className="field-hint">
            Saat tempel/pilih, sistem menyiapkan titik + wilayah lalu meminta konfirmasi. Geser penanda hanya
            mengubah koordinat tanpa mengisi wilayah.
          </p>
        </div>
      </div>

      {pending && (
        <div className="lokasi-map__confirm" role="region" aria-labelledby="lokasi-map-confirm-title">
          <h3 id="lokasi-map-confirm-title">Konfirmasi lokasi dari Maps?</h3>
          <p>
            Terapkan titik dari {pending.sourceLabel}? Form negara hingga desa akan diisi otomatis jika
            wilayah berhasil dikenali.
          </p>
          <ul className="lokasi-map__confirm-meta">
            <li>
              <strong>Koordinat:</strong> {pending.result.lat}, {pending.result.lng}
            </li>
            {pending.result.place_name && (
              <li>
                <strong>Tempat:</strong> {pending.result.place_name}
              </li>
            )}
            {pending.result.maps_url && (
              <li>
                <strong>Tautan Maps:</strong>{' '}
                <a href={pending.result.maps_url} target="_blank" rel="noopener noreferrer">
                  pratinjau
                </a>
              </li>
            )}
            {pendingAdmLabel && (
              <li>
                <strong>Wilayah:</strong> {pendingAdmLabel}
              </li>
            )}
            {!pendingAdmLabel && (
              <li>
                <strong>Wilayah:</strong> belum dikenali otomatis (koordinat tetap bisa diterapkan)
              </li>
            )}
          </ul>
          <div className="lokasi-map__confirm-actions">
            <button type="button" className="btn btn--primary btn--small" onClick={() => void confirmPending()}>
              Ya, terapkan
            </button>
            <button type="button" className="btn btn--secondary btn--small" onClick={dismissPending}>
              Tidak
            </button>
          </div>
        </div>
      )}

      <div className="lokasi-map__actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => void resolveInput(mapsInput)}
          disabled={resolveLoading}
        >
          {resolveLoading ? 'Memproses…' : 'Siapkan dari tempelan'}
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
