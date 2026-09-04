/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 21:15:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 21:15:00
 */

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))

type TimeInput24Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function parseTime(value: string): { hour: string; minute: string } {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim())
  if (!match) {
    return { hour: '', minute: '' }
  }

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return { hour: '', minute: '' }
  }

  return { hour: match[1], minute: match[2] }
}

export function TimeInput24({ id, value, onChange, disabled = false }: TimeInput24Props) {
  const { hour, minute } = parseTime(value)
  const baseId = id ?? 'time-24'

  function emit(nextHour: string, nextMinute: string) {
    if (!nextHour && !nextMinute) {
      onChange('')
      return
    }

    onChange(`${nextHour || '00'}:${nextMinute || '00'}`)
  }

  return (
    <div className="time-input-24" id={id}>
      <select
        id={`${baseId}-hour`}
        className="time-input-24__part"
        value={hour}
        disabled={disabled}
        aria-label="Jam (24 jam)"
        onChange={(event) => emit(event.target.value, minute)}
      >
        <option value="">—</option>
        {HOUR_OPTIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <span className="time-input-24__sep" aria-hidden="true">
        :
      </span>
      <select
        id={`${baseId}-minute`}
        className="time-input-24__part"
        value={minute}
        disabled={disabled}
        aria-label="Menit"
        onChange={(event) => emit(hour, event.target.value)}
      >
        <option value="">—</option>
        {MINUTE_OPTIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}
