/**
 * src/server/security.ts — Worker/browser boundary hardening (CHORE #84).
 *
 * Deliberately dependency-free (no Hono import, only the Fetch-API globals
 * Request/Response/Headers that exist in both the Workers runtime and modern
 * Node): this lets `test/security/*.test.mjs` transpile and import this exact
 * file at test time without a bundler, so the tests exercise the real
 * production logic instead of a hand-copied stand-in.
 *
 * Rollback: this file and its two call sites in src/server/index.ts are
 * purely additive (new headers, a host allowlist gate, an explicit /healthz
 * method guard). Reverting the commit that introduces them fully restores
 * prior behavior — no data migration, no DNS/route/deploy change involved.
 */

/** The four bound custom domains, split by presentation role (CHORE #84 §1). */
export type HostRole = 'staging' | 'production'

const STAGING_HOSTS: ReadonlySet<string> = new Set(['uzorai.com', 'www.uzorai.com'])
const PRODUCTION_HOSTS: ReadonlySet<string> = new Set(['uzor.ai', 'www.uzor.ai'])

// Post-normalization charset gate: a legitimate Host header value is a DNS
// name, never whitespace, control characters, or CR/LF (header-injection
// payloads collapse to this shape when smuggled into a Host value). Rejecting
// anything outside this set before the exact-match lookup means a spoofed
// host can never coincidentally satisfy the allowlist.
const HOSTNAME_CHARS_RE = /^[a-z0-9.-]+$/

/**
 * Lowercases, strips an optional `:port` suffix, and strips a single
 * trailing FQDN dot. Does NOT trim whitespace — a Host value carrying
 * leading/trailing/internal whitespace is malformed and must fail the
 * charset check in {@link classifyHost}, not be silently repaired.
 */
export function normalizeHost(rawHost: string | null | undefined): string {
  if (typeof rawHost !== 'string' || rawHost === '') return ''
  const lower = rawHost.toLowerCase()
  const colonIndex = lower.indexOf(':')
  const withoutPort = colonIndex === -1 ? lower : lower.slice(0, colonIndex)
  return withoutPort.length > 1 && withoutPort.endsWith('.')
    ? withoutPort.slice(0, -1)
    : withoutPort
}

/**
 * Classifies a raw `Host` header value into a presentation role. Returns
 * `null` for anything not an exact match on one of the four bound domains —
 * including subdomain/suffix spoofing (`uzorai.com.evil.com`), malformed
 * input, and absent hosts — so callers can treat `null` as "select no
 * staging/production presentation; respond safely instead."
 */
export function classifyHost(rawHost: string | null | undefined): HostRole | null {
  const host = normalizeHost(rawHost)
  if (host === '' || !HOSTNAME_CHARS_RE.test(host)) return null
  if (STAGING_HOSTS.has(host)) return 'staging'
  if (PRODUCTION_HOSTS.has(host)) return 'production'
  return null
}

/**
 * CSP-ready baseline: locked to same-origin for every fetch directive, with
 * `'unsafe-inline'` retained only where the current document actually needs
 * it (the two head <script> blocks in src/client/index.html, and React's
 * inline `style` attributes) — the tightening path is nonces/hashes on those
 * two scripts, not a rewrite of this header. Not a rewrite of this header.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
}

/**
 * Returns a new Response carrying the original body/status plus the security
 * headers overlaid on top of (never replacing) any headers already set.
 * Rebuilding via `new Response(...)` — rather than mutating `response.headers`
 * in place — works regardless of whether the input Response's Headers object
 * is the mutable or guarded kind, and safely re-wraps a streaming asset body.
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/** Exact, allowlisted body for the liveness probe — no env/binding/config leakage. */
export function healthzBody(): { ok: true; service: 'uzorai' } {
  return { ok: true, service: 'uzorai' }
}

/** Methods accepted by /healthz; anything else gets an explicit 405 + Allow header. */
export const HEALTHZ_ALLOWED_METHODS: readonly string[] = ['GET', 'HEAD']
