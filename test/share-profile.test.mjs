import assert from 'node:assert/strict'
import test from 'node:test'
import { buildShareUrl, readShareProfile } from '../src/client/settings/shareProfile.ts'

test('share profile accepts valid theme, locale, and sound values', () => {
  assert.deepEqual(readShareProfile('?uzor_theme=light&uzor_lang=he&uzor_sound=unmuted'), {
    theme: 'light',
    locale: 'he',
    sound: 'unmuted',
  })
})

test('share profile ignores invalid values instead of changing preferences', () => {
  assert.deepEqual(readShareProfile('?uzor_theme=neon&uzor_lang=xx&uzor_sound=loud'), {})
})

test('share URL preserves the current route and replaces stale profile parameters', () => {
  const url = buildShareUrl(
    { href: 'https://uzorai.com/docs?uzor_theme=dark&foo=1#guide' },
    { theme: 'light', locale: 'ar', sound: 'muted' },
  )
  assert.equal(
    url,
    'https://uzorai.com/docs?uzor_theme=light&foo=1&uzor_lang=ar&uzor_sound=muted#guide',
  )
})
