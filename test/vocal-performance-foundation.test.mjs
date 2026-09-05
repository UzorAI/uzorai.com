import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LANGUAGES } from '../src/client/config/languages.ts'
import { PERFORMANCE_VERSION } from '../src/client/performance/uzorPerformanceManifest.ts'
import { MANIFEST_SCHEMA_VERSION, COMPATIBILITY } from '../src/client/experience-packs/schema.ts'
import { UZOR_LOOP_MODEL_VERSION } from '../src/client/workflow/uzorLoopModel.ts'
import {
  VOCAL_SCHEMA_VERSION,
  VOCAL_SUPPORTED_LOCALES,
  VOCAL_ROLES,
  VOCAL_COMPATIBILITY,
  validateProfile,
  validateCue,
  validateCueCollection,
  validateCompatibility,
} from '../src/client/performance/vocal/schema.ts'
import { resolveVocalCue, resolveAllLocales } from '../src/client/performance/vocal/resolve.ts'
import { VOCAL_CATALOG } from '../src/client/performance/vocal/catalog.ts'

// ── Fixture helpers ───────────────────────────────────────────────────────────

const ALL_LOCALES = LANGUAGES.map(l => l.code)

function makeProfile(id, overrides = {}) {
  return {
    id,
    version: '1.0.0',
    schemaVersion: VOCAL_SCHEMA_VERSION,
    locales: [...ALL_LOCALES],
    rights: { owner: 'UzorAI/uzorai.com', basis: 'repository-owned', thirdPartyAssets: false, clearanceEvidence: 'issues/fixture-evidence.md' },
    provenance: { origin: 'repository-fixture', sources: ['test/vocal-performance-foundation.test.mjs'], generatedMedia: false, recordingConsent: false },
    approval: { status: 'approved', scope: 'test-fixture-only', evidence: 'test/vocal-performance-foundation.test.mjs', approvedAt: '2026-09-05' },
    ...overrides,
  }
}

function makeCue(id, bar, phase, builderProfileId, governorProfileId) {
  return {
    id,
    clockSlot: { bar, beat: 1, phase },
    phraseRef: { phraseId: 'uzor-phrase-fixture-a', phraseSlot: 1 },
    builderProfileId,
    governorProfileId,
    captions: ALL_LOCALES.map(locale => ({ locale, text: `Fixture caption [${locale}] for ${id}`, srPolicy: 'once-on-enter' })),
  }
}

const PROFILE_A = makeProfile('profile-a')
const PROFILE_B = makeProfile('profile-b')
const FIXTURE_PROFILES = [PROFILE_A, PROFILE_B]
const FIXTURE_CUE_CALL = makeCue('cue-call', 1, 'orientation', 'profile-a', 'profile-b')
const FIXTURE_CUE_RESPONSE = makeCue('cue-response', 5, 'orientation', 'profile-a', 'profile-b')
const COMPAT = VOCAL_COMPATIBILITY

// ── Schema contract pins ──────────────────────────────────────────────────────

test('compatibility pins match existing canonical contracts', () => {
  assert.equal(VOCAL_COMPATIBILITY.performanceClock, PERFORMANCE_VERSION)
  assert.equal(VOCAL_COMPATIBILITY.localePackSchema, MANIFEST_SCHEMA_VERSION)
  assert.equal(VOCAL_COMPATIBILITY.workflowModel, UZOR_LOOP_MODEL_VERSION)
  assert.equal(VOCAL_COMPATIBILITY.voiceCadence, COMPATIBILITY.voiceCadence)
})

test('exactly eight launch locales are supported', () => {
  assert.deepEqual([...VOCAL_SUPPORTED_LOCALES], ['en', 'es', 'ru', 'zh', 'ar', 'he', 'fr', 'uk'])
  assert.equal(VOCAL_SUPPORTED_LOCALES.length, 8)
})

