/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:45:00
 */

type ThemeColorFieldProps = {
  id: string
  label: string
  hint?: string
  value?: string | null
  fallback: string
  disabled?: boolean
  onChange: (value: string | null) => void
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toLowerCase() : null
}

export function ThemeColorField({
  id,
  label,
  hint,
  value,
  fallback,
  disabled = false,
  onChange,
}: ThemeColorFieldProps) {
  const display = value?.trim() || ''
  const pickerValue = normalizeHex(display) ?? fallback

  return (
    <div className="field theme-color-field">
      <label htmlFor={id}>{label}</label>
      <div className="theme-color-field__row">
        <input
          id={id}
          type="color"
          value={pickerValue}
          disabled={disabled}
          onChange={(event) => onChange(normalizeHex(event.target.value))}
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={display}
          disabled={disabled}
          placeholder={fallback}
          onChange={(event) => {
            const next = event.target.value
            onChange(next.trim() ? next : null)
          }}
          onBlur={(event) => {
            const normalized = normalizeHex(event.target.value)
            if (normalized) {
              onChange(normalized)
            } else if (!event.target.value.trim()) {
              onChange(null)
            }
          }}
        />
        {display && (
          <button type="button" className="btn btn--ghost btn--small" disabled={disabled} onClick={() => onChange(null)}>
            Reset
          </button>
        )}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}
