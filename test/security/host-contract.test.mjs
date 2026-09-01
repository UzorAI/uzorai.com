#!/usr/bin/env node
/**
 * test/security/host-contract.test.mjs
 *
 * Exercises the real src/server/security.ts logic (via ts-import.mjs — see
 * that file for why a transpile-and-import step is needed) against the
 * normalized host contract (CHORE #84 §1), the security headers (§2), and
 * the /healthz body allowlist (§2), so a regression in any of them fails
 * `npm test` instead of only being caught by a manual four-host check.
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { importTsModule } from './ts-import.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const securityPath = join(here, '..', '..', 'src', 'server', 'security.ts')

const {
  classifyHost,
  SECURITY_HEADERS,
  applySecurityHeaders,
  healthzBody,
  HEALTHZ_ALLOWED_METHODS,
} = await importTsModule(securityPath)

let failures = 0
function check(label, condition) {
  if (condition) {
    console.log(`✓ ${label}`)
  } else {
    console.error(`✗ ${label}`)
    failures++
  }
}

// ---------------------------------------------------------------------------
// Four-host contract: exactly these normalize to their documented role.
// ---------------------------------------------------------------------------

const HOST_CASES = [
  ['uzorai.com', 'staging'],
  ['www.uzorai.com', 'staging'],
  ['uzor.ai', 'production'],
  ['www.uzor.ai', 'production'],
  // Case/port/trailing-dot are legitimate HTTP variance, not spoofing.
  ['UZORAI.COM', 'staging'],
  ['Www.Uzor.Ai', 'production'],
  ['uzorai.com.', 'staging'],
  ['uzorai.com:8787', 'staging'],
  ['uzor.ai:443', 'production'],
]

const REJECT_CASES = [
  null,
  undefined,
  '',
  'evil.com',
  'uzorai.com.evil.com',
  'evil.com.uzorai.com',
  'notuzorai.com',
  'xuzorai.com',
  ' uzorai.com',
  'uzorai.com ',
  'uzorai.com evil.com',
  'uzorai.com\r\nX-Injected: 1',
  'uzorai.com\nHost: evil.com',
  '127.0.0.1',
  '[::1]',
  'uzorai.com/../uzor.ai',
]

for (const [input, expected] of HOST_CASES) {
  check(`classifyHost(${JSON.stringify(input)}) === ${expected}`, classifyHost(input) === expected)
}
for (const input of REJECT_CASES) {
  check(`classifyHost(${JSON.stringify(input)}) === null (rejected)`, classifyHost(input) === null)
}

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

const REQUIRED_HEADER_NAMES = [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Content-Security-Policy',
]
for (const name of REQUIRED_HEADER_NAMES) {
  check(`SECURITY_HEADERS declares ${name}`, typeof SECURITY_HEADERS[name] === 'string' && SECURITY_HEADERS[name].length > 0)
}
check("X-Frame-Options is DENY (clickjacking protection)", SECURITY_HEADERS['X-Frame-Options'] === 'DENY')
check(
  "Content-Security-Policy restricts object-src to 'none'",
  /object-src 'none'/.test(SECURITY_HEADERS['Content-Security-Policy']),
)
check(
  "Content-Security-Policy sets frame-ancestors 'none' (clickjacking protection)",
  /frame-ancestors 'none'/.test(SECURITY_HEADERS['Content-Security-Policy']),
)
check(
  'Permissions-Policy denies camera/microphone/geolocation/payment',
  ['camera=()', 'microphone=()', 'geolocation=()', 'payment=()'].every((d) =>
    SECURITY_HEADERS['Permissions-Policy'].includes(d),
  ),
)

const original = new Response('<html>hi</html>', {
  status: 200,
  headers: { 'content-type': 'text/html', etag: '"abc"' },
})
const secured = applySecurityHeaders(original)

check('applySecurityHeaders preserves status', secured.status === 200)
check('applySecurityHeaders preserves pre-existing headers', secured.headers.get('etag') === '"abc"')
check('applySecurityHeaders preserves content-type', secured.headers.get('content-type') === 'text/html')
for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
  check(`applySecurityHeaders sets ${name}`, secured.headers.get(name) === value)
}
check('applySecurityHeaders preserves the body', (await secured.text()) === '<html>hi</html>')

const errorResponse = new Response('nope', { status: 404 })
const securedError = applySecurityHeaders(errorResponse)
check('applySecurityHeaders also headers a non-2xx response', securedError.headers.get('X-Frame-Options') === 'DENY')

// ---------------------------------------------------------------------------
// /healthz: fixed, secret-free shape and method allowlist
// ---------------------------------------------------------------------------

const body = healthzBody()
check('healthzBody() has exactly the allowlisted keys', Object.keys(body).sort().join(',') === 'ok,service')
check('healthzBody().ok is true', body.ok === true)
check('healthzBody().service is "uzorai"', body.service === 'uzorai')
check(
  'HEALTHZ_ALLOWED_METHODS is GET/HEAD only',
  HEALTHZ_ALLOWED_METHODS.length === 2 &&
    HEALTHZ_ALLOWED_METHODS.includes('GET') &&
    HEALTHZ_ALLOWED_METHODS.includes('HEAD'),
)

// ---------------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n✗ host-contract.test FAILED (${failures} failure(s))\n`)
  process.exit(1)
}
console.log('\n✓ host-contract.test passed\n')
