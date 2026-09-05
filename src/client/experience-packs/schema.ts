import { dirFor, isSupportedLocale, type Dir, type LocaleCode } from '../config/languages'

export const MANIFEST_SCHEMA_VERSION = '1.0.0'
export const BASELINE_ID = 'uzor-robo-tech-rap-en'
export const BASELINE_VERSION = '1.0.0'

/** Freeze owned JSON data, including nested arrays; never freeze caller data. */
export function freezePackData<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezePackData(child)
    Object.freeze(value)
  }
  return value
}

// Exact pins, not ranges or aliases that silently move with a source update.
export const COMPATIBILITY = freezePackData({
  manifestSchema: MANIFEST_SCHEMA_VERSION,
  workflowModel: '1.0.0',
  performanceClock: '1.0.0',
  voiceCadence: 'uzor-phrase-slots-1.0.0',
} as const)

// Snapshot of the existing contracts. Tests compare these pins to source.
export const INVARIANTS = freezePackData({
  workflowOrder: ['authoring', 'governance', 'implementation-verification', 'deployment', 'learning-continuation'],
  tokenSilhouette: 'src/client/brand/uzor-mark.svg',
  boundaries: [8, 16, 32],
  totalBars: 32,
  beatsPerBar: 4,
  tempos: [90, 120, 140],
  constructionMetaphor: 'bounded-ordered-workflow-bricks',
  interactionModel: 'explicit-go-independent-muted-default-sound',
  voiceCadence: 'existing-localized-copy-canonical-phrase-slots-no-voice-asset',
  accessibility: 'reduced-motion-silent-equivalence-single-live-region',
} as const)

export const TOKEN_NAMES = ['--bg', '--surface', '--fg', '--muted', '--accent'] as const
export const TOKEN_SOURCE = 'src/client/brand/tokens.css'
export const REVIEW_EVIDENCE = 'issues/2026-09-05__feat__locale-experience-pack-foundation.scored.md'
export const PROVENANCE_SOURCES = freezePackData([
  TOKEN_SOURCE,
  'src/client/workflow/uzorLoopModel.ts',
  'src/client/performance/uzorPerformanceManifest.ts',
  'src/client/content/uzorEngineDemo.ts',
  'src/client/components/home/UzorEngineHero.tsx',
  'src/client/components/home/UzorEngineHero.css',
  'docs/uzor-audio-provenance.md',
] as const)

export interface TokenReference {
  readonly kind: 'design-token'
  readonly path: typeof TOKEN_SOURCE
  readonly token: typeof TOKEN_NAMES[number]
  readonly owner: 'UzorAI/uzorai.com'
}

export interface LocaleExperiencePack {
  readonly id: string
  readonly version: string
  readonly locale: LocaleCode
  readonly dir: Dir
  readonly compatibility: typeof COMPATIBILITY
  readonly invariants: typeof INVARIANTS
  readonly mode: 'baseline' | 'baseline-with-localized-text'
  readonly fallback: null | { readonly id: typeof BASELINE_ID; readonly version: string; readonly locale: 'en' }
  readonly rights: { readonly owner: 'UzorAI/uzorai.com'; readonly basis: 'repository-owned'; readonly thirdPartyAssets: false }
  readonly provenance: { readonly sources: readonly string[]; readonly origin: 'repository-authored-metadata'; readonly generatedMedia: false }
  readonly approval: { readonly status: 'approved'; readonly scope: 'baseline-metadata-only'; readonly evidence: typeof REVIEW_EVIDENCE; readonly culturalAssets: 'deferred-to-child-review' }
  readonly content: null | {
    readonly name: 'English Robo Tech Rap'
    readonly arrangement: readonly string[]
    readonly assets: readonly TokenReference[]
  }
  /** Exact canonical payload seal, not a cryptographic signature or approval. */
  readonly integrity: { readonly algorithm: 'canonical-json-v1'; readonly payload: string }
}

export type PackReasonCode =
  | 'invalid-manifest' | 'invalid-version' | 'invalid-locale' | 'direction-mismatch'
  | 'missing-compatibility' | 'incompatible-contract' | 'invariant-change'
  | 'missing-rights' | 'missing-provenance' | 'missing-approval'
  | 'missing-integrity' | 'integrity-mismatch' | 'unsafe-asset-reference'
  | 'duplicate-locale' | 'invalid-fallback' | 'missing-pack' | 'stale-pack' | 'unapproved-pack'

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype
}

/** Canonical JSON for plain data only; rejects cycles, excessive depth and non-JSON values. */
export function canonicalPackJson(value: unknown, ancestors: readonly object[] = []): string | null {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number') return Number.isFinite(value) ? JSON.stringify(value) : null
  if ((!record(value) && !Array.isArray(value)) || ancestors.includes(value) || ancestors.length >= 64) return null
  if (Object.getOwnPropertySymbols(value).length) return null
  if (Array.isArray(value) && Object.getOwnPropertyNames(value).length !== value.length + 1) return null
  const next = [...ancestors, value]
  const keys = Array.isArray(value) ? Array.from({ length: value.length }, (_, i) => String(i)) : Object.keys(value).sort()
  const parts: string[] = []
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (!descriptor || !('value' in descriptor)) return null
    const encoded = canonicalPackJson(descriptor.value, next)
    if (encoded === null) return null
    parts.push(Array.isArray(value) ? encoded : `${JSON.stringify(key)}:${encoded}`)
  }
  return Array.isArray(value) ? `[${parts.join(',')}]` : `{${parts.join(',')}}`
}

