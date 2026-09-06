/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 15:14:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 15:22:00
 */

import type { ReactNode } from 'react'
import { DateField } from '../components/DateField'
import { localIsoDate } from './dateField'

/** Label seragam filter rentang tanggal di seluruh aplikasi. */
export const DATE_FROM_LABEL = 'Dari'
export const DATE_TO_LABEL = 'Sampai'

/** Tanggal lokal hari ini (YYYY-MM-DD) untuk default filter Dari/Sampai. */
export function todayIsoDate(date = new Date()) {
  return localIsoDate(date)
}

/** Tambah N hari ke tanggal lokal (YYYY-MM-DD). */
export function addDaysIsoDate(days: number, from = new Date()) {
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  return localIsoDate(next)
}

/** True jika rentang masih default (hari ini → hari ini). */
export function isDefaultDateRange(dateFrom: string, dateTo: string) {
  const today = todayIsoDate()
  return dateFrom === today && dateTo === today
}

/** True jika rentang masih default agenda (hari ini → +N hari). */
export function isDefaultUpcomingDateRange(dateFrom: string, dateTo: string, daysAhead = 90) {
  return dateFrom === todayIsoDate() && dateTo === addDaysIsoDate(daysAhead)
}

export type DateRangeFilterFieldsProps = {
  fromId: string
  toId: string
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

/** Pasangan field Dari / Sampai untuk filter bar. */
export function dateRangeFilterFields({
  fromId,
  toId,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterFieldsProps): ReactNode[] {
  return [
    <div className="field" key={`${fromId}-wrap`}>
      <label htmlFor={fromId}>{DATE_FROM_LABEL}</label>
      <DateField id={fromId} value={dateFrom} onChange={onDateFromChange} max={dateTo || undefined} />
    </div>,
    <div className="field" key={`${toId}-wrap`}>
      <label htmlFor={toId}>{DATE_TO_LABEL}</label>
      <DateField
        id={toId}
        value={dateTo}
        onChange={onDateToChange}
        min={dateFrom || undefined}
      />
    </div>,
  ]
}
