import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppSettings } from '../auth/AppSettingsContext'
import { buildAppShellBrand } from '../lib/appBrand'
import { useAuth } from '../auth/AuthContext'
import type { MenuNode } from '../api/types'
import { BrandMark } from '../components/BrandMark'
import { DeveloperFooter } from '../components/DeveloperFooter'
import { MenuIcon } from '../components/MenuIcon'
import { UserMenu } from '../components/UserMenu'

const BOTTOM_PATHS = ['/', '/jamaah', '/kegiatan', '/absensi']
const SIDEBAR_COLLAPSED_KEY = 'sijama.sidebar.collapsed'

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
  const location = useLocation()
  const children = node.children ?? []
  const hasChildren = children.length > 0
  const branchActive = nodeIsActive(node, location.pathname)
  const [open, setOpen] = useState(branchActive)

  useEffect(() => {
    if (branchActive) {
      setOpen(true)
    }
  }, [branchActive])

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

function pathIsActive(path: string, pathname: string): boolean {
  return path === pathname || (path !== '/' && pathname.startsWith(`${path}/`))
}

function collectDescendantLinks(
  nodes: MenuNode[],
  depth = 0,
): Array<{ node: MenuNode; depth: number }> {
  const items: Array<{ node: MenuNode; depth: number }> = []
  for (const node of nodes) {
    if (node.path) items.push({ node, depth })
    const children = node.children ?? []
    if (children.length > 0) {
      const nextDepth = node.path ? depth + 1 : depth
      items.push(...collectDescendantLinks(children, nextDepth))
    }
  }
  return items
}

function nodeIsActive(node: MenuNode, pathname: string): boolean {
  if (node.path && pathIsActive(node.path, pathname)) return true
  return collectDescendantLinks(node.children ?? []).some((item) =>
    pathIsActive(item.node.path!, pathname),
  )
}

function computeFlyoutPosition(trigger: HTMLElement): CSSProperties {
  const rect = trigger.getBoundingClientRect()
  const menuWidth = 220
  const gutter = 8
  let left = rect.right + gutter
  if (left + menuWidth > window.innerWidth - gutter) {
    left = Math.max(gutter, rect.left - menuWidth - gutter)
  }
  return {
    position: 'fixed',
    top: Math.min(rect.top, window.innerHeight - 320),
    left,
    minWidth: `${menuWidth}px`,
    maxHeight: 'min(70vh, 24rem)',
    zIndex: 200,
  }
}

