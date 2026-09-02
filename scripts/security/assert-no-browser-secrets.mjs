#!/usr/bin/env node
/**
 * scripts/security/assert-no-browser-secrets.mjs
 *
 * Regression guard for CHORE #88 (Worker/Browser Boundary Hardening):
 * scans the built, browser-visible artifacts (dist/client — bundles, HTML,
 * source maps if generated, manifests) for control-plane-credential- and
 * privileged-binding-shaped content. Requires `npm run build` to have run
 * first (dist/client must exist).
 *
 * The checker's OWN correctness is proven against SYNTHETIC fixtures
 * (test/fixtures/security/browser-secrets/) — the real scan below never
 * prints a matched value, only the pattern name, file, and line number, so
 * a genuine finding can't leak the secret into CI logs.
 *
 * Pure Node built-ins — no devDependency, matching
 * scripts/security/assert-workflow-hardening.mjs.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";

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
// Secret-shaped patterns. Every entry redacts the actual matched text — the
// report only ever names the pattern, never the value.
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  { name: "AWS access key ID", re: /AKIA[0-9A-Z]{16}/ },
  { name: "PEM private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: "generic secret-shaped assignment",
    re: /(api[_-]?key|secret|token|password)\s*[:=]\s*["'][A-Za-z0-9_-]{16,}["']/i,
  },
  // This org's own real secret env var names (.github/workflows/deploy.yml)
  // — the bare name has no legitimate reason to appear in client-shipped
  // output at all, value or not.
  { name: "CLOUDFLARE_API_TOKEN reference", re: /\bCLOUDFLARE_API_TOKEN\b/ },
  { name: "CLOUDFLARE_ACCOUNT_ID reference", re: /\bCLOUDFLARE_ACCOUNT_ID\b/ },
];

/**
 * @param {string} text
 * @returns {string[]} violation strings — never includes the matched value
 */
function scanTextForSecrets(text) {
  const violations = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    for (const { name, re } of SECRET_PATTERNS) {
      if (re.test(lines[i])) {
        violations.push(`line ${i + 1}: possible ${name} (value redacted)`);
      }
    }
  }
  return violations;
}

function walk(dir) {
  let out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}

const SCAN_EXTENSIONS = new Set([".js", ".mjs", ".html", ".map", ".json", ".webmanifest", ".css"]);

function scannableFiles(dir) {
  return walk(dir).filter((p) => SCAN_EXTENSIONS.has(extname(p)));
}

// ---------------------------------------------------------------------------
// Real scan: browser bundles, HTML, source maps (if generated), manifests,
// and public configuration under the built client output.
// ---------------------------------------------------------------------------

const distDir = join(root, "dist", "client");

if (!existsSync(distDir)) {
  console.error(
    "\n✗ assert-no-browser-secrets: dist/client not found — run `npm run build` before this check\n",
  );
  process.exit(1);
}

const artifacts = scannableFiles(distDir);

if (artifacts.length === 0) {
  console.error("\n✗ assert-no-browser-secrets: dist/client exists but no scannable artifacts were found\n");
  process.exit(1);
}

for (const file of artifacts) {
  const rel = file.slice(root.length + 1);
  report(`browser artifact clean: ${rel}`, scanTextForSecrets(readFileSync(file, "utf8")));
}

// ---------------------------------------------------------------------------
// Checker self-test against synthetic fixtures — proves the scanner
// actually distinguishes a leaked shape from clean code, not just that
// today's build output happens to pass.
// ---------------------------------------------------------------------------

const cleanBundle = read("test/fixtures/security/browser-secrets/clean-bundle.js");
const leakedBundle = read("test/fixtures/security/browser-secrets/leaked-bundle.js");

report("fixture: clean-bundle.js is not flagged", scanTextForSecrets(cleanBundle));
report(
  "fixture: leaked-bundle.js (synthetic) is flagged",
  scanTextForSecrets(leakedBundle).length > 0 ? [] : ["expected violations, got none"],
);

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-no-browser-secrets FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-no-browser-secrets passed\n");
