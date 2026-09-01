#!/usr/bin/env node
/**
 * scripts/security/assert-secret-patterns.mjs
 *
 * CHORE #84 §4: static secret-pattern scan across the tracked source tree —
 * no live credential calls, no network, pure text matching. Complements (does
 * not replace) GitHub's push-protection secret scanning: this runs locally
 * and in CI on every `npm test`/`npm run build`, catching a committed secret
 * before it ever needs push-protection to intervene.
 *
 * Self-check at the bottom proves the checker distinguishes a known-bad
 * synthetic sample from ordinary source text — inline, not from a fixture
 * file, so a genuine-looking secret never has to exist anywhere in the repo
 * (including in a "this is what bad looks like" fixture) to prove this guard
 * works.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const EXCLUDED_DIRS = new Set(['node_modules', 'dist', '.git', '.wrangler'])
const EXCLUDED_FILES = new Set([
  'package-lock.json', // hash-dense; not a plausible secret carrier
])
const SCANNED_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.html', '.yml', '.yaml', '.toml', '.md'])

// This file's own path is excluded below by name, since the patterns it
// defines would otherwise match themselves.
const SELF = fileURLToPath(import.meta.url)

const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'PEM private key header', re: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Slack token', re: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: 'GitHub fine-grained/PAT token', re: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  {
    name: 'generic high-entropy secret assignment',
    re: /\b(secret|api[_-]?key|access[_-]?token|client[_-]?secret)\b\s*[:=]\s*['"][A-Za-z0-9_\-/+=]{24,}['"]/i,
  },
]

function listFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    if (EXCLUDED_DIRS.has(entry) || EXCLUDED_FILES.has(entry)) continue
    const full = join(dir, entry)
    if (full === SELF) continue
    const stat = statSync(full)
    if (stat.isDirectory()) {
      out.push(...listFiles(full))
    } else if (SCANNED_EXTS.has(extname(entry))) {
      out.push(full)
    }
  }
  return out
}

function scanText(text) {
  const hits = [];
  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(text)) hits.push(name)
  }
  return hits
}

let failures = []

for (const file of listFiles(root)) {
  const text = readFileSync(file, 'utf8')
  const hits = scanText(text)
  if (hits.length > 0) {
    for (const name of hits) failures.push(`${file.slice(root.length + 1)}: matches ${name} pattern`)
  }
}

if (failures.length === 0) {
  console.log('✓ secret-pattern scan: no matches across tracked source files')
} else {
  console.error('✗ secret-pattern scan: possible secret(s) found')
  for (const f of failures) console.error(`  - ${f}`)
}

// ---------------------------------------------------------------------------
// Self-check: prove the checker itself works, using inline synthetic samples
// (never written to a file) rather than trusting that today's repo happening
// to pass means the patterns are correct.
// ---------------------------------------------------------------------------

// Deliberately NOT shaped like a real provider token (no AKIA/ghp_/xox
// prefix): GitHub push-protection's provider-specific scanners key off those
// exact prefixes, and a synthetic sample that merely resembles one risks
// being blocked as a real secret on push. The generic-assignment pattern is
// this script's own invention, so exercising it needs no provider-shaped string.
const KNOWN_BAD_SAMPLE = 'const clientSecret = "' + 'not-a-real-value-just-fill-1234567890'.slice(0, 30) + '"'
const KNOWN_GOOD_SAMPLE = 'const greeting = "hello, world"'

if (scanText(KNOWN_BAD_SAMPLE).length === 0) {
  failures.push('self-check: known-bad synthetic sample was NOT flagged — checker is broken')
  console.error('✗ self-check: known-bad synthetic sample was not flagged')
} else {
  console.log('✓ self-check: known-bad synthetic sample is flagged')
}

if (scanText(KNOWN_GOOD_SAMPLE).length !== 0) {
  failures.push('self-check: known-good sample was flagged — checker is over-broad')
  console.error('✗ self-check: known-good sample was incorrectly flagged')
} else {
  console.log('✓ self-check: known-good sample is not flagged')
}

if (failures.length > 0) {
  console.error(`\n✗ assert-secret-patterns FAILED (${failures.length} issue(s))\n`)
  process.exit(1)
}
console.log('\n✓ assert-secret-patterns passed\n')
