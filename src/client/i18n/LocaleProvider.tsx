import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import { readBoundedStorage, writeBoundedStorage } from '../../shared/safeStorage'
// English remains the canonical source and fallback for non-Hebrew locales.
import en from './en.json'
// Hebrew is synchronous so a stored choice or switch never paints English.
import he from './he.json'
import { translate } from './translate'

type Dict = Record<string, string>

// Lazy per-locale loaders (Vite glob): only the active locale's JSON is fetched
// beyond the eager `en` fallback, keeping the initial bundle small. `en` is
// excluded along with Hebrew; both ship synchronously in the main chunk. Keyed by path,
// e.g. './es.json' -> () => Promise<{ default: Dict }>.
const loaders = import.meta.glob<{ default: Dict }>(['./*.json', '!./en.json', '!./he.json'])

interface LocaleContextValue {
  locale: LocaleCode
  setLocale: (code: LocaleCode) => void
  /** Hebrew requires an explicit translation; other locales retain en/key fallback. */
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

// First-visit resolution: a valid persisted choice wins; otherwise the best
// `navigator.languages` match among the bundled locales; otherwise `en`.
// A corrupted/unknown stored value fails the enum check and falls back to `en`.
function detectInitialLocale(): LocaleCode {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = readBoundedStorage(LOCALE_STORAGE_KEY)
  if (isSupportedLocale(stored)) return stored
  for (const pref of window.navigator.languages ?? []) {
    const base = pref.toLowerCase().split('-')[0]
    if (isSupportedLocale(base)) return base
  }
  return DEFAULT_LOCALE
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(detectInitialLocale)
  const [dict, setDict] = useState<Dict>(en)

  // Apply <html lang/dir> and lazily load the active dictionary. RTL locales
  // (`ar` and `he`) flip the document direction; styles/rtl.css handles
  // the visual flips under [dir="rtl"].
  useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dirFor(locale)
  }, [locale])

  useEffect(() => {
    if (locale === 'he') return

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
    }).catch(() => {
      if (!cancelled) setDict(en)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  const setLocale = useCallback((code: LocaleCode) => {
    writeBoundedStorage(LOCALE_STORAGE_KEY, code)
    setLocaleState(code)
  }, [])

  const t = useCallback(
    (key: string): string => translate(locale, locale === 'he' ? he : locale === 'en' ? en : dict, en, key),
    [dict, locale],
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
