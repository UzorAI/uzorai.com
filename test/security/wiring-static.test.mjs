#!/usr/bin/env node
/**
 * test/security/wiring-static.test.mjs
 *
 * host-contract.test.mjs proves src/server/security.ts is correct in
 * isolation; this proves src/server/index.ts actually *calls* it on every
 * request path. A static text check (matching the existing convention in
 * scripts/security/assert-workflow-hardening.mjs) rather than an executed
 * request, because index.ts imports the `hono` package and is meant to run
 * inside the Workers runtime — spinning up a Miniflare-equivalent here would
 * be a much heavier dependency than this repo currently carries for one
 * regression guard.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const indexTs = readFileSync(join(root, 'src', 'server', 'index.ts'), 'utf8')

let failures = 0
function check(label, condition) {
  if (condition) {
    console.log(`✓ ${label}`)
  } else {
    console.error(`✗ ${label}`)
    failures++
  }
}

check(
  'index.ts imports the host/headers/healthz contract from ./security',
  /from ['"]\.\/security['"]/.test(indexTs) &&
    /classifyHost/.test(indexTs) &&
    /applySecurityHeaders/.test(indexTs) &&
    /healthzBody/.test(indexTs),
)
check(
  'index.ts applies security headers to every response (app.use middleware)',
  /app\.use\(\s*['"]\*['"]/.test(indexTs) && /applySecurityHeaders\(c\.res\)/.test(indexTs),
)
check(
  'index.ts registers a global error handler that does not echo err.message/err.stack',
  /app\.onError\(/.test(indexTs) && !/err\.(message|stack)/.test(indexTs),
)
check(
  'index.ts rejects an unclassified host before reaching the ASSETS binding',
  /classifyHost\(c\.req\.header\(['"]host['"]\)\)/.test(indexTs) &&
    /if \(!role\)/.test(indexTs) &&
    indexTs.indexOf('if (!role)') < indexTs.indexOf('c.env.ASSETS.fetch'),
)
check(
  'index.ts guards /healthz against non-GET/HEAD methods with an explicit 405',
  /HEALTHZ_ALLOWED_METHODS/.test(indexTs) && /405/.test(indexTs),
)

if (failures > 0) {
  console.error(`\n✗ wiring-static.test FAILED (${failures} failure(s))\n`)
  process.exit(1)
}
console.log('\n✓ wiring-static.test passed\n')
