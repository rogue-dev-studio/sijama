/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 14:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 14:00:00
 */

const STORAGE_KEY = 'sijama.login_remember_me'

export function readRememberMe(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === '0') return false
    if (stored === '1') return true
  } catch {
    /* ignore */
  }
  return true
}

export function writeRememberMe(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  } catch {
    /* ignore */
  }
}
