import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { translate } from '../src/client/i18n/translate.ts'
import { getPresentationSequence } from '../src/client/workflow/uzorLoopModel.ts'
import { PERFORMANCE_EVENTS } from '../src/client/performance/uzorPerformanceManifest.ts'

const read = code => JSON.parse(readFileSync(new URL(`../src/client/i18n/${code}.json`, import.meta.url), 'utf8'))
const en = read('en'), he = read('he')
import { latinExceptions } from './helpers/hebrew-allowlist.mjs'

test('Hebrew keys exactly match English, with no blanks, duplicate keys or pending translations', () => {
  assert.deepEqual(Object.keys(he).sort(), Object.keys(en).sort())
  const meta = JSON.parse(readFileSync(new URL('../src/client/i18n/meta/he.json', import.meta.url)))
  for (const code of readdirSync(new URL('../src/client/i18n', import.meta.url)).filter(p => p.endsWith('.json'))) {
    const raw = readFileSync(new URL(`../src/client/i18n/${code}`, import.meta.url), 'utf8')
    const tree = ts.parseJsonText(code, raw)
    const properties = tree.statements[0].expression.properties
    const names = properties.map(p => p.name.text)
    assert.equal(new Set(names).size, names.length, `${code}: duplicate JSON keys`)
  }
  for (const [key, value] of Object.entries(he)) {
    assert.ok(typeof value === 'string' && value.trim(), key)
    assert.ok(!meta[key]?.pending, `${key}: pending Hebrew`)
    assert.equal(/[A-Za-z]/.test(value.replace(latinExceptions, '')), false, `${key}: unintended Latin prose: ${value}`)
  }
})

test('real translation resolver refuses missing and empty Hebrew instead of English fallback', () => {
  for (const dict of [{}, {'nav.home': ''}, {'nav.home': ' '}]) {
    assert.throws(() => translate('he', dict, en, 'nav.home'), /Missing Hebrew/)
  }
  for (const key of Object.keys(en)) assert.equal(translate('he', he, en, key), he[key])
  assert.equal(translate('es', {}, en, 'nav.home'), en['nav.home'])
})

test('all canonical stages and performance phases have nonempty Hebrew display keys', () => {
  for (const stage of getPresentationSequence('rtl')) {
    assert.ok(he[`home.engine.stage.${stage.id}.label`], stage.id)
    assert.ok(he[`home.engine.stage.${stage.id}`], stage.id)
  }
  for (const event of PERFORMANCE_EVENTS) assert.ok(he[`home.engine.phase.${event.phase}`], event.phase)
})

test('every literal translation call in rendered components exists in source and Hebrew', () => {
  function visitDir(dir) {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir)
      if (entry.isDirectory()) visitDir(url)
      else if (/\.tsx$/.test(entry.name)) {
        const tree = ts.createSourceFile(entry.name, readFileSync(url, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
        function visit(node) {
          if (ts.isCallExpression(node) && node.expression.getText(tree) === 't' && node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
            const key = node.arguments[0].text
            assert.ok(en[key] && he[key], `${entry.name}: missing ${key}`)
          }
          ts.forEachChild(node, visit)
        }
        visit(tree)
      }
    }
  }
  visitDir(new URL('../src/client/', import.meta.url))
})
