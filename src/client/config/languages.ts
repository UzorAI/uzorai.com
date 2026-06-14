/*
 * Locale metadata — the single source of truth for the shipped locale set,
 * ported from htu-foundation's config/languages.js (adapted to TypeScript).
 *
 * v1 ships en + es + ru + zh (the htu.io core set). `en` is canonical and is
 * the fallback dictionary. Arabic (`ar`, dir: 'rtl') is GATED on a separate
 * RTL review (EPIC #29): the provider and styles/rtl.css already honour `dir`,
 * so adding `ar` later is a dictionary + one-line metadata change, no rework.
 */
export type Dir = 'ltr' | 'rtl'

export type LocaleCode = 'en' | 'es' | 'ru' | 'zh'

export interface Language {
  code: LocaleCode
  /** Endonym — shown in the picker in the language's own script. */
  label: string
  dir: Dir
}

export const LANGUAGES: readonly Language[] = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'zh', label: '中文', dir: 'ltr' },
] as const

/** Canonical / fallback locale. `en` is the source dictionary. */
export const DEFAULT_LOCALE: LocaleCode = 'en'

/** localStorage key for the persisted UI-language preference (non-personal). */
export const LOCALE_STORAGE_KEY = 'uzor-locale'

const SUPPORTED = new Set<string>(LANGUAGES.map((l) => l.code))

/** Validate an arbitrary string against the known-locale enum (Game Theory
 *  mitigation: a corrupted stored `uzor-locale` must never reach the UI). */
export function isSupportedLocale(code: string | null | undefined): code is LocaleCode {
  return code != null && SUPPORTED.has(code)
}

export function dirFor(code: LocaleCode): Dir {
  return LANGUAGES.find((l) => l.code === code)?.dir ?? 'ltr'
}
