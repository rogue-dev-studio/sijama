/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 14:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:50:00
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { ApiError } from '../api/client'
import { masterLokasiService } from '../api/services'
import type { MapsPlaceSearchItem } from '../api/types'

const DEFAULT_CENTER: L.LatLngExpression = [-2.5489, 118.0149]
const DEFAULT_ZOOM = 5
const POINT_ZOOM = 17

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

type Props = {
  lat: number | null | undefined
  lng: number | null | undefined
  onPick: (coords: { lat: number; lng: number }, meta?: { label?: string }) => void
}

export function LokasiMapPicker({ lat, lng, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onPickRef = useRef(onPick)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MapsPlaceSearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    map.on('click', (event: L.LeafletMouseEvent) => {
      const next = { lat: event.latlng.lat, lng: event.latlng.lng }
      onPickRef.current(next)
    })

    mapRef.current = map

    const resize = window.setTimeout(() => {
      map.invalidateSize()
    }, 80)

    return () => {
      window.clearTimeout(resize)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
        markerRef.current = null
      }
      return
    }

    const position: L.LatLngExpression = [lat, lng]

    if (!markerRef.current) {
      markerRef.current = L.marker(position, {
        icon: defaultIcon,
        draggable: true,
        autoPan: true,
      })
        .addTo(map)
        .on('dragend', () => {
          const pos = markerRef.current?.getLatLng()
          if (!pos) return
          onPickRef.current({ lat: pos.lat, lng: pos.lng })
        })
      map.setView(position, Math.max(map.getZoom(), POINT_ZOOM))
      return
    }

    const current = markerRef.current.getLatLng()
    const movedFar =
      Math.abs(current.lat - lat) > 0.00005 || Math.abs(current.lng - lng) > 0.00005
    markerRef.current.setLatLng(position)
    if (movedFar) {
      map.setView(position, Math.max(map.getZoom(), POINT_ZOOM))
    }
  }, [lat, lng])

  async function handleSearch() {
    const q = query.trim()
    if (q.length < 2) {
      setSearchError('Ketik minimal 2 karakter nama tempat.')
      return
    }
    setSearching(true)
    setSearchError(null)
    try {
      const result = await masterLokasiService.searchPlaces(q, 6)
      setResults(result.items)
      if (result.items.length === 0) {
        setSearchError('Tidak ada hasil. Coba nama tempat lebih spesifik.')
      }
    } catch (err) {
      setResults([])
      setSearchError(err instanceof ApiError ? err.message : 'Gagal mencari tempat.')
    } finally {
      setSearching(false)
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.stopPropagation()
    void handleSearch()
  }

  function selectPlace(item: MapsPlaceSearchItem) {
    onPick({ lat: item.lat, lng: item.lng }, { label: item.name })
    setResults([])
    setQuery(item.name)
    setSearchError(null)
  }

  return (
    <div className="lokasi-map__picker-wrap">
      <div className="lokasi-map__search" role="search">
        <label htmlFor="lokasi_place_search" className="sr-only">
          Cari nama tempat
        </label>
        <input
          id="lokasi_place_search"
          type="search"
          placeholder="Cari nama tempat (mis. Masjid Baitussolihin Bandung)…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setSearchError(null)
          }}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
        />
        <button
          type="button"
          className="btn btn--secondary btn--small"
          disabled={searching}
          onClick={() => void handleSearch()}
        >
          {searching ? 'Mencari…' : 'Cari'}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="lokasi-map__search-results" role="listbox" aria-label="Hasil pencarian tempat">
          {results.map((item) => (
            <li key={`${item.lat},${item.lng},${item.display_name}`}>
              <button type="button" onClick={() => selectPlace(item)}>
                <strong>{item.name}</strong>
                <span>{item.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchError && <p className="field-hint field-hint--error">{searchError}</p>}

      <div
        ref={containerRef}
        className="lokasi-map__picker"
        role="application"
        aria-label="Peta pemilihan titik lokasi. Klik untuk menandai, geser penanda untuk menyesuaikan."
      />
      <p className="field-hint">
        Cari nama tempat, lalu pilih hasilnya — atau klik/geser penanda di peta. Kata seperti
        “(LDII)” diabaikan otomatis agar hasil lebih akurat.
      </p>
    </div>
  )
}
