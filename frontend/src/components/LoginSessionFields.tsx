/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:50:00
 */

type LoginSessionFieldsProps = {
  minutesInput: string
  untilLogout: boolean
  minMinutes: number
  maxMinutes: number
  defaultMinutes?: number
  disabled?: boolean
  idPrefix?: string
  onMinutesInputChange: (value: string) => void
  onUntilLogoutChange: (checked: boolean) => void
}

export function LoginSessionFields({
  minutesInput,
  untilLogout,
  minMinutes,
  maxMinutes,
  defaultMinutes = 1440,
  disabled = false,
  idPrefix = 'login-session',
  onMinutesInputChange,
  onUntilLogoutChange,
}: LoginSessionFieldsProps) {
  const minutesId = `${idPrefix}-minutes`

  return (
    <>
      <div className="field">
        <label htmlFor={minutesId}>Tetap login selama (menit)</label>
        <input
          id={minutesId}
          type="number"
          inputMode="numeric"
          min={minMinutes}
          max={maxMinutes}
          step={1}
          value={minutesInput}
          onChange={(event) => onMinutesInputChange(event.target.value)}
          disabled={disabled || untilLogout}
          placeholder={`Kosong = bawaan ${defaultMinutes} menit (1 hari)`}
          required={false}
        />
        <p className="field-hint">
          Masukkan durasi dalam menit ({minMinutes}–{maxMinutes.toLocaleString('id-ID')}).
        </p>
      </div>
      <div className="field form-grid__full">
        <label className="checkbox-item">
          <input
            type="checkbox"
            checked={untilLogout}
            onChange={(event) => {
              const checked = event.target.checked
              onUntilLogoutChange(checked)
              if (checked) {
                onMinutesInputChange('')
              }
            }}
            disabled={disabled}
          />
          <span>Hingga logout manual (tanpa batas waktu)</span>
        </label>
      </div>
    </>
  )
}
