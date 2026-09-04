#!/usr/bin/env node
/**
 * scripts/assert-i18n-guards.mjs
 *
 * Unified i18n anti-translation gate. Exercises both guards that every locale
 * FEAT in EPIC #108 (Phases 2-5: ar/he/fr/uk) must keep passing:
 *
 *   Guard 1 — HTML deny directives in src/client/index.html:
 *     • html[translate="no"]
 *     • meta[name="google"][content="notranslate"]
 *
 *   Guard 2 — translate.goog canonical-host redirect:
 *     The inline pre-paint <script> that sends visitors arriving via Google's
 *     server-side translation proxy (*.translate.goog) back to uzorai.com so
 *     they use the in-app language picker instead.
 *
 * Run this script (or npm test, which calls it) whenever a locale FEAT touches
 * src/client/index.html or LocaleProvider to confirm neither guard has
 * regressed. See docs/i18n-schema.md §Anti-translation guards for background.
 *
 * Supersedes the standalone scripts/assert-no-translate.mjs call in npm test.
 * The original script is kept intact and may still be called directly.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const docPath = join(here, '..', 'src', 'client', 'index.html')

let html
try {
  html = readFileSync(docPath, 'utf8')
} catch (err) {
  console.error(`\n✗ i18n-guards: cannot read ${docPath}\n${err.message}\n`)
  process.exit(1)
}

const checks = [
  // Guard 1a
  {
    name: 'html[translate="no"]',
    re: /<html\b[^>]*\btranslate\s*=\s*"no"/i,
    hint: 'add translate="no" to the <html> tag',
  },
  // Guard 1b
  {
    name: 'meta[name="google"][content="notranslate"]',
    re: /<meta\b(?=[^>]*\bname\s*=\s*"google")(?=[^>]*\bcontent\s*=\s*"notranslate")[^>]*>/i,
    hint: 'add <meta name="google" content="notranslate" />',
  },
  // Guard 2
  {
    name: 'translate.goog canonical-host redirect script',
    re: /\.translate\.goog/,
    hint: 'restore the pre-paint translate.goog redirect script in <head> (see index.html comment)',
  },
]

const failures = checks.filter((c) => !c.re.test(html))

if (failures.length > 0) {
  console.error(
    '\n✗ i18n-guards FAILED for src/client/index.html\n' +
      'UZOR provides first-party i18n; third-party translation must stay denied.\n' +
      failures.map((f) => `  - missing ${f.name} — ${f.hint}`).join('\n') +
      '\n',
  )
  process.exit(1)
}

console.log(
  '✓ i18n-guards passed (deny directives + translate.goog redirect — both present)',
)
