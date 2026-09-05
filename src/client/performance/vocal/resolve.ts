import { LANGUAGES } from '../../config/languages'
import type {
  VocalCue,
  VocalProfile,
  VocalLocale,
  VocalResolution,
  VocalPlan,
  CaptionOnlyPlan,
  VocalCaption,
  VocalDiagnosticCode,
  VocalCompatibilityPins,
} from './schema'
import {
  VOCAL_SUPPORTED_LOCALES,
  validateProfile,
  validateCue,
  validateCompatibility,
} from './schema'

const DEFAULT_LOCALE: VocalLocale = 'en'

function captionFor(cue: VocalCue, locale: VocalLocale): VocalCaption {
  const match = cue.captions.find(c => c.locale === locale)
  return match ?? (cue.captions.find(c => c.locale === DEFAULT_LOCALE) ?? cue.captions[0])
}

// Pure offline resolver. Never fetches, reads secrets, constructs HTML, or mutates the clock.
export function resolveVocalCue(
  cue: VocalCue,
  profiles: readonly VocalProfile[],
  locale: VocalLocale,
  compatibility: VocalCompatibilityPins,
): VocalResolution {
  const diagnostics: VocalDiagnosticCode[] = []

  if (!(VOCAL_SUPPORTED_LOCALES as readonly string[]).includes(locale)) diagnostics.push('unsupported-locale')

  for (const code of validateCompatibility(compatibility)) {
    if (!diagnostics.includes(code)) diagnostics.push(code)
  }

  for (const code of validateCue(cue)) {
    if (!diagnostics.includes(code)) diagnostics.push(code)
  }

  const builderProfile = profiles.find(p => p.id === cue.builderProfileId)
  const governorProfile = profiles.find(p => p.id === cue.governorProfileId)

  if (!builderProfile || !governorProfile) {
    diagnostics.push('unapproved-profile')
  } else {
    for (const code of validateProfile(builderProfile)) {
      if (!diagnostics.includes(code)) diagnostics.push(code)
    }
    for (const code of validateProfile(governorProfile)) {
      if (!diagnostics.includes(code)) diagnostics.push(code)
    }
    // Verify both profiles support the requested locale.
    const requestedLocale = (VOCAL_SUPPORTED_LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE
    if (builderProfile.locales && !builderProfile.locales.includes(requestedLocale)) diagnostics.push('unsupported-locale')
    if (governorProfile.locales && !governorProfile.locales.includes(requestedLocale)) diagnostics.push('unsupported-locale')
  }

  const resolvedCaption = captionFor(cue, locale)
  const resolvedLocale = cue.captions.some(c => c.locale === locale) ? locale : DEFAULT_LOCALE

  if (diagnostics.length > 0) {
    const plan: CaptionOnlyPlan = Object.freeze({
      kind: 'caption-only',
      cueId: cue.id,
      clockSlot: cue.clockSlot,
      caption: resolvedCaption,
      locale: resolvedLocale,
      diagnostics: Object.freeze([...diagnostics, 'caption-only-fallback']),
    })
    return plan
  }

  const plan: VocalPlan = Object.freeze({
    kind: 'vocal-plan',
    cueId: cue.id,
    clockSlot: cue.clockSlot,
    builderProfileId: cue.builderProfileId,
    governorProfileId: cue.governorProfileId,
    caption: resolvedCaption,
    locale: resolvedLocale,
  })
  return plan
}

// Resolves caption-only output for every supported locale regardless of profile availability.
export function resolveAllLocales(
  cue: VocalCue,
  profiles: readonly VocalProfile[],
  compatibility: VocalCompatibilityPins,
): ReadonlyMap<VocalLocale, VocalResolution> {
  const result = new Map<VocalLocale, VocalResolution>()
  for (const lang of LANGUAGES) {
    result.set(lang.code, resolveVocalCue(cue, profiles, lang.code, compatibility))
  }
  return result
}
