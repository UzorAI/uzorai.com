import {
  PERFORMANCE_EVENTS,
  REPRESENTATIVE_ARTIFACT,
  validatePerformanceManifest,
  TOTAL_BARS,
  type PerformanceEvent,
} from '../uzorPerformanceManifest'
import { UZOR_LOOP_MODEL_VERSION } from '../../workflow/uzorLoopModel'
import { MANIFEST_SCHEMA_VERSION, canonicalPackJson } from '../../experience-packs/schema'
import {
  VOCAL_SCHEMA_VERSION,
  VOCAL_COMPATIBILITY,
  type VocalLocale,
} from '../vocal/schema'
import { PHRASE_SCHEMA_VERSION } from '../phrase/schema'

export const MANIFEST_32BAR_VERSION = '1.0.0'

// ── Types ─────────────────────────────────────────────────────────────────────
export type ManifestDiagnosticCode =
  | 'missing-components'
  | 'peer-type-confusion'
  | 'bad-event-order'
  | 'incompatible-versions'
  | 'unlabeled-demo-artifact'
  | 'duplicate-bar32-payoff'
  | 'invalid-schema'
  | 'integrity-mismatch'
  | 'missing-provenance'
  | 'missing-rights'
  | 'stale-manifest'

export interface StatusEvent {
  readonly eventId: string
  readonly kind: 'evidence' | 'approval' | 'replenishment-signal'
  readonly timestamp: string
  readonly actor: string
  readonly description: string
}

export interface ManifestProvenanceBundle {
  readonly specVersion: string
  readonly phraseSchemaVersion: string
  readonly vocalSchemaVersion: string
  readonly packSchemaVersion: string
  readonly workflowModelVersion: string
  readonly sources: readonly string[]
  readonly approvedAt: string
  readonly approver: string
}

export interface ManifestCompatibility {
  readonly performanceClock: string
  readonly phraseSchema: string
  readonly vocalSchema: string
  readonly localePackSchema: string
  readonly workflowModel: string
}

export const MANIFEST_COMPATIBILITY: ManifestCompatibility = Object.freeze({
  performanceClock: VOCAL_COMPATIBILITY.performanceClock,
  phraseSchema: PHRASE_SCHEMA_VERSION,
  vocalSchema: VOCAL_SCHEMA_VERSION,
  localePackSchema: MANIFEST_SCHEMA_VERSION,
  workflowModel: UZOR_LOOP_MODEL_VERSION,
})

export interface PhraseSlotAssignment {
  readonly bar: number
  readonly phraseSlot: number
  readonly phraseId: string
  readonly locale: VocalLocale
}

export interface ManifestPayoff {
  readonly bar: 32
  readonly phraseId: string
  readonly locale: VocalLocale
}

export interface ManifestRights {
  readonly owner: 'UzorAI/uzorai.com'
  readonly basis: 'repository-owned'
  readonly thirdPartyAssets: false
}

export interface ManifestIntegrity {
  readonly algorithm: 'canonical-json-v1'
  readonly payload: string
}

export interface PerformanceManifest32Bar {
  readonly kind: 'performance-manifest-32bar'
  readonly version: string
  readonly locale: VocalLocale
  readonly theme: string
  readonly variation: string
  readonly musicPack: string
  readonly tokenSkin: string
  readonly workflowVersion: string
  readonly voiceAssignments: {
    readonly builderProfileId: string
    readonly governorProfileId: string
  }
  readonly phraseSlots: readonly PhraseSlotAssignment[]
  readonly constructionEvents: readonly PerformanceEvent[]
  readonly statusEvents: readonly StatusEvent[]
  readonly ahaArtifact: typeof REPRESENTATIVE_ARTIFACT
  readonly payoff: ManifestPayoff
  readonly provenanceBundle: ManifestProvenanceBundle
  readonly compatibility: ManifestCompatibility
  readonly freshUntil: string
  readonly rights: ManifestRights
  readonly integrity: ManifestIntegrity
}

