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

export type MapsLocationResolvedVia = 'parse' | 'redirect' | 'geocode' | 'place_name' | 'coords'

export type MapsAdmSuggestion = {
  wilayah_adm_negara_id: number | null
  wilayah_adm_provinsi_id: number | null
  wilayah_adm_kabupaten_kota_id: number | null
  wilayah_adm_kecamatan_id: number | null
  wilayah_adm_desa_id: number | null
  labels: {
    wilayah_adm_negara?: string | null
    wilayah_adm_provinsi?: string | null
    wilayah_adm_kabupaten_kota?: string | null
    wilayah_adm_kecamatan?: string | null
    wilayah_adm_desa?: string | null
  }
}

export type MapsLocationResolveResult = MapCoords & {
  resolved_via: MapsLocationResolvedVia
  source_url?: string
  place_name?: string
  place_id?: string
  maps_url?: string
  display_name?: string | null
  alamat?: string | null
  adm?: MapsAdmSuggestion | null
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

/** Precise pin URL — prefers cid / named place; never emits /place//@ that Google empties. */
export function buildGoogleMapsShareUrl(
  lat: number,
  lng: number,
  options?: { name?: string | null; placeId?: string | null; mapsUrl?: string | null },
): string {
  const point = normalizeCoords(lat, lng)
  const name = options?.name?.trim() || ''
  const placeId = options?.placeId?.trim() || ''
  const saved = options?.mapsUrl?.trim() || ''

  if (saved && isStrongGoogleMapsUrl(saved)) {
    return stripMapsTrackingParams(saved)
  }

  if (placeId) {
    const cidUrl = buildGoogleMapsCidUrl(placeId)
    if (cidUrl) return cidUrl
  }

  if (!point) {
    if (name) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    }
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  if (name) {
    const placePath = encodeURIComponent(name)
      .replace(/%20/g, '+')
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
    if (placeId) {
      return `https://www.google.com/maps/place/${placePath}/@${point.lat},${point.lng},17z/data=!3m1!4b1!4m6!3m5!1s${placeId}!8m2!3d${point.lat}!4d${point.lng}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} @ ${point.lat},${point.lng}`)}`
  }

  // Never /maps/place/{lat},{lng}/@… — Google rewrites it to /place//@…
  return `https://www.google.com/maps?q=${encodeURIComponent(`${point.lat},${point.lng}`)}&z=17`
}

export function buildGoogleMapsCidUrl(placeId: string): string | null {
  const id = placeId.trim()
  const hex = id.match(/^0x[0-9a-fA-F]+:(0x[0-9a-fA-F]+)$/i)
  if (hex?.[1]) {
    try {
      const cid = BigInt(hex[1]).toString(10)
      if (cid === '0') return null
      return `https://www.google.com/maps?cid=${cid}`
    } catch {
      return null
    }
  }
  if (/^\d+$/.test(id)) {
    return `https://www.google.com/maps?cid=${id}`
  }
  return null
}

/** Reject URLs Google collapses to /place//@coords. */
export function isWeakGoogleMapsPlaceUrl(url: string): boolean {
  try {
    const path = decodeURIComponent(new URL(url).pathname)
    if (/\/maps\/place\/+@/i.test(path)) return true
    if (/\/maps\/place\/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?\/@/i.test(path)) return true
    return false
  } catch {
    return true
  }
}

export function isStrongGoogleMapsUrl(url: string): boolean {
  if (!/^https?:\/\/(www\.)?google\.[^/]+\/maps/i.test(url)) return false
  if (isWeakGoogleMapsPlaceUrl(url)) return false
  // cid links and search links are strong enough to keep the place title.
  if (/[?&]cid=\d+/i.test(url)) return true
  if (/\/maps\/search\/\?api=1/i.test(url)) return true
  if (/\/maps\/place\/[^/@]+\/@/i.test(url) && !/\/maps\/place\/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?\/@/i.test(url)) {
    return true
  }
  return /\/maps\/place\/[^/]+/i.test(url) && !isWeakGoogleMapsPlaceUrl(url)
}

function stripMapsTrackingParams(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.delete('entry')
    u.searchParams.delete('g_ep')
    const query = u.searchParams.toString()
    return `${u.origin}${u.pathname}${query ? `?${query}` : ''}${u.hash}`
  } catch {
    return url
  }
}