test('only builder and governor are valid roles', () => {
  assert.deepEqual([...VOCAL_ROLES], ['builder', 'governor'])
})

// ── AC1: Either profile can serve either role with identical semantics ────────

test('AC1: profile-a as builder with profile-b as governor resolves successfully', () => {
  const result = resolveVocalCue(FIXTURE_CUE_CALL, FIXTURE_PROFILES, 'en', COMPAT)
  assert.equal(result.kind, 'vocal-plan')
  assert.equal(result.builderProfileId, 'profile-a')
  assert.equal(result.governorProfileId, 'profile-b')
  assert.equal(result.cueId, 'cue-call')
})

test('AC1: profile-b as builder with profile-a as governor resolves with identical role semantics', () => {
  const cueSwapped = { ...FIXTURE_CUE_CALL, id: 'cue-call-swapped', builderProfileId: 'profile-b', governorProfileId: 'profile-a' }
  const result = resolveVocalCue(cueSwapped, FIXTURE_PROFILES, 'en', COMPAT)
  assert.equal(result.kind, 'vocal-plan')
  assert.equal(result.builderProfileId, 'profile-b')
  assert.equal(result.governorProfileId, 'profile-a')
  assert.equal(result.clockSlot.bar, FIXTURE_CUE_CALL.clockSlot.bar)
})

test('AC1: no gender field exists on profiles or in resolution', () => {
  assert.ok(!('gender' in PROFILE_A))
  assert.ok(!('gender' in PROFILE_B))
  const result = resolveVocalCue(FIXTURE_CUE_CALL, FIXTURE_PROFILES, 'en', COMPAT)
  assert.ok(!('gender' in result))
})

test('AC1: profile validation rejects any gender field as unknown key', () => {
  const badProfile = makeProfile('profile-with-gender', { gender: 'any' })
  const errors = validateProfile(badProfile)
  assert.ok(errors.includes('invalid-schema'))
})

// ── AC2: Cue order preserves declared bar/beat order ─────────────────────────

test('AC2: call (bar 1) and response (bar 5) retain declared order in collection', () => {
  const errors = validateCueCollection([FIXTURE_CUE_CALL, FIXTURE_CUE_RESPONSE])
  assert.deepEqual([...errors], [])
})

test('AC2: reversed cue order (bar 5 before bar 1) fails collection validation', () => {
  const errors = validateCueCollection([FIXTURE_CUE_RESPONSE, FIXTURE_CUE_CALL])
  assert.ok(errors.includes('timing-overflow'))
})

test('AC2: resolved plans preserve the clock slot declared in the cue', () => {
  const callResult = resolveVocalCue(FIXTURE_CUE_CALL, FIXTURE_PROFILES, 'en', COMPAT)
  const responseResult = resolveVocalCue(FIXTURE_CUE_RESPONSE, FIXTURE_PROFILES, 'en', COMPAT)
  assert.equal(callResult.clockSlot.bar, 1)
  assert.equal(responseResult.clockSlot.bar, 5)
})

// ── AC3: Invalid inputs are rejected with stable diagnostics ─────────────────

test('AC3: incompatible version pins are rejected', () => {
  const badCompat = { ...COMPAT, performanceClock: '9.9.9' }
  const result = resolveVocalCue(FIXTURE_CUE_CALL, FIXTURE_PROFILES, 'en', badCompat)
  assert.equal(result.kind, 'caption-only')
  assert.ok(result.diagnostics.includes('incompatible-version'))
})

test('AC3: unapproved profile status is rejected', () => {
  const badProfile = makeProfile('profile-unapproved', { approval: { status: 'pending', scope: 'test', evidence: 'test.md', approvedAt: '2026-09-05' } })
  const cue = { ...FIXTURE_CUE_CALL, builderProfileId: 'profile-unapproved' }
  const result = resolveVocalCue(cue, [badProfile, PROFILE_B], 'en', COMPAT)
  assert.equal(result.kind, 'caption-only')
  assert.ok(result.diagnostics.includes('unapproved-profile'))
})

