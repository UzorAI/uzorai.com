import { dirFor, type Dir, type LocaleCode } from '../config/languages'
import { ENGLISH_BASELINE, LOCALE_PACKS } from './packs'
import { canonicalPackJson, validateRegistry, type LocaleExperiencePack, type PackReasonCode } from './schema'

export interface ResolvedExperience<T> {
  readonly locale: LocaleCode
  readonly dir: Dir
  /** Passed through by identity: dictionary or existing t() retains its own fallback rules. */
  readonly localizedText: T
  readonly pack: LocaleExperiencePack
  readonly registration: LocaleExperiencePack | null
  readonly mode: 'baseline' | 'baseline-with-localized-text' | 'last-known-good-baseline'
  readonly reasons: readonly PackReasonCode[]
}

/**
 * Offline, no clock/storage/IO, no fallback traversal. Candidates are plain JSON.
 * A content seal alone cannot grant approval: every supplied entry must match
 * the checked-in reviewed catalog in full. Return trusted objects, never input.
 */
export function resolveExperiencePack<T>(
  locale: LocaleCode,
  localizedText: T,
  candidates: unknown = LOCALE_PACKS,
): ResolvedExperience<T> {
  const reasons = new Set<PackReasonCode>(validateRegistry(candidates))
  if (Array.isArray(candidates) && reasons.size === 0) {
    for (const candidate of candidates as LocaleExperiencePack[]) {
      const approved = LOCALE_PACKS.find(pack => pack.id === candidate.id && pack.locale === candidate.locale)
      if (!approved) reasons.add('unapproved-pack')
      else if (approved.version !== candidate.version) reasons.add('stale-pack')
      else if (canonicalPackJson(approved) !== canonicalPackJson(candidate)) reasons.add('unapproved-pack')
    }
  }
  const registration = LOCALE_PACKS.find(pack => pack.locale === locale) ?? null
  if (reasons.size === 0 && (!Array.isArray(candidates) || !candidates.some(candidate => candidate?.locale === locale))) reasons.add('missing-pack')
  if (reasons.size || !registration) {
    return { locale, dir: dirFor(locale), localizedText, pack: ENGLISH_BASELINE, registration: null, mode: 'last-known-good-baseline', reasons: [...reasons] }
  }
  return { locale, dir: dirFor(locale), localizedText, pack: ENGLISH_BASELINE, registration, mode: registration.mode, reasons: [] }
}