/** Prefer saved /maps/place/… URL; for embed/iframe build from name + place id + coords. */
export function extractMapsPlaceUrl(input: string): string | null {
  const normalized = normalizeMapsInput(input)
  if (!normalized) return null
  const match = normalized.match(/https?:\/\/(www\.)?google\.[^/]+\/maps\/place\/[^?\s]+/i)
  if (!match?.[0]) return null
  if (isWeakGoogleMapsPlaceUrl(match[0])) return null
  return stripMapsTrackingParams(match[0])
}

/** Canonical share URL from place link, embed iframe, or constructed meta. */
export function resolveMapsShareUrl(
  input: string,
  lat?: number | null,
  lng?: number | null,
): string | null {
  const fromPlace = extractMapsPlaceUrl(input)
  if (fromPlace) return fromPlace

  const placeId = extractMapsPlaceId(input)
  const placeName = extractMapsPlaceName(input)
  const parsed = parseGoogleMapsLocation(input)
  const useLat = lat ?? parsed?.lat ?? null
  const useLng = lng ?? parsed?.lng ?? null

  if (useLat == null || useLng == null) {
    if (placeId) {
      const cid = buildGoogleMapsCidUrl(placeId)
      if (cid) return cid
    }
    if (placeName) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`
    }
    return null
  }

  return buildGoogleMapsShareUrl(useLat, useLng, {
    name: placeName,
    placeId,
  })
}

/** Google feature id from Maps / embed (`!1s0x…:0x…`, including `%3A`). */
export function extractMapsPlaceId(input: string): string | null {
  const normalized = normalizeMapsInput(input)
  if (!normalized) return null

  const matches = [...normalized.matchAll(/!1s(0x[0-9a-fA-F]+)(?::|%3A)(0x[0-9a-fA-F]+)/gi)]
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const id = `${matches[i][1].toLowerCase()}:${matches[i][2].toLowerCase()}`
    if (id !== '0x0:0x0') return id
  }

  const cid = normalized.match(/[?&]cid=(\d+)/i)
  if (cid?.[1]) return cid[1]

  return null
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
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  const iframeSrc = raw.match(/<iframe[^>]+src\s*=\s*["']([^"']+)["']/i)
  if (iframeSrc?.[1]) {
    return decodeMapsUrlValue(iframeSrc[1])
  }

  const srcOnly = raw.match(/(?:^|[\s;])src\s*=\s*["'](https?:\/\/[^"']+)["']/i)
  if (srcOnly?.[1]) {
    return decodeMapsUrlValue(srcOnly[1])
  }

  const urlMatch =
    raw.match(/https?:\/\/[^\s"'<>]+/i) ??
    raw.match(/maps\.app\.goo\.gl\/[^\s"'<>]+/i)
  if (urlMatch?.[0]) {
    const value = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`
    return decodeMapsUrlValue(value)
  }

  return raw
}

function decodeMapsUrlValue(value: string): string {
  let decoded = value.trim()
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    // keep raw
  }
  if (decoded.includes('%')) {
    try {
      decoded = decodeURIComponent(decoded)
    } catch {
      // keep once-decoded
    }
  }
  return decoded
}

function decodeMapsLabel(value: string): string {
  let name = value.replace(/\+/g, ' ')
  try {
    name = decodeURIComponent(name)
  } catch {
    // keep
  }
  if (name.includes('%')) {
    try {
      name = decodeURIComponent(name)
    } catch {
      // keep
    }
  }
  return name.trim()
}

