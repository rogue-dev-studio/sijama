/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 13:59:25
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 14:50:00
 */

export type MapCoords = {
  lat: number
  lng: number
}

export type MapsLocationResolvedVia = 'parse' | 'redirect' | 'geocode' | 'place_name'

export type MapsLocationResolveResult = MapCoords & {
  resolved_via: MapsLocationResolvedVia
  source_url?: string
  place_name?: string
}

export type MapsPlaceSearchItem = {
  name: string
  display_name: string
  lat: number
  lng: number
}

const LAT_RANGE = { min: -90, max: 90 }
const LNG_RANGE = { min: -180, max: 180 }
const COORD_DECIMALS = 7

export function isValidCoords(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return false
  return lat >= LAT_RANGE.min && lat <= LAT_RANGE.max && lng >= LNG_RANGE.min && lng <= LNG_RANGE.max
}

export function roundCoord(value: number): number {
  const factor = 10 ** COORD_DECIMALS
  return Math.round(value * factor) / factor
}

export function normalizeCoords(lat: number, lng: number): MapCoords | null {
  if (!isValidCoords(lat, lng)) return null
  return { lat: roundCoord(lat), lng: roundCoord(lng) }
}

/** Precise pin URL — forces marker at exact lat/lng with zoom. */
export function buildGoogleMapsShareUrl(lat: number, lng: number): string {
  const point = normalizeCoords(lat, lng)
  if (!point) return `https://www.google.com/maps?q=${lat},${lng}`
  const q = `${point.lat},${point.lng}`
  return `https://www.google.com/maps/place/${q}/@${q},17z`
}

export function buildGoogleMapsEmbedUrl(lat: number, lng: number, zoom = 17): string {
  const point = normalizeCoords(lat, lng)
  if (!point) return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
  return `https://maps.google.com/maps?q=${point.lat},${point.lng}&ll=${point.lat},${point.lng}&z=${zoom}&output=embed`
}

function toFiniteNumber(value: string): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function asCoords(lat: number | null, lng: number | null): MapCoords | null {
  if (lat == null || lng == null) return null
  return normalizeCoords(lat, lng)
}

/** Normalize iframe HTML, decode entities, extract first URL. */
export function normalizeMapsInput(input: string): string {
  let raw = input.trim()
  raw = raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  const iframeSrc = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)
  if (iframeSrc?.[1]) {
    try {
      return decodeURIComponent(iframeSrc[1])
    } catch {
      return iframeSrc[1]
    }
  }

  const urlMatch =
    raw.match(/https?:\/\/[^\s"'<>]+/i) ??
    raw.match(/maps\.app\.goo\.gl\/[^\s"'<>]+/i)
  if (urlMatch?.[0]) {
    return urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`
  }

  return raw
}

/** Place marker pin from Google data params (!3d lat !4d lng). Prefer last match. */
function parsePlacePin(normalized: string): MapCoords | null {
  const matches = [...normalized.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)]
  if (matches.length === 0) return null
  const last = matches[matches.length - 1]
  return asCoords(toFiniteNumber(last[1]), toFiniteNumber(last[2]))
}

/** Extract place label from Maps URL / embed (!2sName or /place/Name/). */
export function extractMapsPlaceName(input: string): string | null {
  const normalized = normalizeMapsInput(input)
  if (!normalized) return null

  const from2s = normalized.match(/!2s([^!&/?]+)/)
  if (from2s?.[1]) {
    try {
      const name = decodeURIComponent(from2s[1].replace(/\+/g, ' ')).trim()
      if (name.length >= 2) return name
    } catch {
      // ignore
    }
  }

  const fromPlace = normalized.match(/\/maps\/place\/([^/@]+)/i)
  if (fromPlace?.[1]) {
    try {
      const name = decodeURIComponent(fromPlace[1].replace(/\+/g, ' ')).trim()
      if (name.length >= 2 && !/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(name)) return name
    } catch {
      // ignore
    }
  }

  return null
}

/**
 * Parse precise pin from Google Maps URL / iframe / coordinates.
 * Prefer place pin (!3d!4d). Camera center (@ / !2d!3d) only if no place name to geocode.
 */
export function parseGoogleMapsLocation(input: string): MapCoords | null {
  const normalized = normalizeMapsInput(input)
  if (!normalized) return null

  const placePin = parsePlacePin(normalized)
  if (placePin) return placePin

  const plain = normalized.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  if (plain) {
    return asCoords(toFiniteNumber(plain[1]), toFiniteNumber(plain[2]))
  }

  const queryQ = normalized.match(/[?&]q=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i)
  if (queryQ) {
    return asCoords(toFiniteNumber(queryQ[1]), toFiniteNumber(queryQ[2]))
  }

  const ll = normalized.match(/[?&](?:ll|center)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i)
  if (ll) {
    return asCoords(toFiniteNumber(ll[1]), toFiniteNumber(ll[2]))
  }

  // If place name exists, skip camera center — caller should geocode the name.
  if (extractMapsPlaceName(normalized)) {
    return null
  }

  const at = normalized.match(/@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  if (at) {
    return asCoords(toFiniteNumber(at[1]), toFiniteNumber(at[2]))
  }

  const embed23 = normalized.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/)
  if (embed23) {
    return asCoords(toFiniteNumber(embed23[2]), toFiniteNumber(embed23[1]))
  }

  return null
}

export function looksLikeMapsAddress(input: string): boolean {
  const value = normalizeMapsInput(input)
  if (!value || /^https?:\/\//i.test(value)) return false
  if (/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/.test(value)) return false
  return /[a-zA-Z]/.test(value) && value.length >= 8
}

export function looksLikeAutoResolvablePaste(input: string): boolean {
  const value = input.trim()
  if (value.length < 8) return false
  if (/<iframe/i.test(value)) return true
  if (/https?:\/\//i.test(value) || /maps\.app\.goo\.gl/i.test(value)) return true
  if (parseGoogleMapsLocation(value)) return true
  if (looksLikeMapsAddress(value)) return true
  return false
}

const RESOLVE_VIA_LABEL: Record<MapsLocationResolvedVia, string> = {
  parse: 'dari tautan/koordinat',
  redirect: 'dari tautan pendek Google Maps',
  geocode: 'dari alamat',
  place_name: 'dari nama tempat di tautan',
}

export function formatResolveHint(result: MapsLocationResolveResult): string {
  const via = RESOLVE_VIA_LABEL[result.resolved_via]
  const place = result.place_name ? ` (${result.place_name})` : ''
  return `Titik diterapkan ${via}${place}: ${result.lat}, ${result.lng}`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
