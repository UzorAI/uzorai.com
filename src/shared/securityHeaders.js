/**
 * Security response headers for every host this Worker serves (EPIC #82
 * child: Worker/Browser Boundary Hardening). Plain JS — imported directly by
 * src/shared/workerApp.js and by the CI regression script
 * scripts/security/assert-security-headers.mjs, so the test can never drift
 * from what actually ships.
 */

// SHA-256 hashes (CSP `script-src` hash-source form) of the two inline
// pre-paint <script> bodies in src/client/index.html — the translate.goog
// canonical-host guard and the pre-paint theme snippet. Computed over the
// exact text node between <script> and </script> (UTF-8), matching how a
// browser evaluates a CSP hash source. Hashing lets script-src stay
// 'self'-only (no 'unsafe-inline') without an HTMLRewriter nonce rewrite on
// every request. scripts/security/assert-security-headers.mjs recomputes
// these from the live index.html and fails loudly if they ever drift.
export const INLINE_SCRIPT_HASHES = Object.freeze([
  "'sha256-hC99i7jZgIhZTLOH8GDOTVN/7joUX/IqPI7bPSXwXYM='",
  "'sha256-kBaje8dx7wXla8MtjuY8vk4/Vr6QRnLM8uSmJO9shJU='",
])

/** @returns {string} */
export function buildContentSecurityPolicy() {
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${INLINE_SCRIPT_HASHES.join(' ')}`,
    // React sets element.style via the CSSOM (style property assignment),
    // not a parsed inline `style=""` attribute string, so it is not gated
    // by CSP style-src — 'self' alone (no 'unsafe-inline') covers the
    // stylesheet <link>s (tokens.css, rtl.css) and stays strict.
    "style-src 'self'",
    // Small imported SVGs (e.g. the brand mark) can be Vite-inlined as
    // data: URIs below the default asset-inlining threshold.
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ]
  return directives.join('; ')
}

/** @returns {Readonly<Record<string, string>>} */
export function buildSecurityHeaders() {
  return Object.freeze({
    'content-security-policy': buildContentSecurityPolicy(),
    // Framing protection: frame-ancestors above covers modern browsers;
    // X-Frame-Options is the legacy fallback for the few that don't honour
    // CSP frame-ancestors.
    'x-frame-options': 'DENY',
    // MIME-sniffing protection.
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    // Feature permissions: deny browser features this static site never
    // uses. Empty allowlist () means "no origin, including self".
    'permissions-policy':
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  })
}

export const SECURITY_HEADERS = buildSecurityHeaders()
