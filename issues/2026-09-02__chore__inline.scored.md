# CHORE: Worker/Browser Boundary Hardening and Regression Verification

Part of #82.

## Intent

Harden the Worker/browser boundary and add regression verification for the approved four-host presentation contract while preserving the current single repository and Worker. Treat host headers, methods, URLs, localization content, external links, storage values, and browser-visible configuration as untrusted data. This child does not authorize deployment, workflow dispatch, DNS/Cloudflare route/custom-domain changes, Worker topology separation, credential inspection or rotation, production-data mutation, direct push, merge, paid infrastructure, or governance bypass.

## Action

1. Centralize hostname normalization and exact allowlisting for `uzorai.com`, `www.uzorai.com`, `uzor.ai`, and `www.uzor.ai`; reject malformed, suffixed, port-confused, case/Unicode-confused, or unrecognized host input without an open redirect.
2. Preserve the approved presentation roles: `uzorai.com` and `www.uzorai.com` remain staging/demo; `uzor.ai` and `www.uzor.ai` remain stable production; one Worker continues serving all four hosts.
3. Make unsupported methods and Worker errors fail safely with bounded generic responses, correct status codes, and no stack traces, environment bindings, tokens, privileged metadata, or internal paths.
4. Emit and regression-test appropriate security headers, including a restrictive content-security policy, MIME sniffing protection, referrer policy, framing protection, and feature permissions, without breaking the existing application contract.
5. Treat localization catalogs and storage values as display data only. Render through React/text-safe paths, disallow dynamic HTML injection, validate locale and theme values, and use bounded storage keys and values.
6. Centralize internal/external URL validation. Permit only expected internal routes and safe `https:` external destinations; prevent `javascript:`, `data:`, protocol-relative, control-character, credential-bearing, and open-redirect forms; apply safe external-link relationship attributes.
7. Assert that browser bundles, HTML, source maps, manifests, and public configuration contain no control-plane credentials or privileged Worker bindings. Use synthetic patterns only; never inspect or print real secret values.
8. Extend CI validation to run clean-lockfile installation, typecheck, build, unit tests, dependency audit, secret-pattern scan, workflow static assertions, and host/security-header/browser-boundary regressions. This specification authorizes repository changes and tests only, not dispatch or deployment.

## Acceptance Criteria

- [ ] Exact normalized host allowlisting accepts only the approved four hostnames and preserves their staging/demo versus stable-production presentation roles under one Worker.
- [ ] Unknown, malformed, suffixed, port-confused, case/Unicode-confused, and attacker-controlled host inputs fail safely without redirecting to attacker-controlled destinations.
- [ ] Unsupported methods and exceptions return bounded generic responses with correct status codes and no stack, binding, credential, internal-path, or privileged metadata disclosure.
- [ ] Host responses include regression-tested CSP, MIME-sniffing, referrer, framing, and permissions protections compatible with the application.
- [ ] Localization strings and persisted locale/theme values are treated as untrusted data, use text-safe rendering, and cannot reach dynamic HTML injection or unbounded storage keys/values.
- [ ] Internal and external URL helpers reject `javascript:`, `data:`, protocol-relative, control-character, credential-bearing, and open-redirect inputs; approved external links use `https:` and safe relationship attributes.
- [ ] Browser-visible artifacts contain no control-plane secrets, privileged Worker bindings, or credential-shaped synthetic canaries.
- [ ] CI definitions cover clean-lockfile install, typecheck, build, unit tests, dependency and synthetic secret scans, workflow assertions, and host/header/browser-boundary regressions.
- [ ] Tests explicitly cover all four approved hosts, unknown hosts, method handling, exception redaction, security headers, malicious localization/storage values, and unsafe URLs.
- [ ] Changes remain PR-scoped and perform no deployment, workflow dispatch, DNS/route/custom-domain change, Worker split, credential operation, production-data mutation, direct push, merge, paid-service action, or governance bypass.

## Files

```text
src/worker.ts
src/client/config/routes.ts
src/client/config/languages.ts
src/client/i18n/LocaleProvider.tsx
src/client/components/NavMenu.tsx
src/client/components/LanguagePicker.tsx
src/client/components/ThemeToggle.tsx
src/client/index.html
scripts/security/
.github/workflows/pr-validation.yml
package.json
test/ or tests/ (Worker host/header/method/error and browser URL/i18n/storage regressions)
```

Exact test filenames may follow current repository conventions. Workflow/runner trust-boundary refactoring belongs to the Phase 1 child; DNS, Cloudflare routes, custom domains, deployments, credentials, and production data remain excluded.

## Legal triggers

None. No regulated-data processing, payment flow, license change, credential disclosure, or production-data mutation is introduced.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---:|
| Worker host, method, error, and header hardening | None | 3 hours |
| Browser URL, localization, and storage boundaries | None | 3 hours |
| CI assertions and regression tests | None | 3 hours |
| Total | - | 9 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---:|
| Implementation and local validation | Local CPU | 1 working day |
| Independent review and governance gates | Human review | 1-3 working days |
| CI feedback after an authorized PR is opened | CI runner | 1-4 hours |
| Total | - | 2-4 working days |

### Assumptions

- The four-host presentation policy in EPIC #82 remains authoritative.
- One repository and Worker remain in place; physical environment separation is deferred.
- Existing React text rendering and repository security scripts can be extended without new paid services.
- Synthetic test values are sufficient to verify absence of browser control-plane secrets without inspecting real credentials.
- Deployment, workflow dispatch, DNS/routes, custom domains, merge, credential operations, and production data are unnecessary for this PR-scoped chore.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Worker boundary | 3 hours | TBD | TBD |
| Browser boundary | 3 hours | TBD | TBD |
| CI and regression verification | 3 hours | TBD | TBD |
| Total | 9 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-09-02T05:28:26.317Z
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

## Provenance (auto-materialized)

- **Acquired from:** GitHub issue [`UzorAI/uzorai.com#88`](https://github.com/UzorAI/uzorai.com/issues/88) (inline-scored body, Path B).
- **Materialized:** 2026-09-02 by the `implw` run for issue #88.
- **Note on `_Source:` footer:** the issue body's own `_Source: 2026-05-09__chore__inline.md_` footer does not resolve to this content — `issues/2026-05-09__chore__inline.scored.md` is an unrelated, already-merged spec (Russian hero tagline informal-imperative chore, issue #53). That footer is a stale/generic placeholder shared by multiple unrelated chore drafts and is treated as non-authoritative per the content-based acquisition principle (§2); this file is filed under today's date instead so the filename reflects its actual content. This mirrors the same collision resolution applied to `issues/2026-09-02__refactor__inline.scored.md` for issue #87.
- **Integrity re-score:** confirmed via `score_spec` (chore, rubric 1.5.0) — 6/6 PASS, matching the score block above. No mismatch.
- **Gate 1:** CHORE → AUTO (full pass, no `gates[]` declared, no `needs-approval` label). No HOLD; no approval channel required. PR review by daniel-silvers remains required to merge.
