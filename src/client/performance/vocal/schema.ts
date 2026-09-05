import { LANGUAGES, type LocaleCode } from '../../config/languages'
import { PERFORMANCE_VERSION } from '../uzorPerformanceManifest'
import { MANIFEST_SCHEMA_VERSION, COMPATIBILITY } from '../../experience-packs/schema'
import { UZOR_LOOP_MODEL_VERSION } from '../../workflow/uzorLoopModel'

export const VOCAL_SCHEMA_VERSION = '1.0.0'

export const VOCAL_SUPPORTED_LOCALES: readonly LocaleCode[] = LANGUAGES.map(l => l.code)

export type VocalLocale = LocaleCode

export type VocalRole = 'builder' | 'governor'
export const VOCAL_ROLES: readonly VocalRole[] = ['builder', 'governor'] as const

// Stable diagnostic codes — never change once published.
export type VocalDiagnosticCode =
  | 'invalid-schema'
  | 'incompatible-version'
  | 'unapproved-profile'
  | 'missing-provenance'
  | 'missing-rights'
  | 'unsupported-locale'
  | 'invalid-phrase-ref'
  | 'duplicate-cue'
  | 'timing-overflow'
  | 'caption-only-fallback'

// Announcement policy prevents duplicate simultaneous speech+ticker (AC7).
export type AnnouncementPolicy = 'once-on-enter' | 'suppress-if-audio-present'

export interface VocalCaption {
  readonly locale: VocalLocale
  readonly text: string
  readonly srPolicy: AnnouncementPolicy
}

export interface PhraseRef {
  // Must match /^uzor-phrase-[a-z0-9]+(?:-[a-z0-9]+)*$/ (closed syntax).
  readonly phraseId: string
  // 1-indexed slot, must align with a valid PERFORMANCE_EVENTS phraseSlot.
  readonly phraseSlot: number
}

export interface VocalClockSlot {
  readonly bar: number
  readonly beat: number
  readonly phase: 'orientation' | 'construction' | 'detail' | 'resolution'
}

export interface VocalRights {
  readonly owner: string
  readonly basis: 'repository-owned' | 'licensed' | 'consented'
  readonly thirdPartyAssets: boolean
  readonly clearanceEvidence: string
}

export interface VocalProvenance {
  readonly origin: string
  readonly sources: readonly string[]
  readonly generatedMedia: boolean
  readonly recordingConsent: boolean
}

export interface VocalApproval {
  readonly status: 'approved'
  readonly scope: string
  readonly evidence: string
  readonly approvedAt: string
}

// Descriptive voice characteristics — MUST NOT drive authorization, selection, ordering, or validation.
export interface VocalCharacteristics {
  readonly description: string
}

// No gender field. Builder and Governor are semantic roles, never gender identities.
export interface VocalProfile {
  readonly id: string
  readonly version: string
  readonly schemaVersion: string
  readonly locales: readonly VocalLocale[]
  readonly rights: VocalRights
  readonly provenance: VocalProvenance
  readonly approval: VocalApproval
  readonly characteristics?: VocalCharacteristics
}

export interface VocalCue {
  readonly id: string
  readonly clockSlot: VocalClockSlot
  readonly phraseRef: PhraseRef
  readonly builderProfileId: string
  readonly governorProfileId: string
  readonly captions: readonly VocalCaption[]
}

export interface VocalCompatibilityPins {
  readonly performanceClock: string
  readonly localePackSchema: string
  readonly workflowModel: string
  readonly voiceCadence: string
}

// Exact version pins from existing contracts.
export const VOCAL_COMPATIBILITY: VocalCompatibilityPins = Object.freeze({
  performanceClock: PERFORMANCE_VERSION,
  localePackSchema: MANIFEST_SCHEMA_VERSION,
  workflowModel: UZOR_LOOP_MODEL_VERSION,
  voiceCadence: COMPATIBILITY.voiceCadence,
})

export interface VocalPlan {
  readonly kind: 'vocal-plan'
  readonly cueId: string
  readonly clockSlot: VocalClockSlot
  readonly builderProfileId: string
  readonly governorProfileId: string
  readonly caption: VocalCaption
  readonly locale: VocalLocale
}

