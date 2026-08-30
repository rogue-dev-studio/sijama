/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 15:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 15:10:00
 */

import type { DokumenHeaderStyle } from '../api/types'

export type DokumenSignAlign = 'left' | 'center' | 'right'
export type DokumenSignMetaLayout = 'inline' | 'stack'
export type DokumenSignMetaOrder = 'name_first' | 'phone_first'

export type SignBlockMetaInput = {
  showName: boolean
  showPhone: boolean
  name: string | null
  phone: string | null
  layout: DokumenSignMetaLayout
  order: DokumenSignMetaOrder
}

export function buildSignMetaLines(input: SignBlockMetaInput): string[] {
  const ordered: Array<'name' | 'phone'> =
    input.order === 'name_first' ? ['name', 'phone'] : ['phone', 'name']

  return ordered
    .filter((key) => (key === 'name' ? input.showName : input.showPhone))
    .map((key) => (key === 'name' ? input.name : input.phone))
    .filter((value): value is string => Boolean(value?.trim()))
}

export function buildSignMetaHtml(
  lines: string[],
  layout: DokumenSignMetaLayout,
  escapeHtml: (value: string) => string,
): string {
  if (lines.length === 0) {
    return ''
  }

  if (layout === 'inline') {
    return `<p class="doc-sign-block__meta doc-sign-block__meta--inline">${lines.map((line) => escapeHtml(line)).join(' · ')}</p>`
  }

  return lines
    .map((line) => `<p class="doc-sign-block__meta">${escapeHtml(line)}</p>`)
    .join('\n  ')
}

export function resolveSignBlockStyle(style: Pick<
  DokumenHeaderStyle,
  'sign_block_position' | 'sign_content_align' | 'sign_meta_layout' | 'sign_meta_order'
>): {
  blockPosition: DokumenSignAlign
  contentAlign: DokumenSignAlign
  layout: DokumenSignMetaLayout
  order: DokumenSignMetaOrder
} {
  return {
    blockPosition: style.sign_block_position,
    contentAlign: style.sign_content_align,
    layout: style.sign_meta_layout,
    order: style.sign_meta_order,
  }
}
