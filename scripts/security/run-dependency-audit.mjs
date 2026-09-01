#!/usr/bin/env node
/**
 * scripts/security/run-dependency-audit.mjs
 *
 * CHORE #84 §4 / AC4: `npm audit` needs live registry access, which the
 * `npm test`/`npm run build` chain must not depend on (per this chore's "no
 * live credential/network dependency" constraint on the blocking path) — so
 * this runs as its own `npm run security:audit` step, never wired into
 * test/build. When the registry is unreachable, that fact is recorded to
 * security-audit-report.json (gitignored) as its own outcome rather than
 * failing the whole run; only an audit that actually completed AND found a
 * high/critical vulnerability exits non-zero.
 */
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const reportPath = join(root, 'security-audit-report.json')

// Strip inherited npm_config_*/NPM_CONFIG_* vars before spawning: when this
// script runs as `npm run security:audit`, the outer npm process re-exports
// its entire resolved config as env vars, and the child `npm audit`
// inherits it — in this repo's CI sandbox that includes a project-scoped
// script-allowlist setting `npm audit` rejects outright (EALLOWSCRIPTS),
// which produced a `{"error": {...}}` JSON body with no `metadata` field.
// A clean env reproduces a plain top-level `npm audit` invocation.
const cleanEnv = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => !/^npm_config_/i.test(k)),
)

const result = spawnSync('npm', ['audit', '--json'], { cwd: root, encoding: 'utf8', env: cleanEnv })

const timestamp = new Date().toISOString()
let record
let exitCode = 0

let parsed = null
if (result.stdout) {
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    parsed = null
  }
}

const vulnerabilities = parsed?.metadata?.vulnerabilities ?? null

if (result.error || !vulnerabilities) {
  // Covers: registry unreachable, npm invocation failed, or npm returned a
  // parseable-but-error-shaped body (e.g. EALLOWSCRIPTS) with no usable
  // vulnerabilities report. All are "could not audit," never "0 vulnerabilities."
  record = {
    ok: false,
    reason: 'npm audit did not return a usable vulnerabilities report (registry unreachable, or audit blocked in this environment) — recorded separately, not treated as a build failure',
    detail: String(result.error?.message ?? parsed?.error?.summary ?? result.stderr ?? '').slice(0, 2000),
    timestamp,
  }
  console.warn('⚠ npm audit did not complete — see security-audit-report.json')
} else {
  record = { ok: true, vulnerabilities, timestamp }
  const highOrCritical = (vulnerabilities.high ?? 0) + (vulnerabilities.critical ?? 0)
  if (highOrCritical > 0) {
    console.error(`✗ npm audit found ${highOrCritical} high/critical vulnerabilities`)
    exitCode = 1
  } else {
    console.log('✓ npm audit completed — no high/critical vulnerabilities')
  }
}

writeFileSync(reportPath, JSON.stringify(record, null, 2) + '\n', 'utf8')
console.log(`Audit record written to ${reportPath}`)
process.exit(exitCode)