test('AC3: missing provenance is rejected', () => {
  const badProfile = makeProfile('profile-no-prov')
  delete badProfile.provenance
  const errors = validateProfile(badProfile)
  assert.ok(errors.includes('missing-provenance'))
})

test('AC3: missing rights is rejected', () => {
  const badProfile = makeProfile('profile-no-rights')
  delete badProfile.rights
  const errors = validateProfile(badProfile)
  assert.ok(errors.includes('missing-rights'))
})

test('AC3: unsupported locale in cue caption is rejected', () => {
  const badCue = { ...FIXTURE_CUE_CALL, captions: [{ locale: 'xx', text: 'bad', srPolicy: 'once-on-enter' }] }
  const errors = validateCue(badCue)
  assert.ok(errors.includes('unsupported-locale'))
})

test('AC3: unsafe HTML in caption text is rejected', () => {
  const badCue = { ...FIXTURE_CUE_CALL, captions: [{ locale: 'en', text: '<script>alert(1)</script>', srPolicy: 'once-on-enter' }] }
  const errors = validateCue(badCue)
  assert.ok(errors.includes('invalid-schema'))
})

test('AC3: duplicate cue IDs are rejected in collection', () => {
  const errors = validateCueCollection([FIXTURE_CUE_CALL, { ...FIXTURE_CUE_CALL, clockSlot: { ...FIXTURE_CUE_CALL.clockSlot, bar: 2 } }])
  assert.ok(errors.includes('duplicate-cue'))
})

test('AC3: bar overflow (>32) is rejected', () => {
  const badCue = { ...FIXTURE_CUE_CALL, id: 'bad-overflow', clockSlot: { bar: 33, beat: 1, phase: 'orientation' } }
  const errors = validateCue(badCue)
  assert.ok(errors.includes('timing-overflow'))
})

test('AC3: bar underflow (<1) is rejected', () => {
  const badCue = { ...FIXTURE_CUE_CALL, id: 'bad-underflow', clockSlot: { bar: 0, beat: 1, phase: 'orientation' } }
  const errors = validateCue(badCue)
  assert.ok(errors.includes('timing-overflow'))
})

test('AC3: invalid phrase ID syntax is rejected', () => {
  const badCue = { ...FIXTURE_CUE_CALL, phraseRef: { phraseId: 'not-uzor-phrase', phraseSlot: 1 } }
  const errors = validateCue(badCue)
  assert.ok(errors.includes('invalid-phrase-ref'))
})

test('AC3: unknown keys on profile are rejected', () => {
  const badProfile = makeProfile('profile-extra', { extraKey: 'bad' })
  const errors = validateProfile(badProfile)
  assert.ok(errors.includes('invalid-schema'))
})

test('AC3: incompatible-version is a stable code', () => {
  const errors = validateCompatibility({ performanceClock: '0.0.0', localePackSchema: '1.0.0', workflowModel: '1.0.0', voiceCadence: 'uzor-phrase-slots-1.0.0' })
  assert.ok(errors.includes('incompatible-version'))
})

// ── AC4: Missing/unavailable profile yields caption-only ─────────────────────

test('AC4: missing builder profile yields caption-only plan', () => {
  const cue = { ...FIXTURE_CUE_CALL, builderProfileId: 'profile-nonexistent' }
  const result = resolveVocalCue(cue, [PROFILE_B], 'en', COMPAT)
  assert.equal(result.kind, 'caption-only')
  assert.ok(result.diagnostics.includes('unapproved-profile'))
  assert.ok(result.diagnostics.includes('caption-only-fallback'))
})

