#!/usr/bin/env node
/**
 * test/security/frontend-boundaries.test.mjs
 *
 * Static source-scan regression guards for the browser boundary (CHORE #84
 * §3): no path in src/client is allowed to introduce raw-HTML injection, an
 * unsafe external-link pattern, an open-redirect-shaped assignment, a
 * javascript: URL, or an unregistered Web Storage key. None of these
 * currently occur in the codebase — these are guards against future
 * regressions, not fixes for an existing defect, matching the style of
 * scripts/security/assert-workflow-hardening.mjs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

let failures = 0
function check(label, violations) {
  if (violations.length === 0) {
    console.log(`✓ ${label}`)
  } else {
    console.error(`✗ ${label}`)
    for (const v of violations) console.error(`  - ${v}`)
    failures += violations.length
  }
}

function listFiles(dir, exts) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      out.push(...listFiles(full, exts))
    } else if (exts.includes(extname(entry))) {
      out.push(full)
    }
  }
  return out
}

const clientSrcFiles = listFiles(join(root, 'src', 'client'), ['.ts', '.tsx'])
const indexHtmlPath = join(root, 'src', 'client', 'index.html')
const indexHtml = readFileSync(indexHtmlPath, 'utf8')
const i18nFiles = listFiles(join(root, 'src', 'client', 'i18n'), ['.json'])

// ---------------------------------------------------------------------------
// No raw-HTML injection sink.
// ---------------------------------------------------------------------------

{
  const violations = []
  for (const file of clientSrcFiles) {
    const text = readFileSync(file, 'utf8')
    if (/dangerouslySetInnerHTML/.test(text)) {
      violations.push(`${file.slice(root.length + 1)}: dangerouslySetInnerHTML present`)
    }
  }
  check('no dangerouslySetInnerHTML in src/client', violations)
}

// ---------------------------------------------------------------------------
// Any target="_blank" anchor must carry rel="noopener noreferrer" (reverse
// tabnabbing / unsafe external-link behavior).
// ---------------------------------------------------------------------------

{
  const violations = []
  const BLANK_ANCHOR_RE = /<a\b[^>]*target=\{?["']_blank["']\}?[^>]*>/g
  for (const file of clientSrcFiles) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(BLANK_ANCHOR_RE)) {
      const tag = match[0]
      if (!/rel=\{?["'][^"']*\bnoopener\b[^"']*\bnoreferrer\b/.test(tag) && !/rel=\{?["'][^"']*\bnoreferrer\b[^"']*\bnoopener\b/.test(tag)) {
        violations.push(`${file.slice(root.length + 1)}: target="_blank" anchor missing rel="noopener noreferrer" — ${tag.slice(0, 80)}`)
      }
    }
  }
  check('every target="_blank" anchor sets rel="noopener noreferrer"', violations)
}

// ---------------------------------------------------------------------------
// No javascript: scheme in an href/src (client-side files + the static HTML shell).
// ---------------------------------------------------------------------------

{
  const violations = []
  const JS_SCHEME_RE = /(href|src)\s*=\s*\{?["']\s*javascript:/i
  for (const file of [...clientSrcFiles, indexHtmlPath]) {
    const text = readFileSync(file, 'utf8')
    if (JS_SCHEME_RE.test(text)) {
      violations.push(`${file.slice(root.length + 1)}: javascript: URL scheme found in href/src`)
    }
  }
  check('no javascript: URL scheme in href/src', violations)
}

// ---------------------------------------------------------------------------
// Web Storage key allowlist — every literal passed to getItem/setItem across
// the client bundle (and the pre-paint inline scripts in index.html) must be
// one of the two registered keys. Catches an ad hoc new storage key (a
// candidate for accidentally persisting something sensitive) before it ships.
// ---------------------------------------------------------------------------

{
  const ALLOWED_STORAGE_KEYS = new Set(['uzor-theme', 'uzor-locale'])
  const STORAGE_CALL_RE = /(?:local|session)Storage\.(?:get|set|remove)Item\(\s*['"]([^'"]+)['"]/g
  const violations = []
  for (const file of [...clientSrcFiles, indexHtmlPath]) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(STORAGE_CALL_RE)) {
      const key = match[1]
      if (!ALLOWED_STORAGE_KEYS.has(key)) {
        violations.push(`${file.slice(root.length + 1)}: unregistered Web Storage key "${key}"`)
      }
    }
  }
  check('Web Storage keys are limited to the registered allowlist', violations)

  const sensitiveViolations = []
  const SENSITIVE_KEY_RE = /(token|secret|password|apikey|api_key|auth)/i
  for (const key of ALLOWED_STORAGE_KEYS) {
    if (SENSITIVE_KEY_RE.test(key)) sensitiveViolations.push(`allowlisted key "${key}" looks sensitive`)
  }
  check('no allowlisted Web Storage key name looks like a secret', sensitiveViolations)
}

// ---------------------------------------------------------------------------
// Redirect safety: the *.translate.goog pre-paint guard in index.html must
// stay anchored (suffix-only match) and must send visitors to a fixed
// canonical origin, never one derived from request-controlled input — an
// unanchored match or a dynamic destination would be an open redirect.
// ---------------------------------------------------------------------------

{
  const violations = []
  // Matches the literal regex source `/\.translate\.goog$/` in the page's
  // inline script — i.e. a suffix-anchored ($) match, not a substring test
  // that a subdomain like uzorai.com.translate.goog.evil.com could satisfy.
  if (!indexHtml.includes('/\\.translate\\.goog$/') || !indexHtml.includes('location.hostname')) {
    violations.push('index.html: translate.goog redirect guard is missing or not suffix-anchored (/\\.translate\\.goog$/)')
  }
  if (!/location\.replace\(\s*\n?\s*['"]https:\/\/uzorai\.com['"]/.test(indexHtml)) {
    violations.push('index.html: redirect destination is not the fixed literal https://uzorai.com')
  }
  check('index.html translate.goog redirect is anchored and fixed-destination', violations)
}

// ---------------------------------------------------------------------------
// Localization data: translation strings render as text via t() and must
// never carry markup/script payloads that a future dangerouslySetInnerHTML
// regression could turn into stored XSS.
// ---------------------------------------------------------------------------

{
  const violations = []
  const SUSPICIOUS_RE = /<script|javascript:|on\w+\s*=/i
  for (const file of i18nFiles) {
    const dict = JSON.parse(readFileSync(file, 'utf8'))
    for (const [key, value] of Object.entries(dict)) {
      if (typeof value === 'string' && SUSPICIOUS_RE.test(value)) {
        violations.push(`${file.slice(root.length + 1)}: key "${key}" contains markup/script-like content`)
      }
    }
  }
  check('i18n dictionaries carry no markup/script-like strings', violations)
}

// ---------------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n✗ frontend-boundaries.test FAILED (${failures} failure(s))\n`)
  process.exit(1)
}
console.log('\n✓ frontend-boundaries.test passed\n')
