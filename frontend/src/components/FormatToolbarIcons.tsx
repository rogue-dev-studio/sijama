/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-30 14:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-30 14:45:00
 */

import type { ReactNode } from 'react'

type IconProps = {
  className?: string
}

function IconBase({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function IconAlignLeft({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M3 5h18v2H3V5zm0 5h12v2H3v-2zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"
      />
    </IconBase>
  )
}

export function IconAlignCenter({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M3 5h18v2H3V5zm3 5h12v2H6v-2zm-3 5h18v2H3v-2zm3 5h12v2H6v-2z"
      />
    </IconBase>
  )
}

export function IconAlignRight({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M3 5h18v2H3V5zm6 5h12v2H9v-2zm-6 5h18v2H3v-2zm6 5h12v2H9v-2z"
      />
    </IconBase>
  )
}

export function IconAlignJustify({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M3 5h18v2H3V5zm0 5h18v2H3v-2zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
      />
    </IconBase>
  )
}

export function IconBold({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M8 5h5.5a3.5 3.5 0 0 1 0 7H8V5zm0 9h6.5a3.5 3.5 0 0 1 0 7H8v-7z"
      />
    </IconBase>
  )
}

export function IconItalic({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path fill="currentColor" d="M10 5h9v2h-3.2l-3.6 10H16v2H7v-2h3.2l3.6-10H10V5z" />
    </IconBase>
  )
}

export function IconUnderline({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M7 5v6a5 5 0 0 0 10 0V5h2v6a7 7 0 0 1-14 0V5h2zm-2 14h16v2H5v-2z"
      />
    </IconBase>
  )
}

export function IconStrikethrough({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M7 5h10v2h-4.1c1.7.4 3.1 1.6 3.1 3.5 0 1.9-1.4 3.1-3.1 3.5H17v2H7v-2h4.1c-1.7-.4-3.1-1.6-3.1-3.5 0-.4.1-.8.2-1.1H5.1C5 10.2 5 9.6 5 9c0-3.3 2.7-6 6-6zm10 12H7v2h10v-2z"
      />
    </IconBase>
  )
}

export function IconLineSpacing({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M8 4h2v16H8V4zm6 3h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zM11 7l-2 2 2 2V7zm0 10v4l-2-2 2-2z"
      />
    </IconBase>
  )
}

export function IconLetterSpacing({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M4 8h2v8H4V8zm14 0h2v8h-2V8zM9 10h6v1H9v-1zm0 3h6v1H9v-1z"
      />
    </IconBase>
  )
}

export function IconTextCase({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        fill="currentColor"
        d="M4 18h4v-2H6.4L9 8h2l2.6 8H12v2h4v-2h-1.4L12.5 6h-3L5.4 16H4v2z"
      />
    </IconBase>
  )
}
