import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { MenuIcon } from './MenuIcon'

export type ListFilterBarSearchProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  label?: string
  ariaLabel?: string
}

export type ListFilterBarProps = {
  search: ListFilterBarSearchProps
  primaryFilters?: ReactNode[]
  secondaryContent?: ReactNode
  secondaryActive?: boolean
  hasActiveFilters: boolean
  onReset: () => void
  resetLabel?: string
  moreFiltersLabel?: string
  hideMoreFiltersLabel?: string
}

export function ListFilterBar({
  search,
  primaryFilters = [],
  secondaryContent,
  secondaryActive = false,
  hasActiveFilters,
  onReset,
  resetLabel = 'Reset filter',
  moreFiltersLabel = 'Filter lainnya',
  hideMoreFiltersLabel = 'Sembunyikan',
}: ListFilterBarProps) {
  const formId = useId()
  const searchId = `${formId}-search`
  const hasSecondary = Boolean(secondaryContent)
  const [secondaryOpen, setSecondaryOpen] = useState(false)
  const primarySlots = primaryFilters.slice(0, 3)

  useEffect(() => {
    if (secondaryActive) {
      setSecondaryOpen(true)
    }
  }, [secondaryActive])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    search.onSubmit()
  }

  return (
    <div className="filter-bar">
      <form id={formId} className="filter-bar__form" onSubmit={handleSubmit} />
      <div className="filter-bar__row filter-bar__row--primary">
        <div className="filter-bar__cell filter-bar__cell--search field">
          <label htmlFor={searchId}>{search.label ?? 'Cari'}</label>
          <input
            id={searchId}
            form={formId}
            type="search"
            placeholder={search.placeholder}
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            aria-label={search.ariaLabel ?? search.label ?? 'Cari'}
            enterKeyHint="search"
            autoComplete="off"
          />
        </div>
        {primarySlots.map((filter, index) =>
          filter ? (
            <div key={index} className="filter-bar__cell filter-bar__cell--filter">
              {filter}
            </div>
          ) : null,
        )}
        <div className="filter-bar__cell filter-bar__cell--toolbar">
          <span className="filter-bar__toolbar-spacer" aria-hidden="true">
            &nbsp;
          </span>
          <div className="filter-bar__toolbar">
            <button
              type="submit"
              form={formId}
              className="btn btn--secondary btn--icon"
              aria-label="Cari"
              title="Cari"
            >
              <MenuIcon name="search" size={16} />
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--icon"
              disabled={!hasActiveFilters}
              aria-label={resetLabel}
              title={resetLabel}
              onClick={onReset}
            >
              <MenuIcon name="rotate-ccw" size={16} />
            </button>
            {hasSecondary && (
              <button
                type="button"
                className={`btn btn--secondary btn--icon filter-bar__toggle${secondaryOpen ? ' is-active' : ''}`}
                aria-expanded={secondaryOpen}
                aria-label={secondaryOpen ? hideMoreFiltersLabel : moreFiltersLabel}
                title={secondaryOpen ? hideMoreFiltersLabel : moreFiltersLabel}
                onClick={() => setSecondaryOpen((open) => !open)}
              >
                <MenuIcon name={secondaryOpen ? 'chevron-up' : 'list-filter'} size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      {hasSecondary && secondaryOpen && (
        <div className="filter-bar__row filter-bar__row--secondary">{secondaryContent}</div>
      )}
    </div>
  )
}