function same(a: unknown, b: unknown): boolean {
  const encoded = canonicalPackJson(a)
  return encoded !== null && encoded === canonicalPackJson(b)
}

function keysAre(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return same(Object.keys(value).sort(), [...keys].sort())
}

export function isPackVersion(value: unknown): value is string {
  // Publication uses stable SemVer releases; prereleases are not launchable.
  return typeof value === 'string' && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)
}

export function sealPack(payload: Omit<LocaleExperiencePack, 'integrity'>): LocaleExperiencePack {
  return freezePackData({ ...payload, integrity: { algorithm: 'canonical-json-v1' as const, payload: canonicalPackJson(payload)! } })
}

/** Pure structural validation of untrusted JSON. Publication also requires a pinned catalog match. */
export function validatePack(value: unknown): readonly PackReasonCode[] {
  if (!record(value) || canonicalPackJson(value) === null) return ['invalid-manifest']
  const errors: PackReasonCode[] = []
  const add = (code: PackReasonCode) => { if (!errors.includes(code)) errors.push(code) }
  if (!keysAre(value, ['id', 'version', 'locale', 'dir', 'compatibility', 'invariants', 'mode', 'fallback', 'rights', 'provenance', 'approval', 'content', 'integrity'])
    || typeof value.id !== 'string' || !/^uzor-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id)) add('invalid-manifest')
  if (!isPackVersion(value.version)) add('invalid-version')
  if (typeof value.locale !== 'string' || !isSupportedLocale(value.locale)) add('invalid-locale')
  else if (value.dir !== dirFor(value.locale)) add('direction-mismatch')
  if (!record(value.compatibility) || Object.keys(COMPATIBILITY).some(key => !value.compatibility || !(key in (value.compatibility as object)))) add('missing-compatibility')
  else if (!same(value.compatibility, COMPATIBILITY)) add('incompatible-contract')
  if (!same(value.invariants, INVARIANTS)) add('invariant-change')
  if (!same(value.rights, { owner: 'UzorAI/uzorai.com', basis: 'repository-owned', thirdPartyAssets: false })) add('missing-rights')
  if (!same(value.provenance, { sources: PROVENANCE_SOURCES, origin: 'repository-authored-metadata', generatedMedia: false })) add('missing-provenance')
  if (!same(value.approval, { status: 'approved', scope: 'baseline-metadata-only', evidence: REVIEW_EVIDENCE, culturalAssets: 'deferred-to-child-review' })) add('missing-approval')
  if (value.mode === 'baseline') {
    if (value.id !== BASELINE_ID || value.locale !== 'en' || value.fallback !== null) add('invalid-fallback')
    if (!record(value.content) || !keysAre(value.content, ['name', 'arrangement', 'assets'])
      || value.content.name !== 'English Robo Tech Rap' || !Array.isArray(value.content.arrangement)
      || value.content.arrangement.length !== 4 || !value.content.arrangement.every(line => typeof line === 'string' && line.trim().length > 0)) add('invalid-manifest')
    if (!record(value.content) || !Array.isArray(value.content.assets) || value.content.assets.length !== TOKEN_NAMES.length) add('unsafe-asset-reference')
    else {
      const tokens = new Set<string>()
      for (const asset of value.content.assets) {
        if (!record(asset) || !keysAre(asset, ['kind', 'path', 'token', 'owner'])
          || asset.kind !== 'design-token' || asset.path !== TOKEN_SOURCE || asset.owner !== 'UzorAI/uzorai.com'
          || !TOKEN_NAMES.includes(asset.token as typeof TOKEN_NAMES[number]) || tokens.has(String(asset.token))) add('unsafe-asset-reference')
        else tokens.add(String(asset.token))
      }
    }
  } else if (value.mode === 'baseline-with-localized-text') {
    if (value.locale === 'en' || value.id === BASELINE_ID || !same(value.fallback, { id: BASELINE_ID, version: BASELINE_VERSION, locale: 'en' })) add('invalid-fallback')
    if (value.content !== null) add('unsafe-asset-reference')
  } else add('invalid-fallback')
  const { integrity, ...payload } = value
  if (!record(integrity) || !keysAre(integrity, ['algorithm', 'payload']) || integrity.algorithm !== 'canonical-json-v1' || typeof integrity.payload !== 'string' || !integrity.payload) add('missing-integrity')
  else if (integrity.payload !== canonicalPackJson(payload)) add('integrity-mismatch')
  return errors
}

/** Validate the whole supplied registry, including duplicates and exact local fallback targets. */
export function validateRegistry(value: unknown): readonly PackReasonCode[] {
  if (!Array.isArray(value) || canonicalPackJson(value) === null) return ['invalid-manifest']
  const errors = new Set<PackReasonCode>()
  const locales = new Set<unknown>()
  for (const entry of value) {
    for (const code of validatePack(entry)) errors.add(code)
    if (!record(entry)) continue
    if (locales.has(entry.locale)) errors.add('duplicate-locale')
    locales.add(entry.locale)
    if (entry.mode === 'baseline-with-localized-text') {
      const fallback = entry.fallback
      const targets = record(fallback) ? value.filter(target => record(target) && target.id === fallback.id && target.version === fallback.version && target.locale === fallback.locale) : []
      if (targets.length !== 1 || targets[0].mode !== 'baseline' || validatePack(targets[0]).length) errors.add('invalid-fallback')
    }
  }
  return [...errors]
}
