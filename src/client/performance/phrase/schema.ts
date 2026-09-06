import type { VocalLocale } from '../vocal/schema'
import { VOCAL_SUPPORTED_LOCALES } from '../vocal/schema'

export const PHRASE_SCHEMA_VERSION = '1.0.0'

// ── State machines (AC1 — no transition skipping) ─────────────────────────────
export type FactState = 'draft' | 'verified' | 'approved' | 'superseded'
export type PhraseState = 'candidate' | 'approved' | 'quarantined' | 'superseded'

const FACT_TRANSITIONS: Readonly<Record<FactState, readonly FactState[]>> = Object.freeze({
  draft:       Object.freeze(['verified'] as const),
  verified:    Object.freeze(['approved', 'superseded'] as const),
  approved:    Object.freeze(['superseded'] as const),
  superseded:  Object.freeze([] as const),
})

const PHRASE_TRANSITIONS: Readonly<Record<PhraseState, readonly PhraseState[]>> = Object.freeze({
  candidate:   Object.freeze(['approved', 'quarantined'] as const),
  approved:    Object.freeze(['superseded', 'quarantined'] as const),
  quarantined: Object.freeze([] as const),
  superseded:  Object.freeze([] as const),
})

export function isFactTransitionLegal(from: FactState, to: FactState): boolean {
  return (FACT_TRANSITIONS[from] as readonly string[]).includes(to)
}

export function isPhraseTransitionLegal(from: PhraseState, to: PhraseState): boolean {
  return (PHRASE_TRANSITIONS[from] as readonly string[]).includes(to)
}

// ── Diagnostic codes ──────────────────────────────────────────────────────────
export type FactDiagnosticCode =
  | 'missing-provenance'
  | 'missing-verification-owner'
  | 'missing-freshness'
  | 'stale-fact'
  | 'superseded-fact'
  | 'invalid-schema'
  | 'illegal-transition'

export type PhraseDiagnosticCode =
  | 'semantic-fail'
  | 'factual-fail'
  | 'rhythmic-fail'
  | 'locale-mismatch'
  | 'duplicate'
  | 'safety-fail'
  | 'rights-fail'
  | 'stale-phrase'
  | 'missing-approval'
  | 'missing-provenance'
  | 'invalid-schema'
  | 'illegal-transition'
  | 'superseded-phrase'

// ── Core types ────────────────────────────────────────────────────────────────
export interface TrustedSource {
  readonly sourceId: string
  readonly origin: string
  readonly snapshot: string
  readonly retrievedAt: string
}

export interface CapabilityFact {
  readonly id: string
  readonly state: FactState
  readonly claim: string
  readonly claimMeaning: string
  readonly locale: VocalLocale
  readonly source: TrustedSource
  readonly verificationOwner: string
  readonly verifiedAt: string | null
  readonly approvedAt: string | null
  readonly freshUntil: string
  readonly supersededBy: string | null
  readonly provenanceChain: readonly string[]
}

export interface PhraseRights {
  readonly basis: 'repository-owned' | 'licensed' | 'consented'
  readonly clearanceEvidence: string
}

export interface ApprovedPhrase {
  readonly phraseId: string
  readonly state: PhraseState
  readonly locale: VocalLocale
  readonly text: string
  readonly capabilityFactId: string
  readonly provenanceChain: readonly string[]
  readonly rhythmPattern: string
  readonly approvedAt: string | null
  readonly freshUntil: string
  readonly supersededBy: string | null
  readonly rights: PhraseRights
}

// ── Private helpers ───────────────────────────────────────────────────────────
function safeText(s: unknown): boolean {
  return typeof s === 'string' && s.trim().length > 0 && !/<|javascript:|data:/i.test(s)
}

function safeId(s: unknown): boolean {
  return typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,127}$/.test(s)
}

function safePhraseId(s: unknown): boolean {
  return typeof s === 'string' && /^uzor-phrase-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)
}

function isVocalLocale(s: unknown): s is VocalLocale {
  return typeof s === 'string' && (VOCAL_SUPPORTED_LOCALES as readonly string[]).includes(s)
}

function isFresh(freshUntil: unknown, now = new Date()): boolean {
  if (typeof freshUntil !== 'string' || !freshUntil) return false
  try { return new Date(freshUntil) > now } catch { return false }
}

