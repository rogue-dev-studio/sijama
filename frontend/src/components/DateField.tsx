/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 18:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 13:15:00
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  DATE_FIELD_MONTHS,
  DATE_FIELD_WEEKDAYS,
  buildDateFieldGrid,
  buildDateFieldYearOptions,
  formatDateFieldLabel,
  isIsoDateInRange,
  localIsoDate,
  parseIsoDate,
} from '../lib/dateField'
import { MenuIcon } from './MenuIcon'

type DateFieldProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  min?: string
  max?: string
  placeholder?: string
  className?: string
  onClear?: () => void
}

type PickerMenu = 'month' | 'year' | null

export function DateField({
  id,
  value,
  onChange,
  disabled = false,
  min,
  max,
  placeholder = 'Pilih tanggal',
  className,
  onClear,
}: DateFieldProps) {
  const fallbackId = useId()
  const fieldId = id ?? fallbackId
  const rootRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pickerMenu, setPickerMenu] = useState<PickerMenu>(null)

  const parsedValue = parseIsoDate(value)
  const initialYear = parsedValue?.year ?? new Date().getFullYear()
  const initialMonth = parsedValue?.month ?? new Date().getMonth() + 1

  const [viewYear, setViewYear] = useState(initialYear)
  const [viewMonth, setViewMonth] = useState(initialMonth)

  useEffect(() => {
    if (!parsedValue) return
    setViewYear(parsedValue.year)
    setViewMonth(parsedValue.month)
  }, [value])

  useEffect(() => {
    if (!open) {
      setPickerMenu(null)
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setPickerMenu(null)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (pickerMenu) {
        setPickerMenu(null)
        return
      }
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, pickerMenu])

  useEffect(() => {
    if (pickerMenu !== 'year' || !yearListRef.current) return
    const list = yearListRef.current
    const selected = list.querySelector<HTMLElement>('[data-selected="true"]')
    if (!selected) return

    const listTop = list.scrollTop
    const listBottom = listTop + list.clientHeight
    const optionTop = selected.offsetTop
    const optionBottom = optionTop + selected.offsetHeight
    const padding = 4

    if (optionTop < listTop + padding) {
      list.scrollTop = Math.max(0, optionTop - padding)
      return
    }

    if (optionBottom > listBottom - padding) {
      list.scrollTop = optionBottom - list.clientHeight + padding
    }
  }, [pickerMenu, viewYear])

  const grid = useMemo(
    () => buildDateFieldGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const yearOptions = useMemo(() => {
    const years = buildDateFieldYearOptions({
      min,
      max,
      currentYear: viewYear,
    })
    if (!years.includes(viewYear)) {
      years.push(viewYear)
      years.sort((a, b) => a - b)
    }
    return years
  }, [min, max, viewYear])

  const displayValue = value ? formatDateFieldLabel(value) : ''

  function shiftMonth(delta: number) {
    const anchor = new Date(viewYear, viewMonth - 1 + delta, 1, 12, 0, 0)
    setViewYear(anchor.getFullYear())
    setViewMonth(anchor.getMonth() + 1)
    setPickerMenu(null)
  }

  function handleMonthChange(nextMonth: number) {
    if (nextMonth < 1 || nextMonth > 12) return
    setViewMonth(nextMonth)
    setPickerMenu(null)
  }

  function handleYearChange(nextYear: number) {
    if (!Number.isInteger(nextYear)) return
    setViewYear(nextYear)
    setPickerMenu(null)
  }

  function selectDate(iso: string) {
    if (!isIsoDateInRange(iso, min, max)) return
    onChange(iso)
    setOpen(false)
    setPickerMenu(null)
  }

  function handleClear() {
    if (onClear) {
      onClear()
    } else {
      onChange('')
    }
    setOpen(false)
    setPickerMenu(null)
  }

  function toggleMenu(menu: Exclude<PickerMenu, null>) {
    setPickerMenu((prev) => (prev === menu ? null : menu))
  }

  return (
    <div ref={rootRef} className={['date-field', className].filter(Boolean).join(' ')}>
      <div className="date-field__control">
        <input
          id={fieldId}
          type="text"
          readOnly
          className="date-field__trigger"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            if (!disabled) setOpen((prev) => !prev)
          }}
        />
        <button
          type="button"
          className="date-field__icon-btn"
          disabled={disabled}
          aria-label="Buka kalender"
          onClick={() => {
            if (!disabled) setOpen((prev) => !prev)
          }}
        >
          <MenuIcon name="calendar" />
        </button>
      </div>

      {open && (
        <div className="date-field__popover" role="dialog" aria-label="Pilih tanggal">
          <div className="date-field__header">
            <button type="button" className="date-field__nav" aria-label="Bulan sebelumnya" onClick={() => shiftMonth(-1)}>
              ‹
            </button>
            <div className="date-field__selectors">
              <div className="date-field__menu date-field__menu--month">
                <button
                  type="button"
                  className={[
                    'date-field__select date-field__select--month',
                    pickerMenu === 'month' ? 'is-open' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label="Pilih bulan"
                  aria-haspopup="listbox"
                  aria-expanded={pickerMenu === 'month'}
                  onClick={() => toggleMenu('month')}
                >
                  {DATE_FIELD_MONTHS[viewMonth - 1]}
                </button>
                {pickerMenu === 'month' && (
                  <div className="date-field__menu-list" role="listbox" aria-label="Bulan">
                    {DATE_FIELD_MONTHS.map((label, index) => {
                      const month = index + 1
                      return (
                        <button
                          key={label}
                          type="button"
                          role="option"
                          aria-selected={month === viewMonth}
                          className={[
                            'date-field__menu-option',
                            month === viewMonth ? 'is-selected' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => handleMonthChange(month)}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="date-field__menu date-field__menu--year">
                <button
                  type="button"
                  className={[
                    'date-field__select date-field__select--year',
                    pickerMenu === 'year' ? 'is-open' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label="Pilih tahun"
                  aria-haspopup="listbox"
                  aria-expanded={pickerMenu === 'year'}
                  onClick={() => toggleMenu('year')}
                >
                  {viewYear}
                </button>
                {pickerMenu === 'year' && (
                  <div
                    ref={yearListRef}
                    className="date-field__menu-list date-field__menu-list--year"
                    role="listbox"
                    aria-label="Tahun"
                  >
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        role="option"
                        aria-selected={year === viewYear}
                        data-selected={year === viewYear ? 'true' : 'false'}
                        className={[
                          'date-field__menu-option',
                          year === viewYear ? 'is-selected' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => handleYearChange(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button type="button" className="date-field__nav" aria-label="Bulan berikutnya" onClick={() => shiftMonth(1)}>
              ›
            </button>
          </div>

          <div className="date-field-picker__weekdays" aria-hidden="true">
            {DATE_FIELD_WEEKDAYS.map((label) => (
              <span
                key={label}
                className={[
                  'date-field-picker__weekday',
                  label === 'Min' ? 'date-field-picker__weekday--sunday' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="date-field-picker__grid">
            {grid.map((cell, index) =>
              cell ? (
                <button
                  key={cell.iso}
                  type="button"
                  className={[
                    'date-field-picker__day',
                    cell.isSunday ? 'date-field-picker__day--sunday' : '',
                    cell.isToday ? 'date-field-picker__day--today' : '',
                    value === cell.iso ? 'date-field-picker__day--selected' : '',
                    !isIsoDateInRange(cell.iso, min, max) ? 'date-field-picker__day--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!isIsoDateInRange(cell.iso, min, max)}
                  onClick={() => selectDate(cell.iso)}
                >
                  {cell.day}
                </button>
              ) : (
                <span key={`empty-${index}`} className="date-field-picker__day date-field-picker__day--empty" />
              ),
            )}
          </div>

          <div className="date-field__footer">
            <button type="button" className="btn btn--ghost btn--small" onClick={handleClear}>
              Clear
            </button>
            {!onClear && (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => selectDate(localIsoDate())}
              >
                Hari ini
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
