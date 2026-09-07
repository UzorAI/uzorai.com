import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST_PATH = path.join(ROOT, 'config/language-impact-manifest.json')

export function validateManifest(manifest, root = ROOT) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.locales) || !Array.isArray(manifest.surfaces)) {
    throw new Error('language impact manifest must declare version 1, locales, and surfaces')
  }
  const codes = manifest.locales.map((locale) => locale.code)
  if (new Set(codes).size !== codes.length || codes.some((code) => !/^[a-z]{2}$/.test(code))) {
    throw new Error('language impact manifest contains duplicate or invalid locale codes')
  }
  const ids = manifest.surfaces.map((surface) => surface.id)
  if (new Set(ids).size !== ids.length) throw new Error('language impact manifest contains duplicate surface ids')
  for (const surface of manifest.surfaces) {
    if (!surface.id || !Array.isArray(surface.paths) || !['shared', 'locale', 'none'].includes(surface.impact)) {
      throw new Error(`invalid language impact surface: ${surface.id ?? '(missing id)'}`)
    }
  }
  const dictionaryCodes = fs.readdirSync(path.join(root, 'src/client/i18n'))
    .filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -5)).sort()
  if (dictionaryCodes.join(',') !== [...codes].sort().join(',')) {
    throw new Error(`manifest locales do not match dictionaries: ${codes.join(',')} vs ${dictionaryCodes.join(',')}`)
  }
  return manifest
}

export function loadManifest(root = ROOT) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/language-impact-manifest.json'), 'utf8'))
  return validateManifest(manifest, root)
}

function localeForFile(file, locales) {
  const match = file.match(/^src\/client\/i18n\/(?:meta\/)?([a-z]{2})\.json$/)
  return match && locales.some((locale) => locale.code === match[1]) ? match[1] : null
}

export function classifyChangedFiles(files, manifest) {
  const locales = manifest.locales.map((locale) => locale.code).sort()
  const reasons = []
  const affected = new Set()
  let needsReview = false
  for (const file of [...new Set(files.map((item) => item.trim()).filter(Boolean))].sort()) {
    const surface = manifest.surfaces.find((candidate) => candidate.paths.some((prefix) => file === prefix || file.startsWith(prefix)))
    const locale = localeForFile(file, manifest.locales)
    if (locale) {
      affected.add(locale)
      reasons.push({ file, surface_id: file.includes('/meta/') ? 'translation-metadata' : 'translation-dictionary', impact: 'locale', locales: [locale] })
    } else if (surface?.impact === 'shared') {
      locales.forEach((code) => affected.add(code))
      reasons.push({ file, surface_id: surface.id, impact: 'shared', locales })
    } else if (surface?.impact === 'none') {
      reasons.push({ file, surface_id: surface.id, impact: 'none', locales: [] })
    } else {
      needsReview = true
      locales.forEach((code) => affected.add(code))
      reasons.push({ file, surface_id: null, impact: 'unknown', locales })
    }
  }
  const affectedLanguages = [...affected].sort()
  return {
    schema_version: 'language-impact-report.v1',
    changed_files: [...new Set(files.map((item) => item.trim()).filter(Boolean))].sort(),
    affected_languages: affectedLanguages,
    reasons,
    proposals: affectedLanguages.map((language) => ({ language, type: 'feat', parent_epic: 145, requires_review: true, title: `FEAT: audit ${language} language experience for primary-page changes` })),
    needs_review: needsReview
  }
}

export function renderMarkdown(report) {
  const lines = ['# Language impact report', '', `Affected languages: ${report.affected_languages.length ? report.affected_languages.join(', ') : 'none'}`, `Needs review: ${report.needs_review ? 'yes' : 'no'}`, '', '## Changed files', ... (report.changed_files.length ? report.changed_files.map((file) => `- ${file}`) : ['- none']), '', '## Reasons']
  for (const reason of report.reasons) lines.push(`- \`${reason.file}\` — ${reason.surface_id ?? 'unclassified'} (${reason.impact}); locales: ${reason.locales.join(', ') || 'none'}`)
  lines.push('', '## Governed FEAT proposals')
  for (const proposal of report.proposals) lines.push(`- ${proposal.title} (requires human review)`) 
  if (!report.proposals.length) lines.push('- none')
  return `${lines.join('\n')}\n`
}

function changedFilesFromGit(base, head) {
  if (!base || /^0+$/.test(base)) return execFileSync('git', ['diff', '--name-only', `${head}^`, head], { cwd: ROOT, encoding: 'utf8' }).split('\n')
  return execFileSync('git', ['diff', '--name-only', base, head], { cwd: ROOT, encoding: 'utf8' }).split('\n')
}

export function main(argv = process.argv.slice(2)) {
  const args = Object.fromEntries(argv.reduce((pairs, value, index) => value.startsWith('--') ? [...pairs, [value.slice(2), argv[index + 1]]] : pairs, []))
  const manifest = loadManifest()
  const files = args['files-file'] ? fs.readFileSync(path.resolve(args['files-file']), 'utf8').split('\n') : args.files ? args.files.split(',') : changedFilesFromGit(args.base, args.head || 'HEAD')
  const report = classifyChangedFiles(files, manifest)
  if (args.json) fs.writeFileSync(path.resolve(args.json), `${JSON.stringify(report, null, 2)}\n`)
  if (args.markdown) fs.writeFileSync(path.resolve(args.markdown), renderMarkdown(report))
  if (!args.json && !args.markdown) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  return report
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