// ── Capability-fact validators (AC3) ─────────────────────────────────────────
export function validateFact(fact: unknown, now?: Date): readonly FactDiagnosticCode[] {
  const errors = new Set<FactDiagnosticCode>()
  if (!fact || typeof fact !== 'object' || Array.isArray(fact)) return ['invalid-schema']
  const f = fact as Record<string, unknown>

  if (!safeId(f.id)) errors.add('invalid-schema')
  if (!safeText(f.claim) || !safeText(f.claimMeaning)) errors.add('invalid-schema')
  if (!isVocalLocale(f.locale)) errors.add('invalid-schema')

  const src = f.source
  if (!src || typeof src !== 'object' || Array.isArray(src)) { errors.add('missing-provenance') }
  else {
    const s = src as Record<string, unknown>
    if (!safeText(s.sourceId) || !safeText(s.origin) || !safeText(s.snapshot) || !safeText(s.retrievedAt)) {
      errors.add('missing-provenance')
    }
  }

  if (!safeText(f.verificationOwner)) errors.add('missing-verification-owner')

  if (typeof f.freshUntil !== 'string' || !f.freshUntil) errors.add('missing-freshness')
  else if (!isFresh(f.freshUntil, now)) errors.add('stale-fact')

  if (!Array.isArray(f.provenanceChain) || !(f.provenanceChain as unknown[]).every(safeText)) {
    errors.add('missing-provenance')
  }

  if (f.state === 'superseded') errors.add('superseded-fact')

  return [...errors]
}

export function validateFactTransition(fact: CapabilityFact, to: FactState): readonly FactDiagnosticCode[] {
  return isFactTransitionLegal(fact.state, to) ? [] : ['illegal-transition']
}

// ── Phrase validators (AC3) ───────────────────────────────────────────────────

// Rhythm pattern: must be a bounded non-empty token with no unsafe chars.
function isRhythmPattern(s: unknown): boolean {
  return typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(s)
}

export function validatePhrase(
  phrase: unknown,
  approvedFactIds?: ReadonlySet<string>,
  existingPhraseIds?: ReadonlySet<string>,
  now?: Date,
): readonly PhraseDiagnosticCode[] {
  const errors = new Set<PhraseDiagnosticCode>()
  if (!phrase || typeof phrase !== 'object' || Array.isArray(phrase)) return ['invalid-schema']
  const p = phrase as Record<string, unknown>

  if (!safePhraseId(p.phraseId)) errors.add('invalid-schema')
  if (!isVocalLocale(p.locale)) errors.add('locale-mismatch')

  // Safety check first (injection patterns)
  if (typeof p.text !== 'string' || /<|javascript:|data:|on\w+\s*=/i.test(p.text)) {
    errors.add('safety-fail')
  }
  // Semantic: non-trivial claim (at least 3 words)
  if (typeof p.text !== 'string' || p.text.trim().split(/\s+/).length < 3) {
    errors.add('semantic-fail')
  }

  // Rhythmic: pattern must be a valid bounded token
  if (!isRhythmPattern(p.rhythmPattern)) errors.add('rhythmic-fail')

  // Factual: capabilityFactId must reference an approved fact
  if (!safeId(p.capabilityFactId)) errors.add('factual-fail')
  else if (approvedFactIds !== undefined && !approvedFactIds.has(p.capabilityFactId as string)) {
    errors.add('factual-fail')
  }

  // Provenance chain
  if (!Array.isArray(p.provenanceChain) || (p.provenanceChain as unknown[]).length === 0
    || !(p.provenanceChain as unknown[]).every(safeText)) {
    errors.add('missing-provenance')
  }

  // Rights
  const rights = p.rights
  if (!rights || typeof rights !== 'object' || Array.isArray(rights)) {
    errors.add('rights-fail')
  } else {
    const r = rights as Record<string, unknown>
    const validBases = new Set(['repository-owned', 'licensed', 'consented'])
    if (!validBases.has(r.basis as string) || !safeText(r.clearanceEvidence)) {
      errors.add('rights-fail')
    }
  }

  // Approval required when state is 'approved'
  if (p.state === 'approved' && (typeof p.approvedAt !== 'string' || !p.approvedAt)) {
    errors.add('missing-approval')
  }

  // Freshness
  if (!isFresh(p.freshUntil, now)) errors.add('stale-phrase')

  // Superseded
  if (p.state === 'superseded') errors.add('superseded-phrase')

  // Deduplicate by phraseId
  if (existingPhraseIds !== undefined && typeof p.phraseId === 'string' && existingPhraseIds.has(p.phraseId)) {
    errors.add('duplicate')
  }

  return [...errors]
}

export function validatePhraseTransition(phrase: ApprovedPhrase, to: PhraseState): readonly PhraseDiagnosticCode[] {
  return isPhraseTransitionLegal(phrase.state, to) ? [] : ['illegal-transition']
}

// ── Collection validator (dedupe across reservoir) ────────────────────────────
export function validatePhraseCollection(
  phrases: readonly unknown[],
  approvedFactIds?: ReadonlySet<string>,
  now?: Date,
): readonly PhraseDiagnosticCode[] {
  const errors = new Set<PhraseDiagnosticCode>()
  const seen = new Set<string>()
  for (const phrase of phrases) {
    for (const code of validatePhrase(phrase, approvedFactIds, seen, now)) {
      errors.add(code)
    }
    if (phrase && typeof phrase === 'object' && !Array.isArray(phrase)) {
      const p = phrase as Record<string, unknown>
      if (typeof p.phraseId === 'string') seen.add(p.phraseId)
    }
  }
  return [...errors]
}
