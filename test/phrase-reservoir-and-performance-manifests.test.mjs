import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PHRASE_SCHEMA_VERSION,
  isFactTransitionLegal,
  isPhraseTransitionLegal,
  validateFact,
  validateFactTransition,
  validatePhrase,
  validatePhraseTransition,
  validatePhraseCollection,
} from '../src/client/performance/phrase/schema.ts'
import {
  RESERVOIR_VERSION,
  checkInventory,
  emitReplenishmentSignal,
  getPublishablePhrases,
  isDistributionBlocked,
} from '../src/client/performance/phrase/reservoir.ts'
import {
  MANIFEST_32BAR_VERSION,
  MANIFEST_COMPATIBILITY,
  compileManifest32Bar,
  validateManifest32Bar,
} from '../src/client/performance/manifest/compiler.ts'
import { UZOR_LOOP_MODEL_VERSION } from '../src/client/workflow/uzorLoopModel.ts'
import { PERFORMANCE_VERSION } from '../src/client/performance/uzorPerformanceManifest.ts'
import { MANIFEST_SCHEMA_VERSION } from '../src/client/experience-packs/schema.ts'
import { VOCAL_SCHEMA_VERSION } from '../src/client/performance/vocal/schema.ts'

// ── Fixture helpers ───────────────────────────────────────────────────────────
const FAR_FUTURE = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
const PAST = new Date(Date.now() - 1000).toISOString()

function makeFact(overrides = {}) {
  return {
    id: 'fact-a',
    state: 'approved',
    claim: 'UZOR delivers deterministic performance artifacts',
    claimMeaning: 'deterministic-artifact-delivery',
    locale: 'en',
    source: {
      sourceId: 'src-a',
      origin: 'UzorAI/uzorai.com',
      snapshot: 'commit-abc123',
      retrievedAt: '2026-09-05T00:00:00Z',
    },
    verificationOwner: 'daniel-silvers',
    verifiedAt: '2026-09-04T00:00:00Z',
    approvedAt: '2026-09-05T00:00:00Z',
    freshUntil: FAR_FUTURE,
    supersededBy: null,
    provenanceChain: ['src-a'],
    ...overrides,
  }
}

function makePhrase(overrides = {}) {
  return {
    phraseId: 'uzor-phrase-deterministic-delivery-en',
    state: 'approved',
    locale: 'en',
    text: 'UZOR delivers verified performance manifests deterministically',
    capabilityFactId: 'fact-a',
    provenanceChain: ['src-a', 'fact-a'],
    rhythmPattern: 'eight-beat-lyric-medium',
    approvedAt: '2026-09-05T00:00:00Z',
    freshUntil: FAR_FUTURE,
    supersededBy: null,
    rights: { basis: 'repository-owned', clearanceEvidence: 'issues/2026-09-05__feat__verified-phrase-reservoir-and-32-bar-performance-manifests.scored.md' },
    ...overrides,
  }
}

function makeReservoir(phrases = [makePhrase()], policy = { lowWatermark: 2, maxCapacity: 100 }) {
  return { version: RESERVOIR_VERSION, phrases, inventoryPolicy: policy }
}

const PROVENANCE_BUNDLE = Object.freeze({
  specVersion: PHRASE_SCHEMA_VERSION,
  phraseSchemaVersion: PHRASE_SCHEMA_VERSION,
  vocalSchemaVersion: VOCAL_SCHEMA_VERSION,
  packSchemaVersion: MANIFEST_SCHEMA_VERSION,
  workflowModelVersion: UZOR_LOOP_MODEL_VERSION,
  sources: ['issues/2026-09-05__feat__verified-phrase-reservoir-and-32-bar-performance-manifests.scored.md'],
  approvedAt: '2026-09-05T00:00:00Z',
  approver: 'daniel-silvers',
})

function makeCompileInput(overrides = {}) {
  return {
    locale: 'en',
    theme: 'robo-tech-rap',
    variation: 'v1',
    musicPack: 'uzor-music-default',
    tokenSkin: 'uzor-token-default',
    voiceAssignments: { builderProfileId: 'builder-a', governorProfileId: 'governor-b' },
    phraseSlots: Array.from({ length: 32 }, (_, i) => ({
      bar: i + 1,
      phraseSlot: 1,
      phraseId: `uzor-phrase-bar-${i + 1}`,
      locale: 'en',
    })),
    statusEvents: [],
    provenanceBundle: PROVENANCE_BUNDLE,
    freshUntil: FAR_FUTURE,
    ...overrides,
  }
}

