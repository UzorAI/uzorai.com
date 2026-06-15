import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import markUrl from '../brand/uzor-mark.svg'
import LanguagePicker from './LanguagePicker'
import ThemeToggle from './ThemeToggle'
import { useLocale } from '../i18n/LocaleProvider'
import { ROUTES } from '../config/routes'

/*
 * NavMenu — the responsive navigation shell ported from htu.io (EPIC #29
 * Phase C). At or above the breakpoint it is a single horizontal bar (brand +
 * route links + ThemeToggle + LanguagePicker); below it the links collapse
 * behind a hamburger that opens a focus-trapped vertical drawer holding the
 * same items. Supersedes the static Header + Nav.
 */

// Match the htu.io NavMenu breakpoint — the mobile/tablet boundary at which the
// horizontal bar collapses to the hamburger + drawer.
const BREAKPOINT = 768

// Focusable elements inside the drawer, for the focus trap.
const FOCUSABLE =
  'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])'

// Active-route styling via NavLink: accent colour plus an underline (bar) or a
// leading rail (drawer) marks the current route.
function linkStyle(isActive: boolean, drawer: boolean): CSSProperties {
  return {
    padding: drawer ? '14px 8px' : '14px 12px',
    fontSize: 15,
    fontWeight: 500,
    color: isActive ? 'var(--accent)' : 'var(--slate-400)',
    ...(drawer
      ? {
          borderLeft: isActive
            ? '3px solid var(--accent)'
            : '3px solid transparent',
        }
      : {
          borderBottom: isActive
            ? '2px solid var(--accent)'
            : '2px solid transparent',
        }),
  }
}

// Brand mark folded in from the old Header — links Home, the only brand mark in
// the scaffold (branding/uzor-logo.svg → brand/uzor-mark.svg).
function Brand() {
  return (
    <Link
      to="/"
      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      aria-label="UzorAI home"
    >
      <img src={markUrl} alt="UzorAI" width={36} height={36} />
      <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '0.02em' }}>
        UzorAI
      </span>
    </Link>
  )
}

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  )
}

const iconButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  padding: 0,
  border: '1px solid var(--slate-700)',
  borderRadius: 8,
  background: 'var(--surface)',
  color: 'var(--fg)',
  cursor: 'pointer',
}

export default function NavMenu() {
  const { t } = useLocale()
  const location = useLocation()

  // Responsive switch. This is a client-only SPA, so matchMedia is read at the
  // first render — no flash of the wrong layout — and a listener keeps it live
  // across resizes.
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window === 'undefined' ||
      window.matchMedia(`(min-width: ${BREAKPOINT}px)`).matches,
  )
  const [open, setOpen] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${BREAKPOINT}px)`)
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Close on route change: a NavLink tap navigates → pathname changes → drawer
  // closes (acceptance criterion + keeps deep-links landing on a closed nav).
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Crossing back to desktop drops any open drawer state.
  useEffect(() => {
    if (isDesktop) setOpen(false)
  }, [isDesktop])

  // Drawer lifecycle while open: lock body scroll, move focus in, trap Tab,
  // close on Escape, and restore focus to the trigger on close. This is the
  // Game-Theory mitigation in code — focus is always trapped while open and is
  // never stranded once the drawer closes.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = drawerRef.current

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      : []
    focusables[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  const barStyle: CSSProperties = {
    borderBottom: '1px solid var(--slate-700)',
    background: 'var(--surface)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  }

  const links = (drawer: boolean) =>
    ROUTES.map((r) => (
      <NavLink
        key={r.path}
        to={r.path}
        end={r.end}
        onClick={drawer ? close : undefined}
        style={({ isActive }) => linkStyle(isActive, drawer)}
      >
        {t(r.labelKey)}
      </NavLink>
    ))

  // ---- Desktop: one horizontal bar ----
  if (isDesktop) {
    return (
      <header style={barStyle}>
        <div
          className="wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '0 32px',
          }}
        >
          <div style={{ padding: '14px 0' }}>
            <Brand />
          </div>
          <nav style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
            {links(false)}
          </nav>
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <LanguagePicker />
            <ThemeToggle />
          </div>
        </div>
      </header>
    )
  }

  // ---- Mobile: brand + hamburger, drawer on open ----
  return (
    <header style={barStyle}>
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
        }}
      >
        <Brand />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-drawer"
          style={iconButtonStyle}
        >
          <HamburgerIcon />
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop: a click anywhere outside the panel closes the drawer. */}
          <div
            onClick={close}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 60,
            }}
          />
          <div
            id="nav-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(82vw, 320px)',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--slate-700)',
              zIndex: 70,
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 16px 24px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                style={iconButtonStyle}
              >
                <CloseIcon />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {links(true)}
            </nav>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                borderTop: '1px solid var(--slate-700)',
              }}
            >
              <LanguagePicker />
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </header>
  )
}
