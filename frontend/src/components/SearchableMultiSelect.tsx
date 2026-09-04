/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 20:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 20:05:00
 */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

export type SearchableMultiSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SearchableMultiSelectProps = {
  id?: string
  values: string[]
  options: SearchableMultiSelectOption[]
  placeholder?: string
  disabled?: boolean
  onChange: (values: string[]) => void
  className?: string
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

export function SearchableMultiSelect({
  id,
  values,
  options,
  placeholder = 'Pilih…',
  disabled = false,
  onChange,
  className = '',
}: SearchableMultiSelectProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const listboxId = `${controlId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const selectedLabels = useMemo(() => {
    const labelMap = new Map(options.map((item) => [item.value, item.label]))
    return values
      .map((value) => labelMap.get(value))
      .filter((label): label is string => Boolean(label))
  }, [options, values])

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return options
    return options.filter((item) => normalize(item.label).includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    setHighlight(0)
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value))
      return
    }
    onChange([...values, value])
  }

  function openMenu() {
    if (disabled) return
    setOpen(true)
    setQuery('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openMenu()
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setQuery('')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((prev) => Math.max(prev - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const item = filtered[highlight]
      if (item && !item.disabled) {
        toggle(item.value)
      }
    }
  }

  const triggerLabel =
    selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder

  return (
    <div
      ref={rootRef}
      className={`search-select search-select--multi ${open ? 'search-select--open' : ''} ${className}`.trim()}
    >
      <button
        type="button"
        id={controlId}
        className="search-select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? (setOpen(false), setQuery('')) : openMenu())}
      >
        <span className={selectedLabels.length > 0 ? 'search-select__value' : 'search-select__placeholder'}>
          {triggerLabel}
        </span>
        <span className="search-select__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="search-select__panel">
          <input
            ref={inputRef}
            type="search"
            className="search-select__search"
            value={query}
            placeholder="Cari…"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={
              filtered[highlight] ? `${controlId}-opt-${filtered[highlight].value}` : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value)
              setHighlight(0)
            }}
            onKeyDown={onKeyDown}
          />
          <ul id={listboxId} className="search-select__list" role="listbox" aria-multiselectable="true">
            {filtered.length === 0 && (
              <li className="search-select__empty" role="presentation">
                Tidak ada hasil
              </li>
            )}
            {filtered.map((item, index) => {
              const isActive = index === highlight
              const isSelected = values.includes(item.value)
              return (
                <li
                  key={item.value || `empty-${index}`}
                  id={`${controlId}-opt-${item.value}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={item.disabled || undefined}
                  className={[
                    'search-select__option',
                    'search-select__option--multi',
                    isActive ? 'search-select__option--active' : '',
                    isSelected ? 'search-select__option--selected' : '',
                    item.disabled ? 'search-select__option--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => setHighlight(index)}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    if (!item.disabled) {
                      toggle(item.value)
                    }
                  }}
                >
                  <span className="search-select__check" aria-hidden="true">
                    {isSelected ? '✓' : ''}
                  </span>
                  {item.label}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
