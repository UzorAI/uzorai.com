/*
 * Theme init — framework-agnostic core, ported from htu-foundation's
 * lib/theme.js into uzorai's TS stack (EPIC #29 Phase A).
 *
 * The base :root tokens in brand/tokens.css are the brand DARK (graphite)
 * colorway, so 'dark' is the no-flash fallback: when nothing resolves, the
 * bare :root already renders dark. The inline pre-paint script in index.html
 * mirrors resolveInitialTheme()/applyTheme() so <html data-theme> is set
 * before first paint; the ThemeProvider reconciles on mount.
 */

export type Theme = 'light' | 'dark'

/** localStorage key holding the persisted UI preference. */
export const THEME_KEY = 'uzor-theme'

/** Brand default colorway (the bare :root token set). */
const DEFAULT_THEME: Theme = 'dark'

/** Narrow an unknown value to a valid Theme — the abuse-vector guard. */
export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/** Validated stored choice, or null when absent / corrupted / unreadable. */
export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

/** OS preference via prefers-color-scheme; brand default when unknown. */
export function getSystemTheme(): Theme {
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch {
    /* matchMedia unavailable — fall through to the default */
  }
  return DEFAULT_THEME
}

/** Stored choice wins; otherwise honour the OS preference. */
export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

/** Reflect the theme onto <html data-theme>. */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

/** Resolve + apply. Mirrors the inline pre-paint script for reconciliation. */
export function initTheme(): Theme {
  const theme = resolveInitialTheme()
  applyTheme(theme)
  return theme
}
