/**
 * Centralized internal/external URL validation (EPIC #82 child: Worker/
 * Browser Boundary Hardening). Plain JS — imported directly by
 * src/client/components/SafeExternalLink.tsx and by the CI regression
 * script scripts/security/assert-browser-boundary.mjs, so the test can
 * never drift from what actually ships.
 *
 * Internal routes and external destinations get different rules: internal
 * paths are exact-matched against a caller-supplied allowlist (the app's
 * own ROUTES config); external destinations must be a well-formed https:
 * URL with no embedded credentials, control characters, or protocol-
 * relative smuggling.
 */

// A route path in this app is always `/`, `/word`, or `/word/word...` —
// nothing else is a legitimate internal target. Rejects query strings,
// fragments, backslashes, and traversal segments before the allowlist check
// even runs.
const INTERNAL_PATH_RE = /^\/[a-zA-Z0-9/_-]*$/

/**
 * @param {string} path
 * @param {readonly string[]} allowedPaths exact-match allowlist (e.g. the
 *   app's ROUTES paths)
 * @returns {boolean}
 */
export function isSafeInternalPath(path, allowedPaths) {
  if (typeof path !== 'string') return false
  if (!INTERNAL_PATH_RE.test(path)) return false
  if (path.includes('..')) return false
  return allowedPaths.includes(path)
}

// C0/C1 control characters, including bare CR/LF/TAB — these are the
// classic header/URL-smuggling vector and are rejected before any parsing,
// regardless of where in the string they appear. Built from numeric char
// codes (rather than a literal control-character range in source) so no raw
// control byte or ambiguous escape ever has to survive a copy/paste or an
// editor round-trip.
const CONTROL_CHAR_CODES = [
  ...Array.from({ length: 32 }, (_, i) => i), // 0x00-0x1F
  127, // DEL
  ...Array.from({ length: 32 }, (_, i) => 128 + i), // 0x80-0x9F
]
const CONTROL_CHAR_SET = new Set(CONTROL_CHAR_CODES)

/** @param {string} value */
function containsControlChar(value) {
  for (let i = 0; i < value.length; i++) {
    if (CONTROL_CHAR_SET.has(value.charCodeAt(i))) return true
  }
  return false
}

/**
 * Safe *external* destination: exactly `https:`, no embedded userinfo
 * (credential-bearing / `user:pass@host` smuggling), no control characters,
 * and not protocol-relative (`//host/...`, which a URL parser would
 * otherwise happily resolve against the current page's own scheme).
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeExternalUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false
  if (containsControlChar(url)) return false
  if (url.startsWith('//')) return false

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  if (parsed.protocol !== 'https:') return false
  if (parsed.username !== '' || parsed.password !== '') return false
  if (parsed.hostname.length === 0) return false

  return true
}

/** `rel` attribute every externally-navigating anchor must carry. */
export const SAFE_EXTERNAL_REL = 'noopener noreferrer'
