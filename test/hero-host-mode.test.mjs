import test from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveHeroMode,
  resolveHeroModeFrom,
  currentHeroMode,
} from '../src/client/config/heroMode.ts'

test('development and demo hosts resolve to the engine hero', () => {
  assert.equal(resolveHeroMode('dev.uzorai.com'), 'engine')
  assert.equal(resolveHeroMode('uzorai.com'), 'engine')
  assert.equal(resolveHeroMode('www.uzorai.com'), 'engine')
  // normalizeHost folds ordinary case confusion onto the same allowlist entry
  assert.equal(resolveHeroMode('UZORAI.COM'), 'engine')
})

test('both stable-production hosts resolve to the legacy hero', () => {
  assert.equal(resolveHeroMode('uzor.ai'), 'legacy')
  assert.equal(resolveHeroMode('www.uzor.ai'), 'legacy')
})

test('unknown, malformed, and unavailable host data fail closed to legacy', () => {
  assert.equal(resolveHeroMode('evil.example.com'), 'legacy')
  assert.equal(resolveHeroMode('uzorai.com.evil.com'), 'legacy')
  assert.equal(resolveHeroMode(''), 'legacy')
  assert.equal(resolveHeroMode(null), 'legacy')
  assert.equal(resolveHeroMode(undefined), 'legacy')
  assert.equal(resolveHeroMode('uzorai.com:80:extra'), 'legacy')
  assert.equal(resolveHeroMode('uzoräi.com'), 'legacy')
})

test('a canonical-model validation failure fails closed to legacy even on a staging host', () => {
  assert.equal(resolveHeroModeFrom('uzorai.com', false), 'legacy')
  assert.equal(resolveHeroModeFrom('uzorai.com', true), 'engine')
  assert.equal(resolveHeroModeFrom('uzor.ai', true), 'legacy')
})

test('currentHeroMode fails closed to legacy when window/location is unavailable (SSR-like)', () => {
  assert.equal(typeof window, 'undefined')
  assert.equal(currentHeroMode(), 'legacy')
})
