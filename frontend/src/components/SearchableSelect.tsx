/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-24 11:27:58
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-24 11:27:58
 */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'

export type SearchableSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SearchableSelectProps = {
  id?: string
  name?: string
  value: string
  options: SearchableSelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  'aria-invalid'?: boolean | 'true' | 'false'
  onChange: (value: string) => void
  className?: string
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
}

export function SearchableSelect({
  id,
  name,
  value,
  options,
  placeholder = 'Pilih…',
  disabled = false,
  required = false,
  'aria-invalid': ariaInvalid,
  onChange,
  className = '',
}: SearchableSelectProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const listboxId = `${controlId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const selected = useMemo(
    () => options.find((item) => item.value === value) ?? null,
    [options, value],
  )

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

  function commit(next: string) {
    onChange(next)
    setOpen(false)
    setQuery('')
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
        commit(item.value)
      }
    }
  }

  const invalid =
    ariaInvalid === true || ariaInvalid === 'true'
      ? true
      : ariaInvalid === false || ariaInvalid === 'false'
        ? false
        : undefined

  return (
    <div
      ref={rootRef}
      className={`search-select ${open ? 'search-select--open' : ''} ${className}`.trim()}
      data-required={required ? 'true' : undefined}
    >
      <input
        type="text"
        name={name}
        tabIndex={-1}
        value={value}
        required={required}
        disabled={disabled}
        aria-hidden="true"
        className="search-select__native"
        onChange={() => undefined}
      />
      <button
        type="button"
        id={controlId}
        className="search-select__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={invalid}
        onClick={() => (open ? (setOpen(false), setQuery('')) : openMenu())}
      >
        <span className={selected ? 'search-select__value' : 'search-select__placeholder'}>
          {selected?.label || placeholder}
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
          <ul id={listboxId} className="search-select__list" role="listbox">
            {filtered.length === 0 && (
              <li className="search-select__empty" role="presentation">
                Tidak ada hasil
              </li>
            )}
            {filtered.map((item, index) => {
              const isActive = index === highlight
              const isSelected = item.value === value
              return (
                <li
                  key={item.value || `empty-${index}`}
                  id={`${controlId}-opt-${item.value}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={item.disabled || undefined}
                  className={[
                    'search-select__option',
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
                      commit(item.value)
                    }
                  }}
                >
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
