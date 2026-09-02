#!/usr/bin/env node
/**
 * scripts/security/assert-security-headers.mjs
 *
 * Regression guard for CHORE #88 (Worker/Browser Boundary Hardening):
 * checks the REAL security-headers module (src/shared/securityHeaders.js —
 * the same file the Worker imports at runtime) for the required
 * protections, and — critically — recomputes the SHA-256 hashes of the two
 * inline pre-paint <script> blocks in the live src/client/index.html and
 * asserts they exactly equal the hashes baked into the CSP script-src
 * directive. If a future edit to index.html's inline scripts doesn't also
 * update those hashes, this fails loudly here instead of silently breaking
 * the app (CSP blocking the script) or silently weakening the policy
 * (falling back to 'unsafe-inline').
 *
 * Pure Node built-ins — no devDependency.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  INLINE_SCRIPT_HASHES,
  buildContentSecurityPolicy,
  SECURITY_HEADERS,
} from "../../src/shared/securityHeaders.js";

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
// Required headers present with the expected protections.
// ---------------------------------------------------------------------------

const csp = buildContentSecurityPolicy();

report("CSP: default-src is locked to 'self'", csp.includes("default-src 'self'") ? [] : ["missing default-src 'self'"]);
report("CSP: frame-ancestors 'none' (framing protection)", csp.includes("frame-ancestors 'none'") ? [] : ["missing frame-ancestors 'none'"]);
report("CSP: object-src 'none'", csp.includes("object-src 'none'") ? [] : ["missing object-src 'none'"]);
report("CSP: script-src has no 'unsafe-inline'", csp.includes("script-src") && !/script-src[^;]*'unsafe-inline'/.test(csp) ? [] : ["script-src allows 'unsafe-inline'"]);

report(
  "headers: MIME-sniffing, framing, referrer, permissions protections present",
  [
    ["x-content-type-options", "nosniff"],
    ["x-frame-options", "DENY"],
    ["referrer-policy"],
    ["permissions-policy"],
    ["content-security-policy"],
  ].flatMap(([name, expected]) => {
    const value = SECURITY_HEADERS[name];
    if (value === undefined) return [`missing header: ${name}`];
    if (expected !== undefined && value !== expected) {
      return [`header ${name} expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`];
    }
    return [];
  }),
);

// ---------------------------------------------------------------------------
// Inline-script hash regression: recompute from the live index.html.
// ---------------------------------------------------------------------------

const indexHtml = read("src/client/index.html");
const inlineScriptBodies = [...indexHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

report(
  "index.html has exactly two inline (non-module) <script> blocks",
  inlineScriptBodies.length === 2
    ? []
    : [`expected 2 inline <script> blocks, found ${inlineScriptBodies.length}`],
);

const computedHashes = inlineScriptBodies.map(
  (body) => `'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`,
);

report(
  "CSP script-src hashes match the live index.html inline scripts",
  computedHashes.length === INLINE_SCRIPT_HASHES.length &&
    computedHashes.every((h, i) => h === INLINE_SCRIPT_HASHES[i])
    ? []
    : [
        `computed ${JSON.stringify(computedHashes)} but securityHeaders.js has ${JSON.stringify(INLINE_SCRIPT_HASHES)} — update INLINE_SCRIPT_HASHES in src/shared/securityHeaders.js`,
      ],
);

report(
  "CSP script-src includes both computed inline-script hashes",
  computedHashes.filter((h) => !csp.includes(h)).map((h) => `script-src does not include ${h}`),
);

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-security-headers FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-security-headers passed\n");