export interface CaptionOnlyPlan {
  readonly kind: 'caption-only'
  readonly cueId: string
  readonly clockSlot: VocalClockSlot
  readonly caption: VocalCaption
  readonly locale: VocalLocale
  readonly diagnostics: readonly VocalDiagnosticCode[]
}

export type VocalResolution = VocalPlan | CaptionOnlyPlan

// ── Validation helpers ───────────────────────────────────────────────────────

function safeContent(s: string): boolean {
  return !/<|javascript:|data:/i.test(s)
}

function safeId(s: string): boolean {
  return typeof s === 'string' && /^[a-z0-9][a-z0-9-]{0,127}$/.test(s)
}

function safeVersion(s: string): boolean {
  return typeof s === 'string' && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(s)
}

function safePhraseId(s: string): boolean {
  return typeof s === 'string' && /^uzor-phrase-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)
}

function isVocalLocale(s: unknown): s is VocalLocale {
  return typeof s === 'string' && (VOCAL_SUPPORTED_LOCALES as readonly string[]).includes(s)
}

export function validateProfile(profile: unknown): readonly VocalDiagnosticCode[] {
  const errors = new Set<VocalDiagnosticCode>()
  if (profile === null || typeof profile !== 'object' || Array.isArray(profile)) { errors.add('invalid-schema'); return [...errors] }
  const p = profile as Record<string, unknown>
  const EXPECTED_KEYS = new Set(['id', 'version', 'schemaVersion', 'locales', 'rights', 'provenance', 'approval', 'characteristics'])
  for (const key of Object.keys(p)) { if (!EXPECTED_KEYS.has(key)) { errors.add('invalid-schema') } }
  if (!safeId(p.id as string) || !safeVersion(p.version as string)) errors.add('invalid-schema')
  if (p.schemaVersion !== VOCAL_SCHEMA_VERSION) errors.add('incompatible-version')
  if (!Array.isArray(p.locales) || !(p.locales as unknown[]).every(isVocalLocale) || (p.locales as unknown[]).length === 0) errors.add('unsupported-locale')
  const rights = p.rights as Record<string, unknown>
  if (!rights || typeof rights !== 'object' || Array.isArray(rights)) { errors.add('missing-rights') }
  else {
    const validBases = new Set(['repository-owned', 'licensed', 'consented'])
    if (!validBases.has(rights.basis as string) || typeof rights.owner !== 'string' || !safeContent(rights.owner)
      || typeof rights.clearanceEvidence !== 'string' || !safeContent(rights.clearanceEvidence)
      || typeof rights.thirdPartyAssets !== 'boolean') errors.add('missing-rights')
  }
  const prov = p.provenance as Record<string, unknown>
  if (!prov || typeof prov !== 'object' || Array.isArray(prov)) { errors.add('missing-provenance') }
  else {
    if (typeof prov.origin !== 'string' || !safeContent(prov.origin)
      || !Array.isArray(prov.sources) || !(prov.sources as unknown[]).every(s => typeof s === 'string' && safeContent(s))
      || typeof prov.generatedMedia !== 'boolean' || typeof prov.recordingConsent !== 'boolean') errors.add('missing-provenance')
  }
  const appr = p.approval as Record<string, unknown>
  if (!appr || typeof appr !== 'object' || Array.isArray(appr)) { errors.add('unapproved-profile') }
  else {
    if (appr.status !== 'approved' || typeof appr.scope !== 'string' || !safeContent(appr.scope)
      || typeof appr.evidence !== 'string' || !safeContent(appr.evidence)
      || typeof appr.approvedAt !== 'string') errors.add('unapproved-profile')
  }
  if (p.characteristics !== undefined) {
    const c = p.characteristics as Record<string, unknown>
    if (typeof c !== 'object' || Array.isArray(c) || c === null || typeof c.description !== 'string' || !safeContent(c.description)
      || Object.keys(c).length !== 1) errors.add('invalid-schema')
  }
  return [...errors]
}

