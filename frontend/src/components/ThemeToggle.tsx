/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 13:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 13:10:00
 */

import {
  COLOR_SCHEME_LABELS,
  type ColorSchemePreference,
} from '../lib/colorScheme'
import { useColorScheme } from '../auth/ColorSchemeContext'
import { MenuIcon } from './MenuIcon'

type ThemeToggleProps = {
  onSelect?: () => void
}

function iconForPreference(preference: ColorSchemePreference): string {
  if (preference === 'dark') return 'moon'
  if (preference === 'system') return 'monitor'
  return 'sun'
}

export function ThemeToggle({ onSelect }: ThemeToggleProps) {
  const { preference, setPreference } = useColorScheme()
  const options: ColorSchemePreference[] = ['light', 'dark', 'system']

  return (
    <div className="theme-toggle-menu" role="group" aria-label="Pilih tema tampilan">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="menuitemradio"
          aria-checked={preference === option}
          className={`user-menu__item theme-toggle-menu__item${preference === option ? ' theme-toggle-menu__item--active' : ''}`}
          onClick={() => {
            setPreference(option)
            onSelect?.()
          }}
        >
          <MenuIcon name={iconForPreference(option)} size={14} />
          {COLOR_SCHEME_LABELS[option]}
        </button>
      ))}
    </div>
  )
}