// ── AC1: State-machine covers every transition; forbids skipping ──────────────
test('AC1: fact transitions — legal paths', () => {
  assert.ok(isFactTransitionLegal('draft', 'verified'))
  assert.ok(isFactTransitionLegal('verified', 'approved'))
  assert.ok(isFactTransitionLegal('verified', 'superseded'))
  assert.ok(isFactTransitionLegal('approved', 'superseded'))
})

test('AC1: fact transitions — skipping forbidden', () => {
  assert.ok(!isFactTransitionLegal('draft', 'approved'), 'draft→approved skip forbidden')
  assert.ok(!isFactTransitionLegal('draft', 'superseded'), 'draft→superseded skip forbidden')
  assert.ok(!isFactTransitionLegal('superseded', 'approved'), 'superseded cannot resume')
  assert.ok(!isFactTransitionLegal('approved', 'draft'), 'approved cannot revert to draft')
})

test('AC1: phrase transitions — legal paths', () => {
  assert.ok(isPhraseTransitionLegal('candidate', 'approved'))
  assert.ok(isPhraseTransitionLegal('candidate', 'quarantined'))
  assert.ok(isPhraseTransitionLegal('approved', 'superseded'))
  assert.ok(isPhraseTransitionLegal('approved', 'quarantined'))
})

test('AC1: phrase transitions — skipping forbidden', () => {
  assert.ok(!isPhraseTransitionLegal('candidate', 'superseded'), 'candidate→superseded skip forbidden')
  assert.ok(!isPhraseTransitionLegal('quarantined', 'approved'), 'quarantined cannot be re-approved')
  assert.ok(!isPhraseTransitionLegal('superseded', 'approved'), 'superseded cannot resume')
})

test('AC1: validateFactTransition returns illegal-transition on skip', () => {
  const fact = makeFact({ state: 'draft' })
  assert.deepEqual(validateFactTransition(fact, 'approved'), ['illegal-transition'])
  assert.deepEqual(validateFactTransition(fact, 'verified'), [])
})

test('AC1: validatePhraseTransition returns illegal-transition on skip', () => {
  const phrase = makePhrase({ state: 'candidate' })
  assert.deepEqual(validatePhraseTransition(phrase, 'superseded'), ['illegal-transition'])
  assert.deepEqual(validatePhraseTransition(phrase, 'approved'), [])
})

// ── AC2: Provenance traces claim to approved fact ─────────────────────────────
test('AC2: valid phrase with approved fact has no errors', () => {
  const approvedFactIds = new Set(['fact-a'])
  const errors = validatePhrase(makePhrase(), approvedFactIds)
  assert.deepEqual([...errors], [], `Unexpected errors: ${errors.join(', ')}`)
})

test('AC2: phrase with unknown capabilityFactId fails factual-fail', () => {
  const approvedFactIds = new Set(['fact-b'])
  const errors = validatePhrase(makePhrase({ capabilityFactId: 'fact-unknown' }), approvedFactIds)
  assert.ok(errors.includes('factual-fail'))
})

test('AC2: phrase missing provenance chain fails missing-provenance', () => {
  const errors = validatePhrase(makePhrase({ provenanceChain: [] }))
  assert.ok(errors.includes('missing-provenance'))
})

test('AC2: fact missing provenance source fails missing-provenance', () => {
  const errors = validateFact(makeFact({ source: null }))
  assert.ok(errors.includes('missing-provenance'))
})

// ── AC3: All 8 validators fail closed ────────────────────────────────────────
test('AC3: semantic-fail on trivially short phrase text', () => {
  const errors = validatePhrase(makePhrase({ text: 'UZOR works' }))
  assert.ok(errors.includes('semantic-fail'))
})

test('AC3: factual-fail when no approved fact registry supplied and id is invalid', () => {
  const errors = validatePhrase(makePhrase({ capabilityFactId: 'INVALID ID!' }))
  assert.ok(errors.includes('factual-fail'))
})

test('AC3: rhythmic-fail on invalid rhythm pattern', () => {
  const errors = validatePhrase(makePhrase({ rhythmPattern: 'INVALID PATTERN!!!' }))
  assert.ok(errors.includes('rhythmic-fail'))
})

test('AC3: locale-mismatch on unsupported locale', () => {
  const errors = validatePhrase(makePhrase({ locale: 'xx' }))
  assert.ok(errors.includes('locale-mismatch'))
})

test('AC3: duplicate-fail detected across collection', () => {
  const p1 = makePhrase()
  const p2 = makePhrase()
  const errors = validatePhraseCollection([p1, p2])
  assert.ok(errors.includes('duplicate'))
})