export interface ManifestCompileInput {
  readonly locale: VocalLocale
  readonly theme: string
  readonly variation: string
  readonly musicPack: string
  readonly tokenSkin: string
  readonly voiceAssignments: {
    readonly builderProfileId: string
    readonly governorProfileId: string
  }
  readonly phraseSlots: readonly PhraseSlotAssignment[]
  readonly statusEvents: readonly StatusEvent[]
  readonly provenanceBundle: ManifestProvenanceBundle
  readonly freshUntil: string
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

function isFresh(freshUntil: unknown, now = new Date()): boolean {
  if (typeof freshUntil !== 'string' || !freshUntil) return false
  try { return new Date(freshUntil) > now } catch { return false }
}

// ── Manifest compiler (deterministic — AC5) ───────────────────────────────────
export function compileManifest32Bar(input: ManifestCompileInput): PerformanceManifest32Bar {
  // constructionEvents are canonical and deterministic — derived from PERFORMANCE_EVENTS, not caller-supplied.
  const constructionEvents = PERFORMANCE_EVENTS

  // payoff is always bar 32 resolution — deterministic (AC5).
  const bar32Slot = input.phraseSlots.find(s => s.bar === TOTAL_BARS)
  const payoff: ManifestPayoff = Object.freeze({
    bar: 32,
    phraseId: bar32Slot?.phraseId ?? 'uzor-phrase-resolution-placeholder',
    locale: bar32Slot?.locale ?? input.locale,
  })

  const rights: ManifestRights = Object.freeze({
    owner: 'UzorAI/uzorai.com',
    basis: 'repository-owned',
    thirdPartyAssets: false,
  })

  const payload: Omit<PerformanceManifest32Bar, 'integrity'> = {
    kind: 'performance-manifest-32bar',
    version: MANIFEST_32BAR_VERSION,
    locale: input.locale,
    theme: input.theme,
    variation: input.variation,
    musicPack: input.musicPack,
    tokenSkin: input.tokenSkin,
    workflowVersion: UZOR_LOOP_MODEL_VERSION,
    voiceAssignments: Object.freeze({ ...input.voiceAssignments }),
    phraseSlots: Object.freeze([...input.phraseSlots].sort((a, b) => a.bar - b.bar || a.phraseSlot - b.phraseSlot)),
    constructionEvents: Object.freeze([...constructionEvents]),
    statusEvents: Object.freeze([...input.statusEvents].sort((a, b) => a.timestamp.localeCompare(b.timestamp))),
    ahaArtifact: REPRESENTATIVE_ARTIFACT,
    payoff,
    provenanceBundle: Object.freeze({ ...input.provenanceBundle }),
    compatibility: MANIFEST_COMPATIBILITY,
    freshUntil: input.freshUntil,
    rights,
  }

  const canonJson = canonicalPackJson(payload)
  if (canonJson === null) throw new Error('manifest-compile: canonical serialization failed')

  return Object.freeze({
    ...payload,
    integrity: Object.freeze({ algorithm: 'canonical-json-v1' as const, payload: canonJson }),
  })
}

// ── Manifest validator (AC4) ──────────────────────────────────────────────────
export function validateManifest32Bar(manifest: unknown, now = new Date()): readonly ManifestDiagnosticCode[] {
  const errors = new Set<ManifestDiagnosticCode>()
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['invalid-schema']
  const m = manifest as Record<string, unknown>

  // Schema shape
  if (m.kind !== 'performance-manifest-32bar') errors.add('invalid-schema')
  if (!safeText(m.version)) errors.add('invalid-schema')
  if (!safeText(m.locale)) errors.add('missing-components')
  if (!safeText(m.theme) || !safeText(m.variation)) errors.add('missing-components')
  if (!safeText(m.musicPack) || !safeText(m.tokenSkin)) errors.add('missing-components')

  // Workflow version
  if (m.workflowVersion !== UZOR_LOOP_MODEL_VERSION) errors.add('incompatible-versions')

  // Voice assignments
  const va = m.voiceAssignments as Record<string, unknown>
  if (!va || typeof va !== 'object' || Array.isArray(va)) errors.add('missing-components')
  else if (!safeId(va.builderProfileId) || !safeId(va.governorProfileId)) errors.add('missing-components')
  else if (va.builderProfileId === va.governorProfileId) errors.add('peer-type-confusion')

  // Phrase slots: must cover all 32 bars
  if (!Array.isArray(m.phraseSlots)) { errors.add('missing-components') }
  else {
    const slots = m.phraseSlots as unknown[]
    for (const slot of slots) {
      if (!slot || typeof slot !== 'object' || Array.isArray(slot)) { errors.add('invalid-schema'); continue }
      const s = slot as Record<string, unknown>
      if (!Number.isInteger(s.bar) || (s.bar as number) < 1 || (s.bar as number) > TOTAL_BARS) errors.add('bad-event-order')
      if (!safePhraseId(s.phraseId)) errors.add('missing-components')
    }
  }

  // Construction events: must be canonical 32-bar sequence
  const evErrors = validatePerformanceManifest(
    Array.isArray(m.constructionEvents) ? (m.constructionEvents as PerformanceEvent[]) : [],
    m.ahaArtifact as typeof REPRESENTATIVE_ARTIFACT,
  )
  if (evErrors.includes('duplicate-event')) errors.add('bad-event-order')
  if (evErrors.includes('overflow') || evErrors.includes('missing-phrase-slot')) errors.add('bad-event-order')
  if (evErrors.includes('duplicate-payoff')) errors.add('duplicate-bar32-payoff')
  if (evErrors.includes('unlabeled-representative-artifact')) errors.add('unlabeled-demo-artifact')
  if (evErrors.includes('incompatible-workflow-version')) errors.add('incompatible-versions')

  // Payoff must reference bar 32 only once
  if (!m.payoff || typeof m.payoff !== 'object' || Array.isArray(m.payoff)) {
    errors.add('missing-components')
  } else {
    const payoff = m.payoff as Record<string, unknown>
    if (payoff.bar !== 32) errors.add('duplicate-bar32-payoff')
    if (!safePhraseId(payoff.phraseId)) errors.add('missing-components')
    const bar32Events = Array.isArray(m.constructionEvents)
      ? (m.constructionEvents as unknown[]).filter(e => {
          if (!e || typeof e !== 'object' || Array.isArray(e)) return false
          return (e as Record<string, unknown>).bar === 32 && (e as Record<string, unknown>).phase === 'resolution'
        })
      : []
    if (bar32Events.length !== 1) errors.add('duplicate-bar32-payoff')
  }

  // Status events must be temporally ordered (not mixed with construction events)
  if (Array.isArray(m.statusEvents)) {
    let lastTs = ''
    for (const ev of m.statusEvents as unknown[]) {
      if (!ev || typeof ev !== 'object' || Array.isArray(ev)) { errors.add('invalid-schema'); continue }
      const e = ev as Record<string, unknown>
      if (!safeId(e.eventId) || !safeText(e.timestamp) || !safeText(e.actor) || !safeText(e.description)) errors.add('invalid-schema')
      const validKinds = new Set(['evidence', 'approval', 'replenishment-signal'])
      if (!validKinds.has(e.kind as string)) errors.add('invalid-schema')
      if (typeof e.timestamp === 'string' && e.timestamp < lastTs) errors.add('bad-event-order')
      if (typeof e.timestamp === 'string') lastTs = e.timestamp
    }
  }

  // Compatibility pins
  const compat = m.compatibility as Record<string, unknown>
  if (!compat || typeof compat !== 'object') errors.add('incompatible-versions')
  else {
    if (compat.performanceClock !== MANIFEST_COMPATIBILITY.performanceClock) errors.add('incompatible-versions')
    if (compat.phraseSchema !== MANIFEST_COMPATIBILITY.phraseSchema) errors.add('incompatible-versions')
    if (compat.vocalSchema !== MANIFEST_COMPATIBILITY.vocalSchema) errors.add('incompatible-versions')
    if (compat.localePackSchema !== MANIFEST_COMPATIBILITY.localePackSchema) errors.add('incompatible-versions')
    if (compat.workflowModel !== MANIFEST_COMPATIBILITY.workflowModel) errors.add('incompatible-versions')
  }

  // Provenance bundle
  const prov = m.provenanceBundle as Record<string, unknown>
  if (!prov || typeof prov !== 'object' || Array.isArray(prov)
    || !safeText(prov.approver) || !safeText(prov.approvedAt)
    || !Array.isArray(prov.sources) || (prov.sources as unknown[]).length === 0) {
    errors.add('missing-provenance')
  }

  // Rights
  const rights = m.rights as Record<string, unknown>
  if (!rights || typeof rights !== 'object' || Array.isArray(rights)
    || rights.owner !== 'UzorAI/uzorai.com' || rights.basis !== 'repository-owned' || rights.thirdPartyAssets !== false) {
    errors.add('missing-rights')
  }

  // Freshness
  if (!isFresh(m.freshUntil, now)) errors.add('stale-manifest')

  // Integrity: canonical JSON must match
  if (!m.integrity || typeof m.integrity !== 'object' || Array.isArray(m.integrity)) {
    errors.add('integrity-mismatch')
  } else {
    const integrity = m.integrity as Record<string, unknown>
    if (integrity.algorithm !== 'canonical-json-v1' || typeof integrity.payload !== 'string' || !integrity.payload) {
      errors.add('integrity-mismatch')
    } else {
      const { integrity: _int, ...rest } = m
      if (canonicalPackJson(rest) !== integrity.payload) errors.add('integrity-mismatch')
    }
  }

  return [...errors]
}
