/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 17:30:00
 */

export type ShareChannel = 'whatsapp' | 'telegram' | 'facebook' | 'email' | 'native'

export type NativeShareResult = 'shared' | 'cancelled' | 'failed'

export const SHARE_CHANNELS: Array<{ id: ShareChannel; label: string }> = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'email', label: 'Email' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'native', label: 'Perangkat' },
]

const FILE_SHARE_CHANNELS = new Set<ShareChannel>(['whatsapp', 'telegram', 'email', 'native'])

export function shareChannelLabel(channel: ShareChannel): string {
  return SHARE_CHANNELS.find((item) => item.id === channel)?.label ?? channel
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function buildTelegramUrl(text: string, url?: string): string {
  const params = new URLSearchParams()
  if (url) params.set('url', url)
  if (text) params.set('text', text)
  return `https://t.me/share/url?${params.toString()}`
}

export function buildFacebookUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

export function buildEmailUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function supportsNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export function normalizeShareFile(file: File): File {
  const type = file.type.split(';')[0]?.trim() || file.type
  if (!type || type === file.type) return file
  return new File([file], file.name, { type, lastModified: file.lastModified })
}

export function supportsNativeFileShare(file: File): boolean {
  if (!supportsNativeShare() || !navigator.canShare) return false
  const normalized = normalizeShareFile(file)
  try {
    return navigator.canShare({ files: [normalized] })
  } catch {
    return false
  }
}

export function shouldPromptNativeFileShare(channel: ShareChannel): boolean {
  return FILE_SHARE_CHANNELS.has(channel)
}

function openChannelWebApp(channel: ShareChannel): void {
  if (channel === 'whatsapp') {
    window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer')
    return
  }
  if (channel === 'telegram') {
    window.open('https://web.telegram.org/', '_blank', 'noopener,noreferrer')
    return
  }
  if (channel === 'email') {
    window.open('mailto:', '_blank', 'noopener,noreferrer')
  }
}

async function copyFileToClipboard(file: File): Promise<boolean> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') return false
  const normalized = normalizeShareFile(file)
  const blob = normalized.slice(0, normalized.size, normalized.type)
  const mimeCandidates = Array.from(
    new Set([normalized.type, 'application/octet-stream'].filter(Boolean)),
  )
  for (const mime of mimeCandidates) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })])
      return true
    } catch {
      // coba mime berikutnya
    }
  }
  return false
}

export async function shareNativeLink(options: {
  title: string
  text?: string
  url: string
}): Promise<NativeShareResult> {
  if (!supportsNativeShare()) return 'failed'
  try {
    await navigator.share({
      title: options.title,
      text: options.text || options.title,
      url: options.url,
    })
    return 'shared'
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return 'cancelled'
    return 'failed'
  }
}

/** Bagikan file lewat menu perangkat — lampiran otomatis di HP / app desktop. */
export async function shareNativeFile(file: File, title: string, text: string): Promise<NativeShareResult> {
  if (!supportsNativeShare()) return 'failed'
  const normalized = normalizeShareFile(file)
  try {
    await navigator.share({ title, text, files: [normalized] })
    return 'shared'
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return 'cancelled'
    return 'failed'
  }
}

/** Desktop fallback: salin file ke clipboard lalu buka app web — tempel sekali (Ctrl+V). */
export async function shareFileViaClipboard(options: {
  channel: ShareChannel
  file: File
}): Promise<boolean> {
  const copied = await copyFileToClipboard(options.file)
  if (!copied) return false
  openChannelWebApp(options.channel)
  return true
}

export async function shareExportFile(options: {
  channel: ShareChannel
  file: File
  title: string
  message: string
}): Promise<'shared' | 'opened' | 'cancelled' | 'needs_gesture'> {
  const { channel, file, title, message } = options
  const normalized = normalizeShareFile(file)

  if (channel === 'facebook') {
    window.open(buildFacebookUrl(window.location.href), '_blank', 'noopener,noreferrer')
    return 'opened'
  }

  if (channel === 'native') {
    const shared = await shareNativeFile(normalized, title, message)
    if (shared === 'shared') return 'shared'
    if (shared === 'cancelled') return 'cancelled'
    return 'needs_gesture'
  }

  if (FILE_SHARE_CHANNELS.has(channel)) {
    return 'needs_gesture'
  }

  return 'needs_gesture'
}

export async function shareLink(options: {
  channel: ShareChannel
  title: string
  url: string
  body?: string
}): Promise<void> {
  const bodyLine = options.body?.trim() || options.title
  const text = `${bodyLine}\n${options.url}`

  if (options.channel === 'native' || supportsNativeShare()) {
    const shared = await shareNativeLink({
      title: options.title,
      text: bodyLine,
      url: options.url,
    })
    if (shared === 'shared' || shared === 'cancelled') return
  }

  switch (options.channel) {
    case 'whatsapp':
      window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer')
      break
    case 'telegram':
      window.open(buildTelegramUrl(bodyLine, options.url), '_blank', 'noopener,noreferrer')
      break
    case 'facebook':
      window.open(buildFacebookUrl(options.url), '_blank', 'noopener,noreferrer')
      break
    case 'email':
      window.location.href = buildEmailUrl(options.title, text)
      break
    case 'native':
      break
  }
}

export function visibleShareChannels(includeNative: boolean): Array<{ id: ShareChannel; label: string }> {
  return SHARE_CHANNELS.filter((channel) => includeNative || channel.id !== 'native')
}
