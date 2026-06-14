import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  THEME_KEY,
  applyTheme,
  resolveInitialTheme,
  type Theme,
} from './initTheme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Persist a choice to localStorage; swallow storage failures (private mode). */
function persist(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    /* storage unavailable — keep the in-memory choice */
  }
}

/**
 * React 19 provider wrapping the framework-agnostic theme core. Seeds state
 * from the same resolution the inline pre-paint script used, reconciles
 * <html data-theme> on mount, and persists every change.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme())

  // Reconcile the document attribute on mount in case the inline pre-paint
  // script was blocked (CSP / older engine). Re-asserts the resolved value.
  useEffect(() => {
    applyTheme(theme)
    // run once on mount; theme changes apply through setTheme/toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    persist(next)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      persist(next)
      return next
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle }),
    [theme, setTheme, toggle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Access the theme context; throws outside a ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
