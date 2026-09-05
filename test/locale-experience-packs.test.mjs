import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { LANGUAGES, dirFor } from '../src/client/config/languages.ts'
import { getCanonicalStageIds, getPresentationSequence, UZOR_LOOP_MODEL_VERSION } from '../src/client/workflow/uzorLoopModel.ts'
import { PERFORMANCE_VERSION, PERFORMANCE_EVENTS, TOTAL_BARS, BEATS_PER_BAR, SUPPORTED_TEMPOS } from '../src/client/performance/uzorPerformanceManifest.ts'
import { COMPATIBILITY, INVARIANTS, TOKEN_NAMES, TOKEN_SOURCE, PROVENANCE_SOURCES, REVIEW_EVIDENCE, canonicalPackJson, sealPack, validatePack, validateRegistry } from '../src/client/experience-packs/schema.ts'
import { ENGLISH_BASELINE, LOCALE_PACKS } from '../src/client/experience-packs/packs.ts'
import { resolveExperiencePack } from '../src/client/experience-packs/resolve.ts'

const clone = value => structuredClone(value)
const reseal = value => { const { integrity, ...payload } = value; return sealPack(payload) }
const root = new URL('../', import.meta.url)
const source = path => readFileSync(new URL(path, root), 'utf8')

for (const { code, dir } of LANGUAGES) {
  test(`${code} resolves offline with existing text and direction intact`, () => {
    const dictionary = JSON.parse(source(`src/client/i18n/${code}.json`))
    const result = resolveExperiencePack(code, dictionary)
    assert.equal(result.localizedText, dictionary)
    assert.equal(result.locale, code)
    assert.equal(result.dir, dir)
    assert.equal(result.pack, ENGLISH_BASELINE)
    assert.equal(result.registration.locale, code)
    assert.equal(result.mode, code === 'en' ? 'baseline' : 'baseline-with-localized-text')
    assert.deepEqual(result.reasons, [])
    assert.deepEqual(resolveExperiencePack(code, dictionary, clone(LOCALE_PACKS)), result)
    assert.equal(result.registration.content, code === 'en' ? ENGLISH_BASELINE.content : null)
    assert.deepEqual(result.registration.fallback, code === 'en' ? null : { id: ENGLISH_BASELINE.id, version: '1.0.0', locale: 'en' })
  })
}

test('exactly eight unique locale registrations have independent IDs and stable versions', () => {
  assert.deepEqual(LOCALE_PACKS.map(pack => pack.locale), ['en', 'es', 'ru', 'zh', 'ar', 'he', 'fr', 'uk'])
  assert.equal(new Set(LOCALE_PACKS.map(pack => pack.id)).size, 8)
  assert.ok(LOCALE_PACKS.every(pack => pack.version === '1.0.0'))
  assert.deepEqual(validateRegistry(LOCALE_PACKS), [])
})

test('compatibility pins the existing canonical workflow, clock and phrase-slot cadence', () => {
  assert.equal(COMPATIBILITY.workflowModel, UZOR_LOOP_MODEL_VERSION)
  assert.equal(COMPATIBILITY.performanceClock, PERFORMANCE_VERSION)
  assert.deepEqual(INVARIANTS.workflowOrder, getCanonicalStageIds())
  assert.equal(INVARIANTS.totalBars, TOTAL_BARS)
  assert.equal(INVARIANTS.beatsPerBar, BEATS_PER_BAR)
  assert.deepEqual(INVARIANTS.tempos, SUPPORTED_TEMPOS)
  assert.deepEqual(INVARIANTS.boundaries, [8, 16, 32])
  assert.deepEqual(PERFORMANCE_EVENTS.map(event => [event.bar, event.phase, event.phraseSlot]), [
    ...Array.from({ length: 8 }, (_, i) => [i + 1, 'orientation', i + 1]),
    ...Array.from({ length: 8 }, (_, i) => [i + 9, 'construction', i + 1]),
    ...Array.from({ length: 15 }, (_, i) => [i + 17, 'detail', i + 1]),
    [32, 'resolution', 1],
  ])
  assert.equal(COMPATIBILITY.voiceCadence, 'uzor-phrase-slots-1.0.0')
})

for (const locale of ['ar', 'he']) test(`${locale} is an RTL metadata consumer and never reverses workflow order`, () => {
  const result = resolveExperiencePack(locale, key => key)
  assert.equal(result.dir, 'rtl')
  assert.equal(result.dir, dirFor(locale))
  assert.deepEqual(getPresentationSequence(result.dir).map(stage => stage.id), getCanonicalStageIds())
  assert.deepEqual(result.pack.invariants.workflowOrder, getCanonicalStageIds())
  const reversed = clone(LOCALE_PACKS.find(pack => pack.locale === locale))
  reversed.invariants.workflowOrder.reverse()
  assert.ok(validatePack(reseal(reversed)).includes('invariant-change'))
})

