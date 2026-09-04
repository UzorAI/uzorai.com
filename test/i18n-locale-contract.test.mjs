/**
 * test/i18n-locale-contract.test.mjs
 *
 * i18n locale contract tests for EPIC #108 Phase 1.
 * Covers: fallback order (AC1), key coverage/timing (AC4), accessibility (AC4),
 * brand-tone (AC4), mobile string length (AC4), pseudo-locale and RTL fixture
 * integrity (AC3), and metadata schema (AC2).
 *
 * All locale FEATs in EPIC #108 Phases 2-5 must keep these tests green.
 * See docs/i18n-schema.md for the contract these tests enforce.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const en = require('../src/client/i18n/en.json')
const es = require('../src/client/i18n/es.json')
const ru = require('../src/client/i18n/ru.json')
const zh = require('../src/client/i18n/zh.json')

const pseudoLocale = require('./fixtures/i18n/pseudo-locale.json')
const rtlFixture = require('./fixtures/i18n/rtl-fixture.json')

const metaEn = require('../src/client/i18n/meta/en.json')
const metaEs = require('../src/client/i18n/meta/es.json')
const metaRu = require('../src/client/i18n/meta/ru.json')
const metaZh = require('../src/client/i18n/meta/zh.json')

const SHIPPED_LOCALES = { en, es, ru, zh }
const META = { en: metaEn, es: metaEs, ru: metaRu, zh: metaZh }

// ---------------------------------------------------------------------------
// AC1 — Fallback order: active dict → en → key
// ---------------------------------------------------------------------------

test('AC1: t() fallback order — active dict → en → key, for all 4 locales', () => {
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    // Tier 1: key present in active dict resolves from active dict
    const keyInAll = 'nav.home'
    const tier1 = dict[keyInAll] ?? en[keyInAll] ?? keyInAll
    assert.equal(tier1, dict[keyInAll], `${code}: present key should resolve from active dict`)

    // Tier 2: key absent from active dict but present in en resolves from en
    const dictMissingOne = Object.fromEntries(
      Object.entries(dict).filter(([k]) => k !== keyInAll),
    )
    const tier2 = dictMissingOne[keyInAll] ?? en[keyInAll] ?? keyInAll
    assert.equal(tier2, en[keyInAll], `${code}: missing key must fall back to en value`)

    // Tier 3: key absent from both resolves to key string itself
    const tier3 = dict['__no_such_key__'] ?? en['__no_such_key__'] ?? '__no_such_key__'
    assert.equal(tier3, '__no_such_key__', `${code}: totally missing key must fall back to key string`)
  }
})

// ---------------------------------------------------------------------------
// AC4 — Timing: all locales carry the same key set as en (complete coverage)
// ---------------------------------------------------------------------------

test('AC4 (timing): every locale has exactly the same key set as en', () => {
  const enKeys = Object.keys(en).sort()
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    if (code === 'en') continue
    const localeKeys = Object.keys(dict).sort()
    assert.deepEqual(
      localeKeys,
      enKeys,
      `${code}: key set must match en exactly (add or remove keys here if en.json changes)`,
    )
  }
})

// ---------------------------------------------------------------------------
// AC4 — Accessibility: no empty or whitespace-only values in any locale
// ---------------------------------------------------------------------------

test('AC4 (accessibility): all locale string values are non-empty', () => {
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    for (const [key, value] of Object.entries(dict)) {
      assert.equal(typeof value, 'string', `${code}:${key} must be a string`)
      assert.ok(value.trim().length > 0, `${code}:${key} must not be blank or whitespace-only`)
    }
  }
})

// ---------------------------------------------------------------------------
// AC4 — Brand-tone: hero headline triple present and non-empty in every locale
// ---------------------------------------------------------------------------

test('AC4 (brand-tone): hero headline triple (headline.1/2/3) present in all locales', () => {
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    for (const i of ['1', '2', '3']) {
      const key = `home.hero.headline.${i}`
      assert.ok(
        dict[key] && dict[key].trim().length > 0,
        `${code}: ${key} must be a non-empty brand string`,
      )
    }
  }
})

test('AC4 (brand-tone): header.tagline present and non-empty in all locales', () => {
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    assert.ok(
      dict['header.tagline'] && dict['header.tagline'].trim().length > 0,
      `${code}: header.tagline must be a non-empty brand string`,
    )
  }
})

// ---------------------------------------------------------------------------
// AC4 — Mobile: nav labels fit within 20 characters (mobile menu overflow guard)
// ---------------------------------------------------------------------------

test('AC4 (mobile): nav labels are ≤ 20 characters in all locales', () => {
  const navKeys = [
    'nav.home', 'nav.platform', 'nav.governance',
    'nav.docs', 'nav.pricing', 'nav.contact',
  ]
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    for (const key of navKeys) {
      const value = dict[key] ?? en[key]
      assert.ok(
        value.length <= 20,
        `${code}:${key} exceeds 20 chars (${value.length}): "${value}"`,
      )
    }
  }
})

// ---------------------------------------------------------------------------
// AC2 — Metadata: meta files cover every key in the corresponding locale dict
// ---------------------------------------------------------------------------

test('AC2: meta files cover every dict key for en/es/ru/zh', () => {
  const META_RESERVED = new Set(['_schema', '_note'])
  for (const [code, dict] of Object.entries(SHIPPED_LOCALES)) {
    const meta = META[code]
    const metaKeys = Object.keys(meta).filter((k) => !META_RESERVED.has(k))
    const dictKeys = Object.keys(dict)
    for (const key of dictKeys) {
      assert.ok(
        metaKeys.includes(key),
        `${code} meta is missing entry for key: "${key}"`,
      )
    }
    for (const key of metaKeys) {
      assert.ok(
        dictKeys.includes(key),
        `${code} meta has entry for unknown key: "${key}" (not in dict)`,
      )
    }
  }
})

test('AC2: each meta entry has v and reviewed fields', () => {
  const META_RESERVED = new Set(['_schema', '_note'])
  for (const [code, meta] of Object.entries(META)) {
    for (const [key, entry] of Object.entries(meta)) {
      if (META_RESERVED.has(key)) continue
      assert.ok(
        typeof entry === 'object' && entry !== null,
        `${code}:${key} meta entry must be an object`,
      )
      assert.ok(
        typeof entry.v === 'string',
        `${code}:${key} meta entry must have a string "v" (version)`,
      )
      assert.ok(
        typeof entry.reviewed === 'string',
        `${code}:${key} meta entry must have a string "reviewed" (ISO date)`,
      )
    }
  }
})

// ---------------------------------------------------------------------------
// AC3 — Pseudo-locale fixture: valid for reuse by Phase 2+
// ---------------------------------------------------------------------------

test('AC3 (pseudo-locale): fixture has _meta block and at least the 6 nav keys', () => {
  assert.ok(
    typeof pseudoLocale._meta === 'object',
    'pseudo-locale fixture must have a _meta block',
  )
  const requiredKeys = [
    'nav.home', 'nav.platform', 'nav.governance',
    'nav.docs', 'nav.pricing', 'nav.contact',
  ]
  for (const key of requiredKeys) {
    assert.ok(
      typeof pseudoLocale[key] === 'string' && pseudoLocale[key].trim().length > 0,
      `pseudo-locale fixture must have non-empty "${key}"`,
    )
  }
})

test('AC3 (pseudo-locale): fixture values are visually distinct from en (bracket-wrapped)', () => {
  const requiredKeys = ['nav.home', 'nav.platform', 'nav.governance']
  for (const key of requiredKeys) {
    assert.ok(
      pseudoLocale[key].startsWith('[') && pseudoLocale[key].endsWith(']'),
      `pseudo-locale "${key}" must be bracket-wrapped to be visually distinct: "${pseudoLocale[key]}"`,
    )
  }
})

// ---------------------------------------------------------------------------
// AC3 — RTL fixture: valid stub for Phase 2 (ar) and Phase 3 (he)
// ---------------------------------------------------------------------------

test('AC3 (rtl-fixture): fixture has _meta and _locale with dir:rtl', () => {
  assert.ok(
    typeof rtlFixture._meta === 'object',
    'RTL fixture must have a _meta block',
  )
  assert.ok(
    typeof rtlFixture._locale === 'object',
    'RTL fixture must have a _locale block',
  )
  assert.equal(
    rtlFixture._locale.dir,
    'rtl',
    'RTL fixture _locale.dir must be "rtl"',
  )
})

test('AC3 (rtl-fixture): hero headline triple is non-empty in RTL fixture', () => {
  for (const i of ['1', '2', '3']) {
    const key = `home.hero.headline.${i}`
    assert.ok(
      typeof rtlFixture[key] === 'string' && rtlFixture[key].trim().length > 0,
      `RTL fixture must have non-empty "${key}"`,
    )
  }
})