export function validateCue(cue: unknown): readonly VocalDiagnosticCode[] {
  const errors = new Set<VocalDiagnosticCode>()
  if (cue === null || typeof cue !== 'object' || Array.isArray(cue)) { errors.add('invalid-schema'); return [...errors] }
  const c = cue as Record<string, unknown>
  const EXPECTED_KEYS = new Set(['id', 'clockSlot', 'phraseRef', 'builderProfileId', 'governorProfileId', 'captions'])
  for (const key of Object.keys(c)) { if (!EXPECTED_KEYS.has(key)) { errors.add('invalid-schema') } }
  if (typeof c.id !== 'string' || !safeId(c.id)) errors.add('invalid-schema')
  if (typeof c.builderProfileId !== 'string' || !safeId(c.builderProfileId)) errors.add('invalid-schema')
  if (typeof c.governorProfileId !== 'string' || !safeId(c.governorProfileId)) errors.add('invalid-schema')
  const slot = c.clockSlot as Record<string, unknown>
  if (!slot || typeof slot !== 'object' || Array.isArray(slot)) { errors.add('timing-overflow') }
  else {
    const validPhases = new Set(['orientation', 'construction', 'detail', 'resolution'])
    if (!Number.isInteger(slot.bar) || (slot.bar as number) < 1 || (slot.bar as number) > 32) errors.add('timing-overflow')
    if (!Number.isInteger(slot.beat) || (slot.beat as number) < 1 || (slot.beat as number) > 4) errors.add('timing-overflow')
    if (!validPhases.has(slot.phase as string)) errors.add('invalid-schema')
  }
  const phrase = c.phraseRef as Record<string, unknown>
  if (!phrase || typeof phrase !== 'object' || Array.isArray(phrase)) { errors.add('invalid-phrase-ref') }
  else {
    if (!safePhraseId(phrase.phraseId as string)) errors.add('invalid-phrase-ref')
    if (!Number.isInteger(phrase.phraseSlot) || (phrase.phraseSlot as number) < 1) errors.add('invalid-phrase-ref')
  }
  if (!Array.isArray(c.captions) || (c.captions as unknown[]).length === 0) { errors.add('invalid-schema') }
  else {
    const localesSeen = new Set<string>()
    for (const cap of c.captions as unknown[]) {
      if (!cap || typeof cap !== 'object' || Array.isArray(cap)) { errors.add('invalid-schema'); continue }
      const cp = cap as Record<string, unknown>
      if (!isVocalLocale(cp.locale)) errors.add('unsupported-locale')
      if (typeof cp.text !== 'string' || cp.text.trim() === '' || !safeContent(cp.text)) errors.add('invalid-schema')
      const validPolicies = new Set(['once-on-enter', 'suppress-if-audio-present'])
      if (!validPolicies.has(cp.srPolicy as string)) errors.add('invalid-schema')
      if (typeof cp.locale === 'string') {
        if (localesSeen.has(cp.locale)) errors.add('duplicate-cue')
        localesSeen.add(cp.locale)
      }
    }
  }
  return [...errors]
}

export function validateCueCollection(cues: readonly unknown[]): readonly VocalDiagnosticCode[] {
  const errors = new Set<VocalDiagnosticCode>()
  const ids = new Set<string>()
  let lastBar = -1
  for (const cue of cues) {
    for (const code of validateCue(cue)) errors.add(code)
    if (cue && typeof cue === 'object' && !Array.isArray(cue)) {
      const c = cue as Record<string, unknown>
      if (typeof c.id === 'string') {
        if (ids.has(c.id)) errors.add('duplicate-cue')
        ids.add(c.id)
      }
      const slot = c.clockSlot as Record<string, unknown>
      if (slot && typeof slot.bar === 'number') {
        if (slot.bar < lastBar) errors.add('timing-overflow')
        lastBar = slot.bar as number
      }
    }
  }
  return [...errors]
}

export function validateCompatibility(pins: unknown): readonly VocalDiagnosticCode[] {
  if (!pins || typeof pins !== 'object' || Array.isArray(pins)) return ['incompatible-version']
  const p = pins as Record<string, unknown>
  const ok = p.performanceClock === VOCAL_COMPATIBILITY.performanceClock
    && p.localePackSchema === VOCAL_COMPATIBILITY.localePackSchema
    && p.workflowModel === VOCAL_COMPATIBILITY.workflowModel
    && p.voiceCadence === VOCAL_COMPATIBILITY.voiceCadence
  return ok ? [] : ['incompatible-version']
}