const rejectionCases = [
  ['invalid-manifest', pack => { pack.extra = 'unsupported extension' }],
  ['invalid-version', pack => { pack.version = '01.2.3' }],
  ['invalid-locale', pack => { pack.locale = 'xx' }],
  ['direction-mismatch', pack => { pack.dir = 'rtl' }],
  ['missing-compatibility', pack => { delete pack.compatibility }],
  ['missing-compatibility', pack => { delete pack.compatibility.voiceCadence }],
  ['incompatible-contract', pack => { pack.compatibility.performanceClock = '2.0.0' }],
  ['invariant-change', pack => { pack.invariants.workflowOrder.reverse() }],
  ['missing-rights', pack => { delete pack.rights }],
  ['missing-rights', pack => { pack.rights.owner = 'unknown' }],
  ['missing-provenance', pack => { delete pack.provenance }],
  ['missing-provenance', pack => { pack.provenance.generatedMedia = true }],
  ['missing-approval', pack => { delete pack.approval }],
  ['missing-approval', pack => { pack.approval.status = 'pending' }],
  ['missing-integrity', pack => { delete pack.integrity }],
  ['integrity-mismatch', pack => { pack.content.arrangement[0] = 'changed after sealing' }],
  ['unsafe-asset-reference', pack => { pack.content.assets[0].owner = 'unknown' }],
  ['unsafe-asset-reference', pack => { pack.content.assets[0].kind = 'audio' }],
  ['unsafe-asset-reference', pack => { pack.content.assets[0].token = '--unknown' }],
  ['unsafe-asset-reference', pack => { pack.content.assets[1] = pack.content.assets[0] }],
  ['invalid-fallback', pack => { pack.fallback = { id: pack.id, version: pack.version, locale: 'en' } }],
]
for (const [index, [reason, mutate]] of rejectionCases.entries()) {
  test(`rejection ${index}: ${reason} is diagnostic and falls back without changing text`, () => {
    const pack = clone(ENGLISH_BASELINE)
    mutate(pack)
    assert.ok(validatePack(pack).includes(reason), JSON.stringify(validatePack(pack)))
    const translate = key => `existing:${key}`
    const candidates = [pack, ...LOCALE_PACKS.slice(1)]
    const result = resolveExperiencePack('ar', translate, candidates)
    assert.equal(result.mode, 'last-known-good-baseline')
    assert.equal(result.pack, ENGLISH_BASELINE)
    assert.equal(result.localizedText, translate)
    assert.equal(result.localizedText('hello'), 'existing:hello')
    assert.equal(result.dir, 'rtl')
    assert.ok(result.reasons.includes(reason))
    assert.deepEqual(resolveExperiencePack('ar', translate, candidates), result)
  })
}

for (const key of Object.keys(INVARIANTS)) test(`rejects changes to invariant ${key}, even with a recomputed seal`, () => {
  const pack = clone(ENGLISH_BASELINE)
  pack.invariants[key] = 'changed'
  assert.ok(validatePack(reseal(pack)).includes('invariant-change'))
})

for (const path of ['https://example.com/file', '//example.com/file', 'data:audio/wav;base64,AA', 'javascript:alert(1)', '/etc/passwd', '../brand/tokens.css', 'src/client/brand/../tokens.css', 'src\\client\\brand\\tokens.css', 'src/client/brand/%2e%2e/tokens.css', 'src/client/brand/tokens.css?remote=1', 'src/client/brand/unowned.css']) {
  test(`rejects unsafe or unowned asset reference ${path}`, () => {
    const pack = clone(ENGLISH_BASELINE)
    pack.content.assets[0].path = path
    assert.ok(validatePack(reseal(pack)).includes('unsafe-asset-reference'))
  })
}

test('duplicate registrations, missing targets, invalid targets and fallback cycles fail closed', () => {
  const cases = [
    [[...LOCALE_PACKS, LOCALE_PACKS[1]], 'duplicate-locale'],
    [[...LOCALE_PACKS.slice(1)], 'invalid-fallback'],
    [[...LOCALE_PACKS.slice(0, 1)], 'missing-pack'],
    [[], 'missing-pack'],
    [null, 'invalid-manifest'],
  ]
  for (const [registry, reason] of cases) {
    const result = resolveExperiencePack('es', 'texto', registry)
    assert.equal(result.mode, 'last-known-good-baseline')
    assert.ok(result.reasons.includes(reason))
    assert.equal(result.localizedText, 'texto')
  }
  for (const fallback of [null, { id: 'uzor-baseline-text-es', version: '1.0.0', locale: 'es' }, { id: ENGLISH_BASELINE.id, version: '0.1.0', locale: 'en' }]) {
    const pack = clone(LOCALE_PACKS[1]); pack.fallback = fallback
    assert.ok(validateRegistry([ENGLISH_BASELINE, reseal(pack)]).includes('invalid-fallback'))
  }
})