test('AC4: empty profile catalog yields caption-only with same clock slot', () => {
  const result = resolveVocalCue(FIXTURE_CUE_CALL, [], 'en', COMPAT)
  assert.equal(result.kind, 'caption-only')
  assert.equal(result.clockSlot.bar, FIXTURE_CUE_CALL.clockSlot.bar)
  assert.equal(result.clockSlot.beat, FIXTURE_CUE_CALL.clockSlot.beat)
})

test('AC4: caption-only result always includes caption-only-fallback diagnostic', () => {
  const result = resolveVocalCue(FIXTURE_CUE_CALL, [], 'en', COMPAT)
  assert.equal(result.kind, 'caption-only')
  assert.ok(result.diagnostics.includes('caption-only-fallback'))
})

// ── AC5: All eight locales resolve caption metadata ───────────────────────────

test('AC5: all eight locales resolve a caption (vocal-plan path)', () => {
  const allResults = resolveAllLocales(FIXTURE_CUE_CALL, FIXTURE_PROFILES, COMPAT)
  for (const lang of LANGUAGES) {
    const result = allResults.get(lang.code)
    assert.ok(result, `no result for locale ${lang.code}`)
    assert.ok(result.caption, `no caption for locale ${lang.code}`)
    assert.ok(typeof result.caption.text === 'string' && result.caption.text.length > 0, `empty caption for ${lang.code}`)
    assert.ok(result.caption.srPolicy === 'once-on-enter' || result.caption.srPolicy === 'suppress-if-audio-present')
  }
})

test('AC5: all eight locales resolve a caption (caption-only path)', () => {
  const allResults = resolveAllLocales(FIXTURE_CUE_CALL, [], COMPAT)
  for (const lang of LANGUAGES) {
    const result = allResults.get(lang.code)
    assert.ok(result, `no result for locale ${lang.code}`)
    assert.equal(result.kind, 'caption-only')
    assert.ok(result.caption.text.length > 0)
  }
})

test('AC5: missing locale caption falls back to English caption', () => {
  const cueEnOnly = { ...FIXTURE_CUE_CALL, captions: [{ locale: 'en', text: 'English only', srPolicy: 'once-on-enter' }] }
  const result = resolveVocalCue(cueEnOnly, FIXTURE_PROFILES, 'fr', COMPAT)
  assert.equal(result.caption.text, 'English only')
})

// ── AC6: Production catalog is empty ─────────────────────────────────────────

test('AC6: production catalog contains no voice profiles', () => {
  assert.equal(VOCAL_CATALOG.length, 0)
})

// ── AC7: Caption exposes one authoritative visual text + SR policy ────────────

test('AC7: resolved caption has exactly one text and one srPolicy', () => {
  const result = resolveVocalCue(FIXTURE_CUE_CALL, FIXTURE_PROFILES, 'en', COMPAT)
  assert.ok(typeof result.caption.text === 'string')
  assert.ok(['once-on-enter', 'suppress-if-audio-present'].includes(result.caption.srPolicy))
  assert.ok(!('extraField' in result.caption))
})

test('AC7: duplicate locale captions in a single cue are rejected (prevents dual announcement)', () => {
  const dupCue = {
    ...FIXTURE_CUE_CALL,
    captions: [
      { locale: 'en', text: 'Caption 1', srPolicy: 'once-on-enter' },
      { locale: 'en', text: 'Caption 2', srPolicy: 'once-on-enter' },
    ],
  }
  const errors = validateCue(dupCue)
  assert.ok(errors.includes('duplicate-cue'))
})

// ── AC8: No route imports the foundation ─────────────────────────────────────

test('AC8: no rendered route or transport imports the vocal foundation', () => {
  const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const routesToCheck = [
    'src/client/components/home/UzorEngineHero.tsx',
    'src/client/performance/audioTransport.ts',
    'src/client/performance/silentTransport.ts',
    'src/client/performance/useUzorPerformance.ts',
  ]
  for (const route of routesToCheck) {
    const content = source(route)
    assert.doesNotMatch(content, /performance\/vocal/, `${route} must not import vocal foundation`)
  }
})
