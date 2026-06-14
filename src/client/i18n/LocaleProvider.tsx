import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  dirFor,
  isSupportedLocale,
  type LocaleCode,
} from '../config/languages'
// `en` is the canonical fallback — imported eagerly so `t()` can always resolve
// a missing key to its English string, even before the active dictionary loads.
import en from './en.json'

type Dict = Record<string, string>

// Lazy per-locale loaders (Vite glob): only the active locale's JSON is fetched
// beyond the eager `en` fallback, keeping the initial bundle small. `en` is
// excluded — it ships in the main chunk as the static fallback. Keyed by path,
// e.g. './es.json' -> () => Promise<{ default: Dict }>.
const loaders = import.meta.glob<{ default: Dict }>(['./*.json', '!./en.json'])

interface LocaleContextValue {
  locale: LocaleCode
  setLocale: (code: LocaleCode) => void
  /** Resolve a key against the active dictionary, falling back to `en`, then
   *  to the key itself — never blank. */
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

// First-visit resolution: a valid persisted choice wins; otherwise the best
// `navigator.languages` match among the bundled locales; otherwise `en`.
// A corrupted/unknown stored value fails the enum check and falls back to `en`.
function detectInitialLocale(): LocaleCode {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (isSupportedLocale(stored)) return stored
  for (const pref of window.navigator.languages ?? []) {
    const base = pref.toLowerCase().split('-')[0]
    if (isSupportedLocale(base)) return base
  }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Start from the canonical default for a deterministic first paint, then
  // resolve the persisted/navigator locale on mount (client-only).
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE)
  const [dict, setDict] = useState<Dict>(en)

  useEffect(() => {
    const initial = detectInitialLocale()
    if (initial !== DEFAULT_LOCALE) setLocaleState(initial)
  }, [])

  // Apply <html lang/dir> and lazily load the active dictionary. RTL locales
  // (e.g. a future `ar`) flip the document direction; styles/rtl.css handles
  // the visual flips under [dir="rtl"].
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dirFor(locale)

    if (locale === DEFAULT_LOCALE) {
      setDict(en)
      return
    }
    const load = loaders[`./${locale}.json`]
    if (!load) {
      setDict(en)
      return
    }
    let cancelled = false
    load().then((mod) => {
      if (!cancelled) setDict(mod.default)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  const setLocale = useCallback((code: LocaleCode) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, code)
    setLocaleState(code)
  }, [])

  const t = useCallback(
    (key: string): string => dict[key] ?? (en as Dict)[key] ?? key,
    [dict],
  )

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider')
  return ctx
}