test('stale versions and self-approved content never replace trusted baseline', () => {
  for (const [modify, reason] of [
    [pack => { pack.version = '0.9.0' }, 'stale-pack'],
    [pack => { pack.content.arrangement[0] = 'Unreviewed cultural claims' }, 'unapproved-pack'],
  ]) {
    const pack = clone(ENGLISH_BASELINE); modify(pack)
    const candidate = reseal(pack)
    assert.deepEqual(validatePack(candidate), []) // Structure alone is not publication authority.
    const result = resolveExperiencePack('en', 'text', [candidate])
    assert.ok(result.reasons.includes(reason))
    assert.equal(result.pack, ENGLISH_BASELINE)
  }
  const spanish = clone(LOCALE_PACKS[1]); spanish.id = 'uzor-unreviewed-es'
  assert.ok(resolveExperiencePack('es', 'texto', [ENGLISH_BASELINE, reseal(spanish)]).reasons.includes('unapproved-pack'))
})

test('malformed JSON and non-JSON payloads are rejected without mutation', () => {
  const cycle = {}; cycle.self = cycle
  const accessor = { get locale() { throw new Error('must not evaluate accessors') } }
  const extraArray = []; extraArray.remote = 'https://example.com'
  const sparseArray = Array(2)
  for (const value of [null, false, 1, 'pack', [], {}, { integrity: null }, cycle, { bad: NaN }, { bad: undefined }, accessor, extraArray, sparseArray]) {
    assert.ok(validatePack(value).length)
    assert.equal(resolveExperiencePack('he', 'text', [value]).pack, ENGLISH_BASELINE)
  }
  assert.equal(canonicalPackJson({ b: 2, a: 1 }), canonicalPackJson({ a: 1, b: 2 }))
  const input = clone(LOCALE_PACKS)
  const before = clone(input)
  resolveExperiencePack('fr', 'texte', input)
  assert.deepEqual(input, before)
  assert.throws(() => { ENGLISH_BASELINE.content.arrangement[0] = 'mutated' }, TypeError)
  assert.throws(() => { INVARIANTS.workflowOrder.reverse() }, TypeError)
  assert.throws(() => { LOCALE_PACKS.push(ENGLISH_BASELINE) }, TypeError)
})

test('baseline uses existing repository tokens and provenance, with no media or IO', () => {
  const css = source(TOKEN_SOURCE)
  assert.deepEqual(ENGLISH_BASELINE.content.assets.map(asset => asset.token), TOKEN_NAMES)
  for (const token of TOKEN_NAMES) assert.ok(css.includes(`${token}:`))
  for (const path of [...PROVENANCE_SOURCES, REVIEW_EVIDENCE, INVARIANTS.tokenSilhouette]) assert.ok(source(path).length)
  for (const file of ['schema.ts', 'packs.ts', 'resolve.ts']) {
    const module = source(`src/client/experience-packs/${file}`)
    assert.doesNotMatch(module, /\b(?:fetch|XMLHttpRequest|WebSocket|Audio|Worker|eval)\s*\(|\bimport\s*\(|https?:\/\/|\b(?:window|document|localStorage|Date)\b/)
  }
})

test('existing UI has no imports of the foundation modules', () => {
  // Sanctioned non-rendered foundation modules may import experience-packs for version-pinning.
  // vocal/schema.ts is allowlisted here; its own rendered-consumer guard lives in vocal-performance-foundation.test.mjs.
  const SANCTIONED_NON_RENDERED = ['src/client/performance/vocal/']
  function visit(path) {
    for (const entry of readdirSync(new URL(path, root), { withFileTypes: true })) {
      const name = join(path, entry.name)
      // Foundation layers legitimately depend on each other; only UI layer is restricted.
      if (name === 'src/client/experience-packs' || name === 'src/client/performance') continue
      if (entry.isDirectory()) visit(name)
      else if (/\.[jt]sx?$/.test(name)) {
        if (SANCTIONED_NON_RENDERED.some(prefix => name.startsWith(prefix))) continue
        assert.doesNotMatch(source(name), /(?:from\s*|import\s*\()['"][^'"]*experience-packs/)
      }
    }
  }
  visit('src/client')
})

test('guard still rejects rendered-route imports of experience-packs', () => {
  const SANCTIONED_NON_RENDERED = ['src/client/performance/vocal/']
  const guardRegex = /(?:from\s*|import\s*\()['"][^'"]*experience-packs/
  const routePath = 'src/client/routes/SomeRoute.tsx'
  const syntheticSource = `import { COMPATIBILITY } from '../experience-packs/schema'`
  assert.ok(!SANCTIONED_NON_RENDERED.some(prefix => routePath.startsWith(prefix)))
  assert.match(syntheticSource, guardRegex)
})