test('AC3: safety-fail on injection pattern in text', () => {
  const errors = validatePhrase(makePhrase({ text: '<script>alert(1)</script> valid words here' }))
  assert.ok(errors.includes('safety-fail'))
})

test('AC3: rights-fail on invalid rights basis', () => {
  const errors = validatePhrase(makePhrase({ rights: { basis: 'unknown-basis', clearanceEvidence: 'evidence' } }))
  assert.ok(errors.includes('rights-fail'))
})

test('AC3: stale-phrase on expired freshUntil', () => {
  const errors = validatePhrase(makePhrase({ freshUntil: PAST }))
  assert.ok(errors.includes('stale-phrase'))
})

test('AC3: fact missing-verification-owner fails', () => {
  const errors = validateFact(makeFact({ verificationOwner: '' }))
  assert.ok(errors.includes('missing-verification-owner'))
})

test('AC3: fact missing-freshness fails on empty freshUntil', () => {
  const errors = validateFact(makeFact({ freshUntil: '' }))
  assert.ok(errors.includes('missing-freshness'))
})

test('AC3: fact stale-fact fails on past freshUntil', () => {
  const errors = validateFact(makeFact({ freshUntil: PAST }))
  assert.ok(errors.includes('stale-fact'))
})

// ── AC4: Manifest validation rejects governed malformed shapes ────────────────
test('AC4: valid compiled manifest passes validation', () => {
  const manifest = compileManifest32Bar(makeCompileInput())
  const errors = validateManifest32Bar(manifest, new Date(Date.now() - 1000))
  assert.deepEqual([...errors], [], `Unexpected errors: ${errors.join(', ')}`)
})

test('AC4: mismatched builderProfileId and governorProfileId (peer-type-confusion)', () => {
  const manifest = compileManifest32Bar(makeCompileInput({
    voiceAssignments: { builderProfileId: 'same-profile', governorProfileId: 'same-profile' },
  }))
  const errors = validateManifest32Bar(manifest, new Date(Date.now() - 1000))
  assert.ok(errors.includes('peer-type-confusion'))
})

test('AC4: stale manifest rejected', () => {
  const manifest = compileManifest32Bar(makeCompileInput({ freshUntil: PAST }))
  const errors = validateManifest32Bar(manifest)
  assert.ok(errors.includes('stale-manifest'))
})

test('AC4: manifest with wrong workflow version fails incompatible-versions', () => {
  const manifest = compileManifest32Bar(makeCompileInput())
  const tampered = { ...manifest, workflowVersion: '0.0.0', integrity: undefined }
  const errors = validateManifest32Bar(tampered, new Date(Date.now() - 1000))
  assert.ok(errors.includes('incompatible-versions'))
})

test('AC4: tampered integrity payload fails integrity-mismatch', () => {
  const manifest = compileManifest32Bar(makeCompileInput())
  const tampered = { ...manifest, integrity: { algorithm: 'canonical-json-v1', payload: 'tampered' } }
  const errors = validateManifest32Bar(tampered, new Date(Date.now() - 1000))
  assert.ok(errors.includes('integrity-mismatch'))
})

test('AC4: missing provenanceBundle fails missing-provenance', () => {
  const manifest = compileManifest32Bar(makeCompileInput())
  const { provenanceBundle: _, integrity: _i, ...rest } = manifest
  const errors = validateManifest32Bar(rest, new Date(Date.now() - 1000))
  assert.ok(errors.includes('missing-provenance'))
})

// ── AC5: Deterministic — identical inputs yield identical manifest/hash ────────
test('AC5: two compilations from same input yield identical manifest', () => {
  const input = makeCompileInput()
  const m1 = compileManifest32Bar(input)
  const m2 = compileManifest32Bar(input)
  assert.equal(m1.integrity.payload, m2.integrity.payload)
  assert.deepEqual(m1, m2)
})

test('AC5: different variation produces different hash', () => {
  const m1 = compileManifest32Bar(makeCompileInput({ variation: 'v1' }))
  const m2 = compileManifest32Bar(makeCompileInput({ variation: 'v2' }))
  assert.notEqual(m1.integrity.payload, m2.integrity.payload)
})

// ── AC6: Inventory-low emits signal; no LLM, no browser call ─────────────────
test('AC6: signal emitted when publishable phrases below low-watermark', () => {
  const reservoir = makeReservoir([makePhrase()], { lowWatermark: 5, maxCapacity: 100 })
  const signal = emitReplenishmentSignal(reservoir)
  assert.ok(signal !== null)
  assert.equal(signal.kind, 'replenishment-signal')
  assert.equal(signal.publishable, 1)
  assert.equal(signal.lowWatermark, 5)
})

