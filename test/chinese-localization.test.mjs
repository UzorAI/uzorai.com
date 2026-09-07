import assert from 'node:assert/strict'
import test from 'node:test'
import en from '../src/client/i18n/en.json' with { type: 'json' }
import zh from '../src/client/i18n/zh.json' with { type: 'json' }

const completedChineseKeys = [
  'home.engine.heading',
  'home.engine.subhead',
  'home.engine.go.start',
  'home.engine.status.idle',
  'home.engine.stage.authoring',
  'home.engine.stage.governance',
  'home.engine.stage.implementation-verification',
  'home.engine.stage.deployment',
  'home.engine.stage.learning-continuation',
  'home.engine.payoff.1',
  'home.engine.payoff.2',
  'home.engine.payoff.3',
  'nav.brandHome',
  'nav.openMenu',
  'nav.closeMenu',
  'nav.siteNavigation',
  'theme.light',
  'theme.dark',
  'notFound.title',
  'notFound.body',
  'notFound.back',
]

test('Chinese dictionary keeps source-key parity and translates the engine and shell', () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort())
  for (const key of completedChineseKeys) {
    assert.equal(typeof zh[key], 'string')
    assert.notEqual(zh[key], en[key], `${key} still uses the English source string`)
    assert.ok(zh[key].trim(), `${key} must not be empty`)
  }
})
