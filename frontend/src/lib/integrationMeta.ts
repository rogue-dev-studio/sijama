/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:20:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:20:00
 */

export type IntegrationProvider =
  | 'database'
  | 'smtp'
  | 'fonnte'
  | 'telegram'
  | 'n8n'
  | 'api_co_id'

export const INTEGRATION_PROVIDERS: Array<{ value: IntegrationProvider; label: string }> = [
  { value: 'database', label: 'Database' },
  { value: 'smtp', label: 'SMTP / Email' },
  { value: 'fonnte', label: 'Fonnte' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'n8n', label: 'n8n' },
  { value: 'api_co_id', label: 'api.co.id' },
]

export const DB_DRIVER_OPTIONS = [
  { value: 'pgsql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlsrv', label: 'SQL Server' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'other', label: 'Lainnya' },
]

export const INTEGRATION_LOG_MENUS: Array<{
  provider: IntegrationProvider
  path: string
  title: string
  permission: string
  description: string
}> = [
  {
    provider: 'database',
    path: '/aplikasi/log/database',
    title: 'Log Database',
    permission: 'integration_log_database.view',
    description: 'Masa berlaku, maintenance, dan konektivitas database.',
  },
  {
    provider: 'telegram',
    path: '/aplikasi/log/telegram',
    title: 'Log Telegram',
    permission: 'integration_log_telegram.view',
    description: 'Masa berlaku, maintenance, dan konektivitas bot Telegram.',
  },
  {
    provider: 'smtp',
    path: '/aplikasi/log/smtp',
    title: 'Log SMTP',
    permission: 'integration_log_smtp.view',
    description: 'Masa berlaku dan konektivitas host SMTP / mail provider.',
  },
  {
    provider: 'fonnte',
    path: '/aplikasi/log/fonnte',
    title: 'Log Fonnte',
    permission: 'integration_log_fonnte.view',
    description: 'Masa berlaku dan konektivitas endpoint Fonnte.',
  },
  {
    provider: 'n8n',
    path: '/aplikasi/log/n8n',
    title: 'Log n8n',
    permission: 'integration_log_n8n.view',
    description: 'Masa berlaku dan konektivitas instance / webhook n8n.',
  },
  {
    provider: 'api_co_id',
    path: '/aplikasi/log/api-co-id',
    title: 'Log api.co.id',
    permission: 'integration_log_api_co_id.view',
    description: 'Masa berlaku API key dan konektivitas hari libur.',
  },
]

export const INTEGRATION_EVENT_TYPES: Array<{ value: string; label: string }> = [
  { value: 'maintenance', label: 'Maintenance pihak ketiga' },
  { value: 'connectivity_error', label: 'Gangguan koneksi' },
  { value: 'expiry_warning', label: 'Peringatan masa berlaku' },
  { value: 'expiry_expired', label: 'Masa berlaku habis' },
  { value: 'config_note', label: 'Catatan konfigurasi' },
  { value: 'other', label: 'Lainnya' },
]

export function providerLabel(provider: string) {
  return INTEGRATION_PROVIDERS.find((item) => item.value === provider)?.label || provider
}

export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  const until = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(until.getTime())) return null
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.round((until.getTime() - today.getTime()) / 86_400_000)
}

export function validityLabel(isoDate: string | null | undefined): {
  text: string
  tone: 'ok' | 'warn' | 'danger' | 'muted'
} {
  const days = daysUntil(isoDate)
  if (days === null) return { text: 'Masa berlaku belum diisi', tone: 'muted' }
  if (days < 0) return { text: `Habis ${Math.abs(days)} hari lalu`, tone: 'danger' }
  if (days === 0) return { text: 'Berakhir hari ini', tone: 'danger' }
  if (days <= 14) return { text: `Sisa ${days} hari`, tone: 'warn' }
  return { text: `Sisa ${days} hari`, tone: 'ok' }
}

export function formatOccurredAt(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}
