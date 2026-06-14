import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  applyTheme,
  persistTheme,
  resolveTheme,
  type Theme,
} from './initTheme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  /** Flip light <-> dark and persist. */
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline pre-paint script in index.html already set <html data-theme>
  // before React mounts. Start from the brand default for a deterministic
  // first render, then reconcile with the resolved (stored/OS) value on mount
  // so React state and the DOM agree without a flash.
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const resolved = resolveTheme()
    applyTheme(resolved)
    setThemeState(resolved)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next)
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
