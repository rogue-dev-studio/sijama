/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:25:00
 */

import { useState, type InputHTMLAttributes } from 'react'
import { MenuIcon } from './MenuIcon'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  leadingIcon?: boolean
}

export function PasswordInput({ leadingIcon = false, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  const wrapperClass = leadingIcon ? 'field-control field-control--password' : 'password-field'

  return (
    <div className={wrapperClass}>
      {leadingIcon && (
        <span className="field-control__icon" aria-hidden>
          <MenuIcon name="lock" size={16} />
        </span>
      )}
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={className}
      />
      <button
        type="button"
        className="field-control__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        aria-pressed={visible}
        disabled={props.disabled}
      >
        <MenuIcon name={visible ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  )
}