test('AC6: no signal when inventory is above watermark', () => {
  const phrases = Array.from({ length: 5 }, (_, i) =>
    makePhrase({ phraseId: `uzor-phrase-bar-${i + 1}-en`, capabilityFactId: `fact-${i}` })
  )
  const reservoir = makeReservoir(phrases, { lowWatermark: 3, maxCapacity: 100 })
  const signal = emitReplenishmentSignal(reservoir)
  assert.equal(signal, null)
})

test('AC6: checkInventory is a pure read — no fetch, no LLM', async () => {
  const src = await import('node:fs').then(fs =>
    fs.readFileSync(new URL('../src/client/performance/phrase/reservoir.ts', import.meta.url), 'utf8')
  )
  assert.doesNotMatch(src, /\bfetch\s*\(|https?:\/\/|openai|anthropic/i)
})

// ── AC7: Superseded/stale facts stop distribution; active cycles finish safely ─
test('AC7: superseded phrase is excluded from publishable set', () => {
  const reservoir = makeReservoir([
    makePhrase({ phraseId: 'uzor-phrase-active-en' }),
    makePhrase({ phraseId: 'uzor-phrase-superseded-en', state: 'superseded', supersededBy: 'uzor-phrase-active-en' }),
  ])
  const publishable = getPublishablePhrases(reservoir)
  assert.equal(publishable.length, 1)
  assert.equal(publishable[0].phraseId, 'uzor-phrase-active-en')
})

test('AC7: stale phrase (past freshUntil) is excluded from publishable set', () => {
  const reservoir = makeReservoir([
    makePhrase({ phraseId: 'uzor-phrase-fresh-en' }),
    makePhrase({ phraseId: 'uzor-phrase-stale-en', freshUntil: PAST }),
  ])
  const publishable = getPublishablePhrases(reservoir)
  assert.equal(publishable.length, 1)
  assert.equal(publishable[0].phraseId, 'uzor-phrase-fresh-en')
})

test('AC7: isDistributionBlocked true for superseded phrase', () => {
  assert.ok(isDistributionBlocked(makePhrase({ state: 'superseded', supersededBy: 'other' })))
})

test('AC7: isDistributionBlocked false for healthy approved phrase', () => {
  assert.ok(!isDistributionBlocked(makePhrase()))
})

test('AC7: quarantined phrase is blocked', () => {
  assert.ok(isDistributionBlocked(makePhrase({ state: 'quarantined', supersededBy: null })))
})

// ── Compatibility pins match existing contracts ───────────────────────────────
test('compatibility: performanceClock pin matches PERFORMANCE_VERSION', () => {
  assert.equal(MANIFEST_COMPATIBILITY.performanceClock, PERFORMANCE_VERSION)
})

test('compatibility: workflowModel pin matches UZOR_LOOP_MODEL_VERSION', () => {
  assert.equal(MANIFEST_COMPATIBILITY.workflowModel, UZOR_LOOP_MODEL_VERSION)
})

test('compatibility: localePackSchema pin matches MANIFEST_SCHEMA_VERSION', () => {
  assert.equal(MANIFEST_COMPATIBILITY.localePackSchema, MANIFEST_SCHEMA_VERSION)
})

test('compatibility: vocalSchema pin matches VOCAL_SCHEMA_VERSION', () => {
  assert.equal(MANIFEST_COMPATIBILITY.vocalSchema, VOCAL_SCHEMA_VERSION)
})

test('compatibility: phraseSchema pin matches PHRASE_SCHEMA_VERSION', () => {
  assert.equal(MANIFEST_COMPATIBILITY.phraseSchema, PHRASE_SCHEMA_VERSION)
})

// ── No browser secrets in new modules ────────────────────────────────────────
test('no browser secrets in phrase schema or reservoir', async () => {
  const { readFileSync } = await import('node:fs')
  const { fileURLToPath } = await import('node:url')
  const base = fileURLToPath(new URL('..', import.meta.url))
  for (const path of ['src/client/performance/phrase/schema.ts', 'src/client/performance/phrase/reservoir.ts', 'src/client/performance/manifest/compiler.ts']) {
    const src = readFileSync(`${base}${path}`, 'utf8')
    assert.doesNotMatch(src, /\bfetch\s*\(|https?:\/\//, `${path} must not fetch`)
    assert.doesNotMatch(src, /process\.env|import\.meta\.env/, `${path} must not read env`)
  }
})