function isUsablePlaceLabel(name: string): boolean {
  if (name.length < 2) return false
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(name)) return false
  if (/^-?\d+(\.\d+)?$/.test(name)) return false
  // Embed tails often end with !2sen / !2sid (UI language), not place names.
  if (/^[a-z]{2,3}$/i.test(name)) return false
  return /[\p{L}\p{N}]/u.test(name)
}

/** Extract place label from Maps URL / embed (!2s, !2z base64, /place/Name/, or ?q=Name). */
export function extractMapsPlaceName(input: string): string | null {
  const normalized = normalizeMapsInput(input)
  if (!normalized) return null

  const candidates: string[] = []

  const from2s = [...normalized.matchAll(/!2s([^!&/?]+)/g)]
  for (const match of from2s) {
    const name = decodeMapsLabel(match[1] || '')
    if (isUsablePlaceLabel(name)) candidates.push(name)
  }

  const from2z = [...normalized.matchAll(/!2z([A-Za-z0-9_\-=]+)/g)]
  for (const match of from2z) {
    const name = decodeBase64MapsLabel(match[1] || '')
    if (name && isUsablePlaceLabel(name)) candidates.push(name)
  }

  const fromPlace = normalized.match(/\/maps\/place\/([^/@]+)/i)
  if (fromPlace?.[1]) {
    const name = decodeMapsLabel(fromPlace[1])
    if (isUsablePlaceLabel(name)) candidates.push(name)
  }

  const fromQ = normalized.match(/[?&]q=([^&]+)/i)
  if (fromQ?.[1]) {
    const name = decodeMapsLabel(fromQ[1])
    if (isUsablePlaceLabel(name) && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?/.test(name)) {
      candidates.push(name)
    }
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.length - a.length)
  return candidates[0]
}

function decodeBase64MapsLabel(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const padded = trimmed.replace(/-/g, '+').replace(/_/g, '/')
    const mod = padded.length % 4
    const withPad = mod === 0 ? padded : padded + '='.repeat(4 - mod)
    const decoded = atob(withPad)
    // handle utf-8
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0))
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes).trim()
    return text || null
  } catch {
    return null
  }
}

/** Place marker pin from Google data params (!3d lat !4d lng). Prefer last match. */
function parsePlacePin(normalized: string): MapCoords | null {
  const matches = [...normalized.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)]
  if (matches.length === 0) return null
  const last = matches[matches.length - 1]
  return asCoords(toFiniteNumber(last[1]), toFiniteNumber(last[2]))
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

  // Embed camera (!2d lng !3d lat) when place pin absent.
  const embed23 = normalized.match(/!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/)
  if (embed23) {
    const embedCoords = asCoords(toFiniteNumber(embed23[2]), toFiniteNumber(embed23[1]))
    if (
      embedCoords &&
      (/\/maps\/embed/i.test(normalized) ||
        extractMapsPlaceId(normalized) != null ||
        /output=embed/i.test(normalized))
    ) {
      return embedCoords
    }
  }

  // If place name exists, skip camera center — caller should geocode the name.
  if (extractMapsPlaceName(normalized)) {
    return null
  }

  const at = normalized.match(/@(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  if (at) {
    return asCoords(toFiniteNumber(at[1]), toFiniteNumber(at[2]))
  }

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
  coords: 'dari titik peta',
}

export function formatResolveHint(result: MapsLocationResolveResult): string {
  const via = RESOLVE_VIA_LABEL[result.resolved_via]
  const place = result.place_name ? ` (${result.place_name})` : ''
  return `Titik siap diterapkan ${via}${place}: ${result.lat}, ${result.lng}`
}

export function formatAdmLabels(adm: MapsAdmSuggestion | null | undefined): string | null {
  if (!adm?.labels) return null
  const parts = [
    adm.labels.wilayah_adm_negara,
    adm.labels.wilayah_adm_provinsi,
    adm.labels.wilayah_adm_kabupaten_kota,
    adm.labels.wilayah_adm_kecamatan,
    adm.labels.wilayah_adm_desa,
  ].filter((value): value is string => Boolean(value && value.trim()))
  return parts.length > 0 ? parts.join(' · ') : null
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
