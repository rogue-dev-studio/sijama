/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

import type { NotifyState } from './types'

type AbsensiNotifyProps = {
  notify: NotifyState
  className?: string
}

export function AbsensiNotify({ notify, className = '' }: AbsensiNotifyProps) {
  return (
    <div
      className={`absensi-notify absensi-notify--${notify.kind}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="absensi-notify__title">{notify.title}</div>
      <div className="absensi-notify__detail">{notify.detail}</div>
    </div>
  )
}
