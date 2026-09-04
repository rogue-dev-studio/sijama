/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 14:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:14:00
 */

import { Children, useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { useIsMobileFilterLayout } from '../hooks/useMediaQuery'
import { MenuIcon } from './MenuIcon'
import { MobileFilterDrawer } from './MobileFilterDrawer'

/** Slot filter inline di baris utama (selain kolom Cari + toolbar). */
const MAX_INLINE_PRIMARY = 3

function wrapFilterCells(nodes: ReactNode[], keyPrefix: string) {
  return Children.toArray(nodes)
    .filter(Boolean)
    .map((filter, index) => (
      <div key={`${keyPrefix}-${index}`} className="filter-bar__cell filter-bar__cell--filter">
        {filter}
      </div>
    ))
}

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
  filterDrawerTitle?: string
  toolbarExtra?: ReactNode
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
  filterDrawerTitle = 'Filter',
  toolbarExtra,
}: ListFilterBarProps) {
  const formId = useId()
  const searchId = `${formId}-search`
  const primarySlots = primaryFilters.slice(0, MAX_INLINE_PRIMARY)
  const overflowPrimary = primaryFilters.slice(MAX_INLINE_PRIMARY)
  const hasOverflow = overflowPrimary.length > 0
  const hasSecondary = hasOverflow || Boolean(secondaryContent)
  const hasDrawerFilters = primaryFilters.length > 0 || Boolean(secondaryContent)
  const isMobile = useIsMobileFilterLayout()
  const [secondaryOpen, setSecondaryOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (secondaryActive) {
      setSecondaryOpen(true)
    }
  }, [secondaryActive])

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false)
    }
  }, [isMobile])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    search.onSubmit()
  }

  const drawerFilters = (
    <div className="filter-drawer__fields">
      {primaryFilters.map((filter, index) =>
        filter ? (
          <div key={`drawer-primary-${index}`} className="filter-drawer__field">
            {filter}
          </div>
        ) : null,
      )}
      {secondaryContent ? <div className="filter-drawer__field">{secondaryContent}</div> : null}
    </div>
  )

  return (
    <div className={`filter-bar${isMobile ? ' filter-bar--mobile-drawer' : ''}`}>
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
        {!isMobile &&
          primarySlots.map((filter, index) =>
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
            {toolbarExtra}
            {isMobile && hasDrawerFilters ? (
              <button
                type="button"
                className={`btn btn--secondary btn--icon filter-bar__toggle${
                  drawerOpen || hasActiveFilters ? ' is-active' : ''
                }`}
                aria-expanded={drawerOpen}
                aria-haspopup="dialog"
                aria-label={filterDrawerTitle}
                title={filterDrawerTitle}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon name="list-filter" size={16} />
                {hasActiveFilters ? <span className="filter-bar__badge" aria-hidden /> : null}
              </button>
            ) : null}
            {!isMobile && hasSecondary ? (
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
            ) : null}
          </div>
        </div>
      </div>
      {!isMobile && hasSecondary && secondaryOpen ? (
        <div className="filter-bar__row filter-bar__row--secondary">
          {wrapFilterCells([...overflowPrimary, secondaryContent], 'secondary')}
          <div className="filter-bar__cell filter-bar__cell--toolbar" aria-hidden="true">
            <span className="filter-bar__toolbar-spacer">&nbsp;</span>
          </div>
        </div>
      ) : null}

      {isMobile && hasDrawerFilters ? (
        <MobileFilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={filterDrawerTitle}>
          {drawerFilters}
        </MobileFilterDrawer>
      ) : null}
    </div>
  )
}
