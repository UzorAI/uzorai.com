import { LANGUAGES } from '../config/languages'
import {
  BASELINE_ID, BASELINE_VERSION, COMPATIBILITY, INVARIANTS, PROVENANCE_SOURCES,
  REVIEW_EVIDENCE, TOKEN_NAMES, TOKEN_SOURCE, freezePackData, sealPack,
  type LocaleExperiencePack,
} from './schema'

const shared = {
  compatibility: COMPATIBILITY,
  invariants: INVARIANTS,
  rights: { owner: 'UzorAI/uzorai.com', basis: 'repository-owned', thirdPartyAssets: false },
  provenance: { sources: PROVENANCE_SOURCES, origin: 'repository-authored-metadata', generatedMedia: false },
  // #123 authorizes conservative metadata only. This is not cultural-asset approval.
  // Merging this catalog still requires the designated operator's PR review.
  approval: { status: 'approved', scope: 'baseline-metadata-only', evidence: REVIEW_EVIDENCE, culturalAssets: 'deferred-to-child-review' },
} as const

/** Trusted last-known-good object; external candidates can never replace it. */
export const ENGLISH_BASELINE = sealPack({
  ...shared,
  id: BASELINE_ID,
  version: BASELINE_VERSION,
  locale: 'en',
  dir: 'ltr',
  mode: 'baseline',
  fallback: null,
  content: {
    name: 'English Robo Tech Rap',
    arrangement: [
      'Bars 1–8: orientation; repository token palette and existing localized copy.',
      'Bars 9–16: bounded workflow-brick construction in canonical order.',
      'Bars 17–31: stage detail aligned to existing phrase slots, with silent equivalence.',
      'Bar 32: one representative workflow-plan resolution; no recorded voice or music.',
    ],
    assets: TOKEN_NAMES.map(token => ({ kind: 'design-token', path: TOKEN_SOURCE, token, owner: 'UzorAI/uzorai.com' })),
  },
})

/** Registration versions are independent of both locale dictionaries and other packs. */
export const LOCALE_PACKS: readonly LocaleExperiencePack[] = freezePackData([
  ENGLISH_BASELINE,
  ...LANGUAGES.filter(language => language.code !== 'en').map(language => sealPack({
    ...shared,
    id: `uzor-baseline-text-${language.code}`,
    version: '1.0.0',
    locale: language.code,
    dir: language.dir,
    mode: 'baseline-with-localized-text',
    fallback: { id: BASELINE_ID, version: BASELINE_VERSION, locale: 'en' },
    content: null,
  })),
])
