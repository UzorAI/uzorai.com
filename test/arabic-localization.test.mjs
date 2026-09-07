import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { latinExceptions } from './helpers/hebrew-allowlist.mjs'

const read = file => JSON.parse(readFileSync(new URL(`../src/client/i18n/${file}.json`, import.meta.url), 'utf8'))
const en = read('en')
const ar = read('ar')
const meta = JSON.parse(readFileSync(new URL('../src/client/i18n/meta/ar.json', import.meta.url), 'utf8'))
const arabicLatinExceptions = new RegExp(`${latinExceptions.source}|i18n|LanguagePicker|EPIC|(?:ru|es|en|zh)|t\\(`, 'g')

test('Arabic dictionary has source-key parity and no pending user-facing keys', () => {
  assert.deepEqual(Object.keys(ar).sort(), Object.keys(en).sort())
  for (const [key, value] of Object.entries(ar)) {
    assert.equal(typeof value, 'string')
    assert.ok(value.trim(), `${key}: empty Arabic translation`)
    assert.equal(meta[key]?.pending, undefined, `${key}: pending Arabic translation`)
    assert.equal(/[A-Za-z]/.test(value.replace(arabicLatinExceptions, '')), false, `${key}: unintended Latin prose: ${value}`)
  }
})
