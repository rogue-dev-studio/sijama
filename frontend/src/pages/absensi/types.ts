/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:45:00
 */

export type RefOption = {
  id: number
  label: string
}

export type NotifyKind = 'success' | 'already' | 'unknown' | 'idle' | 'error'

export type NotifyState = {
  kind: NotifyKind
  title: string
  detail: string
}