function CollapsedNavFlyout({
  node,
  items,
  open,
  menuId,
  onToggle,
  onClose,
  onNavigate,
}: {
  node: MenuNode
  items: Array<{ node: MenuNode; depth: number }>
  open: boolean
  menuId: string
  onToggle: () => void
  onClose: () => void
  onNavigate?: () => void
}) {
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const isActive = nodeIsActive(node, location.pathname)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    if (trigger) setMenuStyle(computeFlyoutPosition(trigger))

    function handlePointer(event: MouseEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (document.getElementById(menuId)?.contains(target)) return
      onClose()
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    function handleLayout() {
      const nextTrigger = triggerRef.current
      if (nextTrigger) setMenuStyle(computeFlyoutPosition(nextTrigger))
    }

    document.addEventListener('click', handlePointer)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('resize', handleLayout)
    window.addEventListener('scroll', handleLayout, true)
    return () => {
      document.removeEventListener('click', handlePointer)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('resize', handleLayout)
      window.removeEventListener('scroll', handleLayout, true)
    }
  }, [open, menuId, onClose])

  const dropdown =
    open && items.length > 0
      ? createPortal(
          <div
            className="sidebar-more__dropdown sidebar-more__dropdown--portal"
            role="menu"
            id={menuId}
            aria-label={node.nama}
            style={menuStyle}
          >
            <p className="sidebar-more__dropdown-head">{node.nama}</p>
            {items.map(({ node: item, depth }) => (
              <NavLink
                key={item.id}
                to={item.path!}
                end={item.path === '/'}
                role="menuitem"
                className={({ isActive }) =>
                  `sidebar-more__item sidebar-more__item--depth-${Math.min(depth, 2)}${
                    isActive ? ' sidebar-more__item--active' : ''
                  }`
                }
                onClick={() => {
                  onClose()
                  onNavigate?.()
                }}
              >
                <MenuIcon name={item.icon} size={14} />
                <span>{item.nama}</span>
              </NavLink>
            ))}
          </div>,
          document.body,
        )
      : null

  return (
    <div className="sidebar-more" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`nav-link nav-link--icon-only sidebar-more__trigger${
          isActive || open ? ' nav-link--active' : ''
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={node.nama}
        title={node.nama}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
      >
        <MenuIcon name={node.icon} className="nav-icon" />
        <span className="nav-link__label">{node.nama}</span>
      </button>
      {dropdown}
    </div>
  )
}

function CollapsedNavItem({
  node,
  open,
  onOpen,
  onClose,
  onNavigate,
}: {
  node: MenuNode
  open: boolean
  onOpen: () => void
  onClose: () => void
  onNavigate?: () => void
}) {
  const menuId = useId()
  const childLinks = useMemo(() => collectDescendantLinks(node.children ?? []), [node.children])
  const hasFlyout = childLinks.length > 0
  const isDirectLink = Boolean(node.path) && !hasFlyout

  if (isDirectLink && node.path) {
    return (
      <NavLink
        to={node.path}
        end={node.path === '/'}
        title={node.nama}
        aria-label={node.nama}
        className={({ isActive }) =>
          `nav-link nav-link--icon-only${isActive ? ' nav-link--active' : ''}`
        }
        onClick={onNavigate}
      >
        <MenuIcon name={node.icon} className="nav-icon" />
        <span className="nav-link__label">{node.nama}</span>
      </NavLink>
    )
  }

  if (!hasFlyout) return null

  const items = node.path
    ? [{ node, depth: 0 }, ...childLinks]
    : childLinks

  return (
    <CollapsedNavFlyout
      node={node}
      items={items}
      open={open}
      menuId={menuId}
      onToggle={() => (open ? onClose() : onOpen())}
      onClose={onClose}
      onNavigate={onNavigate}
    />
  )
}

function CollapsedNavMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { menus } = useAuth()
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <>
      {menus.map((node) => (
        <CollapsedNavItem
          key={node.id}
          node={node}
          open={openId === node.id}
          onOpen={() => setOpenId(node.id)}
          onClose={() => setOpenId(null)}
          onNavigate={() => {
            setOpenId(null)
            onNavigate?.()
          }}
        />
      ))}
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

function BottomNav({ onMore, moreOpen }: { onMore: () => void; moreOpen: boolean }) {
  const { menus } = useAuth()
  const primary = flattenMenuLinks(menus).filter(
    (item) => item.path && BOTTOM_PATHS.includes(item.path),
  )

  const ordered = BOTTOM_PATHS.map((path) =>
    primary.find((item) => item.path === path),
  ).filter(Boolean) as MenuNode[]

  const columnCount = ordered.length + 1

  return (
    <nav
      className="bottom-nav"
      aria-label="Navigasi cepat"
      style={{ '--bottom-nav-cols': String(columnCount) } as CSSProperties}
    >
      {ordered.map((item) => (
        <NavLink
          key={item.id}
          to={item.path!}
          end={item.path === '/'}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
          }
          title={item.nama}
        >
          <MenuIcon name={item.icon} size={18} className="bottom-nav__icon" />
          <span className="bottom-nav__label">{item.nama}</span>
        </NavLink>
      ))}
      <button
        type="button"
        className={`bottom-nav__item${moreOpen ? ' bottom-nav__item--active' : ''}`}
        onClick={onMore}
        aria-expanded={moreOpen}
        aria-haspopup="dialog"
        aria-controls="app-shell-more-menu"
        title="Lainnya"
      >
        <MenuIcon name="menu" size={18} className="bottom-nav__icon" />
        <span className="bottom-nav__label">Lainnya</span>
      </button>
    </nav>
  )
}

export function AppShell() {
  const { settings } = useAppSettings()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreSheetRef = useRef<HTMLDivElement>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)
  const { title: brandName, subtitle: brandTagline } = buildAppShellBrand(settings)
  const brandLogo = settings.path_logoheader

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      /* ignore quota / private mode */
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!moreOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const closeButton = moreSheetRef.current?.querySelector<HTMLButtonElement>('button[data-more-close]')
    closeButton?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [moreOpen])

  return (
    <div className={`app-shell${sidebarCollapsed ? ' app-shell--sidebar-collapsed' : ''}`}>
      <header className="app-shell__mobile-header">
        <Link to="/" className="app-shell__brand">
          <BrandMark src={brandLogo} className="app-shell__brand-mark" alt={brandName} />
          <span className="app-shell__brand-text">{brandName}</span>
        </Link>
        <UserMenu compact iconOnly />
      </header>

      <aside
        className={`app-shell__sidebar${sidebarCollapsed ? ' app-shell__sidebar--collapsed' : ''}`}
        aria-label="Sidebar"
      >
        <div className="app-shell__sidebar-top">
          <Link
            to="/"
            className="app-shell__sidebar-brand"
            title={brandName}
            aria-label={brandName}
          >
            <BrandMark src={brandLogo} alt={brandName} />
            <span className="app-shell__sidebar-brand-text">{brandName}</span>
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
        {!sidebarCollapsed && brandTagline && (
          <p className="app-shell__sidebar-tagline">{brandTagline}</p>
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

      <BottomNav moreOpen={moreOpen} onMore={() => setMoreOpen(true)} />

      {moreOpen && (
        <div
          className="app-shell__more-backdrop"
          role="presentation"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div
          ref={moreSheetRef}
          id="app-shell-more-menu"
          className="app-shell__more-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menu lainnya"
        >
          <div className="app-shell__more-sheet-inner">
            <div className="app-shell__more-sheet-head">
              <strong>Menu</strong>
              <button
                type="button"
                className="btn btn--ghost btn--small"
                data-more-close
                onClick={() => setMoreOpen(false)}
              >
                Tutup
              </button>
            </div>
            <NavMenu onNavigate={() => setMoreOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
