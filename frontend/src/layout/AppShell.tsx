import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { MenuNode } from '../api/types'
import { BrandMark } from '../components/BrandMark'
import { DeveloperFooter } from '../components/DeveloperFooter'
import { MenuIcon } from '../components/MenuIcon'
import { UserMenu } from '../components/UserMenu'

const BOTTOM_PATHS = ['/', '/jamaah', '/pengajian', '/kegiatan', '/absensi']
const SIDEBAR_COLLAPSED_KEY = 'sijama.sidebar.collapsed'
const COLLAPSED_VISIBLE_COUNT = 5

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function flattenMenuLinks(nodes: MenuNode[]): MenuNode[] {
  const links: MenuNode[] = []
  for (const node of nodes) {
    const children = node.children ?? []
    if (node.path) links.push(node)
    if (children.length > 0) links.push(...flattenMenuLinks(children))
  }
  return links
}

function NavBranch({
  node,
  depth,
  onNavigate,
}: {
  node: MenuNode
  depth: number
  onNavigate?: () => void
}) {
  const children = node.children ?? []
  const hasChildren = children.length > 0
  const [open, setOpen] = useState(false)

  if (hasChildren) {
    const visibleChildren = children.filter(
      (child) => Boolean(child.path) || (child.children ?? []).length > 0,
    )

    if (visibleChildren.length > 0) {
      return (
        <div className={`nav-group nav-group--depth-${Math.min(depth, 2)}`}>
          <button
            type="button"
            className="nav-group__toggle"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav-group__toggle-label">
              <MenuIcon name={node.icon} size={14} className="nav-icon" />
              <span>{node.nama}</span>
            </span>
            <span className="nav-group__chevron" aria-hidden>
              {open ? '▾' : '▸'}
            </span>
          </button>
          {open &&
            visibleChildren.map((child) => (
              <NavBranch key={child.id} node={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
        </div>
      )
    }
  }

  // Section tanpa anak (mis. Laporan, Aplikasi) tetap ditampilkan sebagai header.
  if (!node.path) {
    return (
      <div className={`nav-group nav-group--depth-${Math.min(depth, 2)} nav-group--empty`}>
        <div className="nav-group__toggle nav-group__toggle--static" aria-disabled="true">
          <span className="nav-group__toggle-label">
            <MenuIcon name={node.icon} size={14} className="nav-icon" />
            <span>{node.nama}</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <NavLink
      to={node.path}
      end={node.path === '/'}
      className={({ isActive }) =>
        `nav-link nav-link--depth-${Math.min(depth, 3)}${isActive ? ' nav-link--active' : ''}`
      }
      onClick={onNavigate}
    >
      <MenuIcon name={node.icon} className="nav-icon" />
      <span>{node.nama}</span>
    </NavLink>
  )
}

function splitCollapsedMenu(leaves: MenuNode[]) {
  const byPath = new Map(leaves.map((item) => [item.path!, item]))
  const primary = BOTTOM_PATHS.map((path) => byPath.get(path)).filter(Boolean) as MenuNode[]
  const primaryIds = new Set(primary.map((item) => item.id))
  const rest = leaves.filter((item) => !primaryIds.has(item.id))
  const ordered = [...primary, ...rest]
  const visible = ordered.slice(0, COLLAPSED_VISIBLE_COUNT)
  const overflow = ordered.slice(COLLAPSED_VISIBLE_COUNT)
  return { visible, overflow }
}

function CollapsedNavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { menus } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const leaves = useMemo(
    () => flattenMenuLinks(menus).filter((item) => item.path),
    [menus],
  )
  const { visible, overflow } = useMemo(() => splitCollapsedMenu(leaves), [leaves])

  const overflowActive = overflow.some(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/' && location.pathname.startsWith(`${item.path}/`)),
  )

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

  return (
    <>
      {visible.map((item) => (
        <NavLink
          key={item.id}
          to={item.path!}
          end={item.path === '/'}
          title={item.nama}
          aria-label={item.nama}
          className={({ isActive }) =>
            `nav-link nav-link--icon-only${isActive ? ' nav-link--active' : ''}`
          }
          onClick={onNavigate}
        >
          <MenuIcon name={item.icon} className="nav-icon" />
          <span className="nav-link__label">{item.nama}</span>
        </NavLink>
      ))}

      {overflow.length > 0 && (
        <div className="sidebar-more" ref={rootRef}>
          <button
            type="button"
            className={`nav-link nav-link--icon-only sidebar-more__trigger${
              overflowActive || open ? ' nav-link--active' : ''
            }`}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label="Menu lainnya"
            title="Lainnya"
            onClick={() => setOpen((value) => !value)}
          >
            <MenuIcon name="more-horizontal" className="nav-icon" />
            <span className="nav-link__label">Lainnya</span>
          </button>

          {open && (
            <div className="sidebar-more__dropdown" role="menu" id={menuId}>
              {overflow.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path!}
                  end={item.path === '/'}
                  role="menuitem"
                  className={({ isActive }) =>
                    `sidebar-more__item${isActive ? ' sidebar-more__item--active' : ''}`
                  }
                  onClick={() => {
                    setOpen(false)
                    onNavigate?.()
                  }}
                >
                  <MenuIcon name={item.icon} size={14} />
                  <span>{item.nama}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

function NavMenu({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { menus } = useAuth()

  if (collapsed) {
    return <CollapsedNavMenu onNavigate={onNavigate} />
  }

  return (
    <>
      {menus.map((menu) => (
        <NavBranch key={menu.id} node={menu} depth={0} onNavigate={onNavigate} />
      ))}
    </>
  )
}

function BottomNav({ onMore }: { onMore: () => void }) {
  const { menus } = useAuth()
  const primary = flattenMenuLinks(menus).filter(
    (item) => item.path && BOTTOM_PATHS.includes(item.path),
  )

  const ordered = BOTTOM_PATHS.map((path) =>
    primary.find((item) => item.path === path),
  ).filter(Boolean) as MenuNode[]

  return (
    <nav className="bottom-nav" aria-label="Navigasi cepat">
      {ordered.map((item) => (
        <NavLink
          key={item.id}
          to={item.path!}
          end={item.path === '/'}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
          }
        >
          <MenuIcon name={item.icon} size={18} className="bottom-nav__icon" />
          <span className="bottom-nav__label">{item.nama}</span>
        </NavLink>
      ))}
      <button type="button" className="bottom-nav__item" onClick={onMore}>
        <MenuIcon name="menu" size={18} className="bottom-nav__icon" />
        <span className="bottom-nav__label">Lainnya</span>
      </button>
    </nav>
  )
}

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      /* ignore quota / private mode */
    }
  }, [sidebarCollapsed])

  return (
    <div className={`app-shell${sidebarCollapsed ? ' app-shell--sidebar-collapsed' : ''}`}>
      <header className="app-shell__mobile-header">
        <Link to="/" className="app-shell__brand">
          <BrandMark className="app-shell__brand-mark" />
          SIJAMA
        </Link>
        <UserMenu compact />
      </header>

      <aside
        className={`app-shell__sidebar${sidebarCollapsed ? ' app-shell__sidebar--collapsed' : ''}`}
        aria-label="Sidebar"
      >
        <div className="app-shell__sidebar-top">
          <Link
            to="/"
            className="app-shell__sidebar-brand"
            title="SIJAMA"
            aria-label="SIJAMA"
          >
            <BrandMark />
            <span className="app-shell__sidebar-brand-text">SIJAMA</span>
          </Link>
          <button
            type="button"
            className="app-shell__sidebar-toggle"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-pressed={sidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            title={sidebarCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            <MenuIcon
              name={sidebarCollapsed ? 'chevrons-right' : 'chevrons-left'}
              size={16}
            />
          </button>
        </div>
        {!sidebarCollapsed && (
          <p className="app-shell__sidebar-tagline">Sistem Informasi Jamaah</p>
        )}
        <nav aria-label="Menu utama">
          <NavMenu collapsed={sidebarCollapsed} />
        </nav>
        <div className="app-shell__sidebar-footer">
          <UserMenu iconOnly={sidebarCollapsed} />
          {!sidebarCollapsed && (
            <DeveloperFooter compact className="developer-footer--sidebar" />
          )}
        </div>
      </aside>

      <div className="app-shell__main">
        <div className="app-shell__content">
          <Outlet />
        </div>
        <DeveloperFooter className="developer-footer--main" />
      </div>

      <BottomNav onMore={() => setMoreOpen(true)} />

      {moreOpen && (
        <div className="app-shell__more-sheet" role="dialog" aria-modal="true" aria-label="Menu lainnya">
          <div className="app-shell__more-sheet-inner">
            <div className="app-shell__more-sheet-head">
              <strong>Menu</strong>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setMoreOpen(false)}>
                Tutup
              </button>
            </div>
            <div className="app-shell__user app-shell__user--sheet">
              <UserMenu onNavigate={() => setMoreOpen(false)} />
            </div>
            <NavMenu onNavigate={() => setMoreOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
