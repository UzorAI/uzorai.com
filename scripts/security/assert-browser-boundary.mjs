#!/usr/bin/env node
/**
 * scripts/security/assert-browser-boundary.mjs
 *
 * Regression guard for CHORE #88 (Worker/Browser Boundary Hardening):
 * exercises the REAL client-side boundary modules (src/shared/urlSafety.js,
 * src/shared/safeStorage.js — the exact files LocaleProvider, initTheme, and
 * SafeExternalLink import at runtime) against malicious localization/
 * storage/URL values, and statically asserts the app never opens a dynamic-
 * HTML-injection path or ships literal markup in a locale dictionary.
 *
 * Pure Node built-ins — no devDependency, no DOM. safeStorage.js is
 * exercised against a minimal in-memory localStorage stand-in (this file's
 * own fixture, not a browser) since it already guards `typeof window`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { isSafeExternalUrl, isSafeInternalPath, SAFE_EXTERNAL_REL } from "../../src/shared/urlSafety.js";

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
// isSafeExternalUrl: accepts the app's real external link, rejects malicious
// shapes.
// ---------------------------------------------------------------------------

report(
  "safe external URL accepted (the app's real Docs link)",
  isSafeExternalUrl("https://skills.uzorai.com/mcp") ? [] : ["expected accepted, rejected"],
);

report("SAFE_EXTERNAL_REL includes noopener and noreferrer", (() => {
  const violations = [];
  if (!SAFE_EXTERNAL_REL.includes("noopener")) violations.push("missing noopener");
  if (!SAFE_EXTERNAL_REL.includes("noreferrer")) violations.push("missing noreferrer");
  return violations;
})());

const UNSAFE_EXTERNAL_URLS = [
  "javascript:alert(1)",
  "JAVASCRIPT:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "file:///etc/passwd",
  "//evil.com/phish",
  "http://uzorai.com", // http, not https
  "https://user:pass@evil.com", // credential-bearing
  "https://uzorai.com@evil.com", // open-redirect / userinfo trick — host is evil.com
  "https://evil.com" + String.fromCharCode(0), // embedded NUL
  "https://evil.com" + String.fromCharCode(13) + String.fromCharCode(10) + "Set-Cookie: x", // CRLF smuggling
  "",
  "   ",
  null,
  undefined,
  42,
];

report(
  "malicious/malformed external URLs rejected",
  UNSAFE_EXTERNAL_URLS.filter((u) => isSafeExternalUrl(u)).map(
    (u) => `expected rejected, accepted: ${JSON.stringify(u)}`,
  ),
);

// ---------------------------------------------------------------------------
// isSafeInternalPath: exact-allowlisted routes only.
// ---------------------------------------------------------------------------

const ROUTES_TS = read("src/client/config/routes.ts");
const allowedPaths = [...ROUTES_TS.matchAll(/path:\s*'([^']*)'/g)].map((m) => m[1]);

report(
  "internal path allowlist parsed from routes.ts is non-empty",
  allowedPaths.length > 0 ? [] : ["failed to parse any paths from src/client/config/routes.ts"],
);

report(
  "every real route accepted as a safe internal path",
  allowedPaths.filter((p) => !isSafeInternalPath(p, allowedPaths)).map((p) => `expected accepted: ${p}`),
);

const UNSAFE_INTERNAL_PATHS = [
  "/does-not-exist",
  "/../etc/passwd",
  "/platform/../../../etc/passwd",
  "//evil.com",
  "/platform?redirect=https://evil.com",
  "/platform#<script>",
  "/platform\\@evil.com",
  "",
  null,
  undefined,
];

report(
  "unknown/traversal/query-smuggled internal paths rejected",
  UNSAFE_INTERNAL_PATHS.filter((p) => isSafeInternalPath(p, allowedPaths)).map(
    (p) => `expected rejected, accepted: ${JSON.stringify(p)}`,
  ),
);

// ---------------------------------------------------------------------------
// safeStorage: bounded read/write against a fixture localStorage.
// ---------------------------------------------------------------------------

function makeMockStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    _store: store,
  };
}

async function testSafeStorage() {
  const violations = [];

  // Fresh module instance per storage fixture (ESM caches by resolved URL,
  // so re-import with a cache-busting query string — cheap and avoids
  // reaching for a mocking library for one test file).
  const mod = await import(`../../src/shared/safeStorage.js?t=${Date.now()}-${Math.random()}`);
  const { readBoundedStorage, writeBoundedStorage, MAX_STORAGE_KEY_LENGTH, MAX_STORAGE_VALUE_LENGTH } = mod;

  globalThis.window = { localStorage: makeMockStorage() };
  try {
    if (writeBoundedStorage("uzor-locale", "es") !== true) violations.push("expected write to succeed for a normal value");
    if (readBoundedStorage("uzor-locale") !== "es") violations.push("expected read-back to return the written value");

    const oversizedKey = "k".repeat(MAX_STORAGE_KEY_LENGTH + 1);
    if (writeBoundedStorage(oversizedKey, "v") !== false) violations.push("expected write to reject an oversized key");
    if (readBoundedStorage(oversizedKey) !== null) violations.push("expected read to reject an oversized key");

    const oversizedValue = "v".repeat(MAX_STORAGE_VALUE_LENGTH + 1);
    if (writeBoundedStorage("uzor-theme", oversizedValue) !== false) violations.push("expected write to reject an oversized value");

    // A pre-existing oversized value (planted directly, bypassing our
    // writer) must still be rejected on read.
    window.localStorage.setItem("uzor-planted", oversizedValue);
    if (readBoundedStorage("uzor-planted") !== null) violations.push("expected read to reject a pre-existing oversized value");

    // Storage that throws (private mode / quota) never propagates.
    globalThis.window = {
      localStorage: {
        getItem: () => {
          throw new Error("quota exceeded");
        },
        setItem: () => {
          throw new Error("quota exceeded");
        },
      },
    };
    if (readBoundedStorage("uzor-theme") !== null) violations.push("expected read to swallow a throwing storage and return null");
    if (writeBoundedStorage("uzor-theme", "dark") !== false) violations.push("expected write to swallow a throwing storage and return false");

    globalThis.window = undefined;
    if (readBoundedStorage("uzor-theme") !== null) violations.push("expected read to return null with no window");
  } finally {
    delete globalThis.window;
  }

  return violations;
}

report("bounded storage: normal read/write, oversized key/value, throwing storage", await testSafeStorage());

// ---------------------------------------------------------------------------
// Static guard: no dynamic-HTML-injection path anywhere in the client.
// ---------------------------------------------------------------------------

function walk(dir) {
  let out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}

const clientFiles = walk(join(root, "src/client")).filter((f) => [".tsx", ".ts"].includes(extname(f)));
const dangerousInnerHtml = clientFiles.filter((f) => /dangerouslySetInnerHTML|\.innerHTML\s*=/.test(readFileSync(f, "utf8")));

report(
  "no dangerouslySetInnerHTML / .innerHTML assignment in src/client",
  dangerousInnerHtml.map((f) => `dynamic-HTML-injection path found in ${f.slice(root.length + 1)}`),
);

// ---------------------------------------------------------------------------
// Static guard: locale dictionaries are display data only — no markup.
// ---------------------------------------------------------------------------

const i18nDir = join(root, "src/client/i18n");
const dictFiles = readdirSync(i18nDir).filter((f) => f.endsWith(".json"));

report(
  "locale dictionaries found",
  dictFiles.length > 0 ? [] : ["no *.json dictionaries found under src/client/i18n"],
);

const markupViolations = dictFiles.flatMap((file) => {
  const dict = JSON.parse(read(`src/client/i18n/${file}`));
  return Object.entries(dict)
    .filter(([, value]) => typeof value === "string" && value.includes("<"))
    .map(([key]) => `${file}: key "${key}" contains a literal "<" — locale strings must be plain text`);
});

report("locale dictionaries contain no embedded markup", markupViolations);

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-browser-boundary FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-browser-boundary passed\n");
