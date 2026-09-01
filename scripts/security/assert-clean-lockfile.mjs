#!/usr/bin/env node
/**
 * scripts/security/assert-clean-lockfile.mjs
 *
 * CHORE #84 §4: verify package.json and package-lock.json haven't drifted
 * apart — every declared dependency/devDependency has a matching root-package
 * range and a resolved node_modules/<name> entry in the lockfile — WITHOUT
 * running `npm ci`/`npm install` (no network, no registry dependency). This
 * catches "edited package.json, forgot to run npm install" before a
 * consumer's `npm ci` (which trusts the lockfile completely and would
 * silently install the stale, wrong versions) ever runs.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))

const failures = []

if (lock.name !== pkg.name) {
  failures.push(`lockfile "name" (${lock.name}) does not match package.json "name" (${pkg.name})`)
}
if (lock.version !== pkg.version) {
  failures.push(`lockfile "version" (${lock.version}) does not match package.json "version" (${pkg.version})`)
}

const rootEntry = lock.packages?.['']
if (!rootEntry) {
  failures.push('lockfile is missing the root package entry (packages[""]) — regenerate with `npm install`')
} else {
  const declaredInLock = { ...(rootEntry.dependencies ?? {}), ...(rootEntry.devDependencies ?? {}) }
  const declaredInPkg = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }

  for (const [name, range] of Object.entries(declaredInPkg)) {
    if (!(name in declaredInLock)) {
      failures.push(`"${name}" is declared in package.json but missing from the lockfile root entry`)
      continue
    }
    if (declaredInLock[name] !== range) {
      failures.push(
        `"${name}" range mismatch — package.json wants "${range}", lockfile root entry has "${declaredInLock[name]}"`,
      )
    }
    if (!(`node_modules/${name}` in (lock.packages ?? {}))) {
      failures.push(`"${name}" has no resolved node_modules/${name} entry in the lockfile`)
    }
  }

  for (const name of Object.keys(declaredInLock)) {
    if (!(name in declaredInPkg)) {
      failures.push(`"${name}" is declared in the lockfile root entry but not in package.json — stale lockfile entry`)
    }
  }
}

if (failures.length > 0) {
  console.error('✗ clean-lockfile check FAILED — package.json and package-lock.json have drifted apart')
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nRun `npm install` to regenerate the lockfile, then commit the result.\n')
  process.exit(1)
}

console.log('✓ clean-lockfile check passed (package.json and package-lock.json agree)')
