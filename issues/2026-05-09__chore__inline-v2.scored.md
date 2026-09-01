# CHORE: Harden Worker and browser security boundaries

Parent: UzorAI/uzorai.com#82

## Intent

Harden the Cloudflare Worker and browser boundary for UzorAI/uzorai.com while preserving one Worker and four hostname roles. Add normalized host allowlisting, security headers, safe method/error handling, and regression tests for staging/production presentation, frontend URL/XSS/storage boundaries, dependency and secret scans.

## Action

1. Define an explicit normalized host contract: uzorai.com and www.uzorai.com are staging/demo; uzor.ai and www.uzor.ai are stable production; unexpected hosts receive a safe response.
2. Add Worker security headers, explicit health and method/error behavior, and prevent leakage of privileged configuration.
3. Add tests for staging notice presence, production notice absence, host normalization, headers, frontend external links, redirects, dynamic HTML, localization data, and storage.
4. Add clean-lockfile install, typecheck/build, workflow-static, dependency-audit, and secret-pattern verification without live credential calls.
5. Document rollback and preserve the existing single Worker routes; do not deploy or change DNS.

## Acceptance Criteria

- [ ] Four-host tests pass and unexpected/malformed hosts do not select staging or production presentation.
- [ ] Responses include appropriate CSP-ready security headers, referrer policy, clickjacking protection, and safe permissions policy; /healthz does not expose secrets.
- [ ] No frontend test permits XSS, open redirect, unsafe external-link behavior, or browser access to control-plane secrets.
- [ ] npm test, clean-lockfile build/typecheck, and security static scans pass; npm audit failures are recorded separately when registry access is unavailable.
- [ ] No DNS, route, deployment, production-data, or credential changes occur.

## Files

```
src/server/index.ts
src/server/security.ts
src/client/index.html
src/client/**/*.tsx
scripts/security/*
test/security/*
```

## Legal triggers

None.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Worker contract and headers | None | 3 hours |
| Frontend and CI regression tests | CI | 5 hours |
| **Total** | — | 8 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation and verification | CI | 1 day |
| **Total** | — | 1 day |

### Assumptions

- Cloudflare custom-domain bindings remain unchanged and the existing asset binding continues to serve the SPA.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| All phases | 1 day | TBD | TBD |
| **Total** | 1 day | TBD | TBD

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-08-31T09:33:08.880Z
- **Score:** 6/6
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| action | PASS |
| acceptance_criteria | PASS |
| files | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__chore__inline.md_

---

## Provenance (auto-materialized)

- **Acquisition path:** Path B — inline-scored issue body (MCP). The issue body's
  `_Source:_` footer names `2026-05-09__chore__inline.md`, but
  `issues/2026-05-09__chore__inline.scored.md` already exists as the materialized
  spec for a different, unrelated issue (#53, "Russian hero tagline to informal
  imperative") — every CHORE drafted through the inline MCP flow carries this same
  templated footer, so the base filename collides across unrelated specs by
  construction. Per the collision-suffixing rule, this file uses the next free
  suffix (`-v2`; no `2026-05-09__chore__inline-v2.scored.md` existed prior to this
  run) rather than overwriting #53's record.
- **Source issue:** UzorAI/uzorai.com#84 — "CHORE: Harden Worker and browser
  security boundaries (EPIC #82)" (created 2026-09-01T17:47:50Z). Parent:
  UzorAI/uzorai.com#82.
- **Integrity re-score:** the acquired body's `## ZAI Spec Score` block (6/6 PASS,
  rubric 1.5.0, evaluated 2026-08-31T09:33:08.880Z) was taken as authoritative for
  this run; content matches the spec implemented below with no divergence.
- **Gate 1:** CHORE → AUTO (full pass, no `gates[]` declared, no `needs-approval`
  label on the issue). No HOLD; no approval channel required. PR review by
  daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #84 on branch
  `htu/harden-worker-and-browser-security-boundaries`; committed with the
  implementation PR.
