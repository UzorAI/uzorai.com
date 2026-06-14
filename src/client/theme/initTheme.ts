// Theme init — the framework-agnostic core ported from htu-foundation's
// lib/theme.js, adapted to uzorai's single-domain, localStorage-only model.
// `ThemeProvider` reuses these helpers to reconcile on mount; an inline
// pre-paint snippet in index.html duplicates the minimal read+apply path so
// the theme lands before first paint (a deferred module would flash).

export type Theme = 'light' | 'dark'

/** localStorage key holding the persisted UI preference (`light` | `dark`). */
export const THEME_STORAGE_KEY = 'uzor-theme'

/** Matches the `--bg` value per theme so the address-bar tint tracks the page. */
const THEME_COLOR: Record<Theme, string> = {
  dark: '#0F172A', // --graphite
  light: '#F8FAFC', // --soft-white
}

/** Enum guard — rejects corrupted/unknown stored values (abuse-vector gate). */
export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/** Persisted choice if valid, else null. Defensive: never throws on a locked
 *  or unavailable localStorage. */
export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

/** OS preference. Light only when explicitly requested; dark is the brand
 *  default (uzorai ships the graphite colorway as its dark theme). */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

/** First-visit resolution: a valid stored choice wins; otherwise honour the
 *  OS `prefers-color-scheme`. */
export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

/** Apply to the DOM: `data-theme` on <html> (tokens.css resolves against it)
 *  and the address-bar `theme-color` meta. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLOR[theme])
}

/** Resolve + apply. Called by the inline pre-paint script and re-run by the
 *  provider on mount to reconcile. */
export function initTheme(): Theme {
  const theme = resolveTheme()
  applyTheme(theme)
  return theme
}

/** Persist + apply in one step (used by the provider's setter). */
export function persistTheme(theme: Theme): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Storage unavailable (private mode / quota) — apply in-session only.
    }
  }
  applyTheme(theme)
}
