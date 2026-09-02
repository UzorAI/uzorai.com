/**
 * Centralized hostname normalization and exact allowlisting for the four
 * approved uzorai.com / uzor.ai presentation hosts (EPIC #82 child: Worker/
 * Browser Boundary Hardening). Plain JS on purpose — this is the single
 * source of truth for both the Worker (src/server/index.ts, via
 * src/shared/workerApp.js) and the CI regression script
 * (scripts/security/assert-host-security.mjs), which imports this file
 * directly rather than reimplementing the logic, so the test can never drift
 * from what actually ships.
 */

/** @typedef {'staging' | 'production'} HostRole */

// Exact allowlist — no suffix/prefix/wildcard matching. uzorai.com and
// www.uzorai.com stay the staging/demo pair; uzor.ai and www.uzor.ai stay
// the stable-production pair. One Worker (this one) serves all four.
export const ALLOWED_HOSTS = Object.freeze({
  'uzorai.com': 'staging',
  'www.uzorai.com': 'staging',
  'uzor.ai': 'production',
  'www.uzor.ai': 'production',
})

const HOST_KEYS = new Set(Object.keys(ALLOWED_HOSTS))

// Host headers are ASCII per RFC 7230 §5.4 / RFC 3986 — any byte outside
// this printable-ASCII range signals percent-encoding tricks, raw Unicode
// homoglyphs, or control-character smuggling, not a legitimate host. Reject
// outright rather than trying to "normalize" it into something matchable.
const ASCII_HOST_RE = /^[\x21-\x7e]+$/
const PORT_RE = /^[0-9]+$/

/**
 * Normalize a raw `Host` header into an exact-match candidate, or return
 * null for anything malformed, suffixed, port-confused, case/Unicode-
 * confused, or otherwise not a literal member of ALLOWED_HOSTS. Never
 * redirects, never rewrites — the caller decides what null means (this
 * module always fails closed).
 * @param {string | null | undefined} rawHost
 * @returns {string | null}
 */
export function normalizeHost(rawHost) {
  if (typeof rawHost !== 'string' || rawHost.length === 0) return null
  if (!ASCII_HOST_RE.test(rawHost)) return null

  // Host headers carry at most one `:port` suffix here (none of our
  // approved hosts are IPv6 literals) — a second colon is ambiguous/
  // port-confused and rejected rather than guessed at.
  const parts = rawHost.split(':')
  if (parts.length > 2) return null

  const [hostPart, portPart] = parts
  if (portPart !== undefined && (portPart === '' || !PORT_RE.test(portPart))) {
    return null
  }

  // Lowercasing folds ordinary case confusion (UZORAI.COM). It does NOT
  // fold Unicode homoglyphs or punycode (xn--) labels onto a real host —
  // exact-match against the ASCII allowlist below rejects those instead of
  // coercing them into a match.
  const lower = hostPart.toLowerCase()
  return HOST_KEYS.has(lower) ? lower : null
}

/**
 * @param {string | null | undefined} rawHost
 * @returns {boolean}
 */
export function isAllowedHost(rawHost) {
  return normalizeHost(rawHost) !== null
}

/**
 * @param {string | null | undefined} normalizedHost a value already
 *   returned by normalizeHost (or any raw host — non-members resolve null)
 * @returns {HostRole | null}
 */
export function getHostRole(normalizedHost) {
  if (typeof normalizedHost !== 'string') return null
  return ALLOWED_HOSTS[normalizedHost] ?? null
}
