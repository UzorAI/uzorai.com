#!/usr/bin/env node
/**
 * scripts/security/assert-worker-boundary.mjs
 *
 * Regression guard for CHORE #88 (Worker/Browser Boundary Hardening):
 * exercises the REAL Worker app (src/shared/workerApp.js — the exact object
 * src/server/index.ts re-exports as the Worker entrypoint) via Hono's
 * in-process `app.request()`, covering: all four approved hosts, unknown
 * hosts, unsupported methods, exception redaction, and security-header
 * presence on every response — including error/rejection paths.
 *
 * Pure Node built-ins + the app's own runtime dependency (hono, already a
 * `dependencies` entry) — no devDependency, no Workers runtime required.
 *
 * Deliberately not a `wrangler dev` + curl smoke test: local `wrangler dev`
 * with `routes`/`custom_domain` configured overrides the incoming `Host`
 * header to match the first route pattern regardless of what the client
 * sends, so it can't exercise host-allowlist rejection at all. Production
 * Cloudflare Workers receive the real client Host header unmodified — this
 * in-process test against the actual app object is the accurate regression.
 */
import { createApp } from "../../src/shared/workerApp.js";
import { SECURITY_HEADERS } from "../../src/shared/securityHeaders.js";

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

function assertSecurityHeaders(res, label) {
  const violations = [];
  for (const [name, expected] of Object.entries(SECURITY_HEADERS)) {
    const actual = res.headers.get(name);
    if (actual !== expected) {
      violations.push(`${label}: header ${name} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }
  return violations;
}

// Mock ASSETS binding — proves the Worker reaches the assets fetch on an
// accepted host/method, and lets the exception test simulate a real binding
// throwing without needing the Workers runtime.
function mockEnv({ throwOnFetch = false } = {}) {
  return {
    ASSETS: {
      fetch: async () => {
        if (throwOnFetch) throw new Error("simulated ASSETS binding failure — should never reach the client");
        return new Response("<html>ok</html>", { status: 200, headers: { "content-type": "text/html" } });
      },
    },
  };
}

// ---------------------------------------------------------------------------
// All four approved hosts serve content and carry security headers.
// ---------------------------------------------------------------------------

{
  const app = createApp();
  const hosts = ["uzorai.com", "www.uzorai.com", "uzor.ai", "www.uzor.ai"];
  for (const host of hosts) {
    const res = await app.request("/", { headers: { host } }, mockEnv());
    const violations = [];
    if (res.status !== 200) violations.push(`expected 200 for host ${host}, got ${res.status}`);
    violations.push(...assertSecurityHeaders(res, `GET / host=${host}`));
    report(`approved host serves content with security headers: ${host}`, violations);
  }
}

// /healthz on an approved host.
{
  const app = createApp();
  const res = await app.request("/healthz", { headers: { host: "uzor.ai" } }, mockEnv());
  const body = await res.json();
  const violations = [];
  if (res.status !== 200) violations.push(`expected 200, got ${res.status}`);
  if (body.ok !== true) violations.push(`expected ok:true, got ${JSON.stringify(body)}`);
  violations.push(...assertSecurityHeaders(res, "GET /healthz"));
  report("healthz responds ok on an approved host", violations);
}

// ---------------------------------------------------------------------------
// Unknown hosts fail bounded (404) — not a redirect — and still carry
// security headers.
// ---------------------------------------------------------------------------

{
  const app = createApp();
  const unknownHosts = ["evil.com", "uzorai.com.evil.com", "localhost", "", undefined];
  for (const host of unknownHosts) {
    const headers = host === undefined ? {} : { host };
    const res = await app.request("/", { headers }, mockEnv());
    const violations = [];
    if (res.status !== 404) violations.push(`expected 404 for host ${JSON.stringify(host)}, got ${res.status}`);
    if (res.headers.has("location")) violations.push(`unexpected Location header (redirect) for host ${JSON.stringify(host)}`);
    violations.push(...assertSecurityHeaders(res, `GET / host=${JSON.stringify(host)}`));
    report(`unknown host fails bounded, no redirect: ${JSON.stringify(host)}`, violations);
  }
}

// ---------------------------------------------------------------------------
// Unsupported methods on an approved host are rejected (405), bounded.
// ---------------------------------------------------------------------------

{
  const app = createApp();
  // TRACE/CONNECT/TRACK are forbidden methods per the Fetch spec and can't
  // even be constructed into a Request here — OPTIONS covers "a method
  // besides GET/HEAD that a real client can still send".
  for (const method of ["POST", "PUT", "DELETE", "PATCH", "OPTIONS"]) {
    const res = await app.request("/", { method, headers: { host: "uzorai.com" } }, mockEnv());
    const violations = [];
    if (res.status !== 405) violations.push(`expected 405 for method ${method}, got ${res.status}`);
    violations.push(...assertSecurityHeaders(res, `${method} / host=uzorai.com`));
    report(`unsupported method rejected bounded: ${method}`, violations);
  }
}

// ---------------------------------------------------------------------------
// Exceptions are redacted: generic bounded body, no stack/internal detail,
// still carries security headers.
// ---------------------------------------------------------------------------

{
  const app = createApp();
  const res = await app.request("/", { headers: { host: "uzorai.com" } }, mockEnv({ throwOnFetch: true }));
  const body = await res.text();
  const violations = [];
  if (res.status !== 500) violations.push(`expected 500, got ${res.status}`);
  if (body.length > 200) violations.push(`error body unexpectedly long (${body.length} chars) — may be leaking detail`);
  if (/simulated ASSETS binding failure/.test(body)) violations.push("error body leaks the underlying exception message");
  if (/at\s+\S+\s+\(.*:\d+:\d+\)/.test(body)) violations.push("error body looks like it contains a stack trace frame");
  if (/[/\\](home|Users|src)[/\\]/.test(body)) violations.push("error body appears to leak an internal filesystem path");
  violations.push(...assertSecurityHeaders(res, "GET / (thrown exception)"));
  report("thrown exception yields a bounded, redacted 500", violations);
}

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-worker-boundary FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-worker-boundary passed\n");
