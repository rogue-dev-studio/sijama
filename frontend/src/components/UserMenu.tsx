/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 16:44:59
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 16:44:59
 */

import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isStoredKonfigAsset, resolveKonfigAssetUrl } from '../lib/konfigAsset'
import { MenuIcon } from './MenuIcon'
import { ThemeToggle } from './ThemeToggle'

type UserMenuProps = {
  compact?: boolean
  iconOnly?: boolean
  onNavigate?: () => void
}

export function UserMenu({
  compact = false,
  iconOnly = false,
  onNavigate,
}: UserMenuProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  async function handleLogout() {
    setOpen(false)
    onNavigate?.()
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  const avatarSrc =
    user.foto_path && isStoredKonfigAsset(user.foto_path)
      ? resolveKonfigAssetUrl(user.foto_path)
      : null

  return (
    <div
      className={`user-menu${compact ? ' user-menu--compact' : ''}${iconOnly ? ' user-menu--icon-only' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={iconOnly ? `Menu akun ${user.name}` : undefined}
        title={iconOnly ? `${user.name} (@${user.username})` : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="user-menu__avatar" aria-hidden>
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="user-menu__avatar-image" />
          ) : (
            <MenuIcon name="user" size={compact || iconOnly ? 14 : 16} />
          )}
        </span>
        {!iconOnly && (
          <>
            <span className="user-menu__meta">
              <strong>{user.name}</strong>
              <span className="muted">{user.username}</span>
            </span>
            <span className="user-menu__chevron" aria-hidden>
              {open ? '▴' : '▾'}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu" id={menuId}>
          {iconOnly && (
            <>
              <div className="user-menu__identity" role="presentation">
                <span className="user-menu__avatar user-menu__avatar--lg" aria-hidden>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="user-menu__avatar-image" />
                  ) : (
                    <MenuIcon name="user" size={18} />
                  )}
                </span>
                <span className="user-menu__meta">
                  <strong>{user.name}</strong>
                  <span className="muted">@{user.username}</span>
                </span>
              </div>
              <div className="user-menu__divider" role="separator" />
            </>
          )}
          <ThemeToggle onSelect={() => setOpen(false)} />
          <div className="user-menu__divider" role="separator" />
          <Link
            to="/profil"
            role="menuitem"
            className="user-menu__item"
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
          >
            <MenuIcon name="user" size={14} />
            Profil
          </Link>
          <button
            type="button"
            role="menuitem"
            className="user-menu__item user-menu__item--danger"
            onClick={() => void handleLogout()}
          >
            <MenuIcon name="log-out" size={14} />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
