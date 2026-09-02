#!/usr/bin/env node
/**
 * scripts/security/assert-host-security.mjs
 *
 * Regression guard for CHORE #88 (Worker/Browser Boundary Hardening):
 * exercises the REAL host-allowlist module (src/shared/hostAllowlist.js —
 * the same file the Worker imports at runtime) against the four approved
 * hosts plus a battery of malformed/suffixed/port-confused/case/Unicode-
 * confused inputs, and cross-checks it against wrangler.toml's routes list
 * so the deploy config and the code allowlist can never silently drift
 * apart.
 *
 * Pure Node built-ins — no devDependency, matching
 * scripts/security/assert-workflow-hardening.mjs.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  ALLOWED_HOSTS,
  normalizeHost,
  isAllowedHost,
  getHostRole,
} from "../../src/shared/hostAllowlist.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relPath) => readFileSync(join(root, relPath), "utf8");

let failures = [];

function report(label, violations) {
  if (violations.length === 0) {
    console.log(`✓ ${label}`);
  } else {
    console.error(`✗ ${label}`);
    for (const v of violations) console.error(`  - ${v}`);
    failures = failures.concat(violations.map((v) => `${label}: ${v}`));
  }
}

// ---------------------------------------------------------------------------
// The four approved hosts accept, preserve their staging/production role.
// ---------------------------------------------------------------------------

const APPROVED = {
  "uzorai.com": "staging",
  "www.uzorai.com": "staging",
  "uzor.ai": "production",
  "www.uzor.ai": "production",
};

report(
  "approved hosts accepted with the correct presentation role",
  Object.entries(APPROVED).flatMap(([host, role]) => {
    const violations = [];
    if (!isAllowedHost(host)) violations.push(`expected accepted, rejected: ${JSON.stringify(host)}`);
    const normalized = normalizeHost(host);
    if (getHostRole(normalized) !== role) {
      violations.push(`expected role ${role} for ${host}, got ${getHostRole(normalized)}`);
    }
    return violations;
  }),
);

report(
  "approved hosts case-insensitive (case confusion folds, doesn't bypass)",
  Object.keys(APPROVED)
    .map((h) => h.toUpperCase())
    .filter((h) => !isAllowedHost(h))
    .map((h) => `expected accepted (case-folded), rejected: ${JSON.stringify(h)}`),
);

report(
  "approved hosts accept a numeric port suffix",
  Object.keys(APPROVED)
    .filter((h) => !isAllowedHost(`${h}:443`))
    .map((h) => `expected accepted with :443, rejected: ${JSON.stringify(h)}`),
);

// ---------------------------------------------------------------------------
// Malformed / suffixed / port-confused / case-Unicode-confused / unknown
// hosts must all fail closed — never coerced onto a real host.
// ---------------------------------------------------------------------------

const MUST_REJECT = [
  null,
  undefined,
  "",
  "evil.com",
  "uzorai.com.evil.com", // suffixed
  "evil-uzorai.com", // prefixed
  "uzorai.com.", // trailing dot
  "uzorai.com:evil.com", // port-confused (non-numeric "port")
  "uzorai.com:", // empty port
  "uzorai.com:80:80", // ambiguous multi-colon
  "uzoraі.com", // Cyrillic і (U+0456) homoglyph — looks like uzorai.com
  "xn--uzori-2be.com", // punycode form of the homoglyph above
  "uzorai.com" + String.fromCharCode(0), // embedded NUL byte
  "uzorai.com" + String.fromCharCode(13) + String.fromCharCode(10) + "host: evil.com", // CRLF header-smuggling attempt
  "uzorai.com ", // trailing whitespace
  " uzorai.com", // leading whitespace
  "localhost",
  "uzorai.workers.dev",
  "192.168.0.1",
];

report(
  "malformed/suffixed/port-confused/Unicode-confused/unknown hosts rejected",
  MUST_REJECT.filter((h) => isAllowedHost(h)).map(
    (h) => `expected rejected, accepted: ${JSON.stringify(h)}`,
  ),
);

report(
  "rejected hosts normalize to null (no partial/guessed match)",
  MUST_REJECT.filter((h) => normalizeHost(h) !== null).map(
    (h) => `expected null, got: ${JSON.stringify(normalizeHost(h))} for ${JSON.stringify(h)}`,
  ),
);

// ---------------------------------------------------------------------------
// Drift guard: wrangler.toml's bound custom-domain routes must be exactly
// the same four hosts as the code allowlist — in both directions.
// ---------------------------------------------------------------------------

const wranglerToml = read("wrangler.toml");
const routePatterns = [...wranglerToml.matchAll(/pattern\s*=\s*"([^"]+)"/g)].map((m) => m[1]);

const allowlistKeys = Object.keys(ALLOWED_HOSTS);

report(
  "wrangler.toml routes match the code allowlist exactly (no drift)",
  [
    ...allowlistKeys
      .filter((h) => !routePatterns.includes(h))
      .map((h) => `code allowlist has ${h} but wrangler.toml routes do not`),
    ...routePatterns
      .filter((h) => !allowlistKeys.includes(h))
      .map((h) => `wrangler.toml routes has ${h} but code allowlist does not`),
  ],
);

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-host-security FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-host-security passed\n");
