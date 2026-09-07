import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyChangedFiles, loadManifest, validateManifest, renderMarkdown } from '../scripts/language-impact-report.mjs'

const manifest = loadManifest()
const locales = manifest.locales.map(({ code }) => code).sort()

test('shared route changes propose a FEAT for every shipped locale', () => {
  const report = classifyChangedFiles(['src/client/routes/Home.tsx'], manifest)
  assert.deepEqual(report.affected_languages, locales)
  assert.equal(report.proposals.length, locales.length)
})

test('locale dictionary changes only affect that locale', () => {
  const report = classifyChangedFiles(['src/client/i18n/he.json', 'src/client/i18n/meta/he.json'], manifest)
  assert.deepEqual(report.affected_languages, ['he'])
  assert.equal(report.proposals.length, 1)
})

test('dynamic demo data is a shared user-facing surface', () => {
  assert.deepEqual(classifyChangedFiles(['src/client/workflow/uzorLoopModel.ts'], manifest).affected_languages, locales)
})

test('developer-only changes produce no proposals', () => {
  const report = classifyChangedFiles(['docs/guide.md', 'test/example.test.mjs', 'scripts/tool.mjs'], manifest)
  assert.deepEqual(report.affected_languages, [])
  assert.equal(report.proposals.length, 0)
})

test('unknown client files are reported for review and conservatively affect all locales', () => {
  const report = classifyChangedFiles(['src/client/new-surface.tsx'], manifest)
  assert.equal(report.needs_review, true)
  assert.deepEqual(report.affected_languages, locales)
})

test('manifest rejects duplicate surface ids', () => {
  assert.throws(() => validateManifest({ ...manifest, surfaces: [...manifest.surfaces, manifest.surfaces[0]] }), /duplicate surface ids/)
})

test('report markdown is deterministic', () => {
  const report = classifyChangedFiles(['src/client/routes/Home.tsx', 'docs/guide.md'], manifest)
  assert.equal(renderMarkdown(report), renderMarkdown(report))
})
