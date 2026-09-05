# BUG: locale-experience-packs guard rejects the sanctioned vocal-foundation import of experience-packs/schema

Parent: UzorAI/uzorai.com#69
Related: #125, #126 (PR that introduced the regression)

## Intent

`main` is currently red. PR #126 (Phase 6 vocal-role foundation, merged 2026-09-05) added `src/client/performance/vocal/schema.ts`, which imports `MANIFEST_SCHEMA_VERSION` and `COMPATIBILITY` from `../../experience-packs/schema` to pin `VOCAL_COMPATIBILITY.localePackSchema` per its own approved spec (#125, Final Spec: "Pin the existing performance-manifest/clock and locale-pack schema versions explicitly"). The Phase 5 guard test `test/locale-experience-packs.test.mjs:190` ("existing UI has no imports of the foundation modules") predates this sanctioned consumer and fails closed on any import matching `/(?:from\s*|import\s*\()['"][^'"]*experience-packs/`, with no allowlist for non-UI, non-rendered contract modules. The regex has no knowledge that `src/client/performance/vocal/` is itself an unconsumed, unrendered foundation (per #125 AC8/AC6: no route imports it, `dist/client` unchanged) rather than "existing UI."

## Repro

**Preconditions:** `main` at commit `4e38ca7b1138...` (post-#126 merge).

**Steps:**
1. Run `npm run build` (or `npm test` directly) on `main`.
2. Observe `test/locale-experience-packs.test.mjs` subtest 64.

**Expected:** All 124 subtests in `locale-experience-packs.test.mjs` pass; `npm run build` succeeds; the dev auto-deploy (`deploy.yml` on push to `main`) completes.

**Actual:** Subtest 64 fails with `AssertionError` (`doesNotMatch` on the experience-packs-import regex), `npm test` exits 1, `npm run build` never reaches `tsc`/`vite build`, and the dev deploy run fails at the build step before any `wrangler deploy` call. No demo/production deploy was attempted or affected (push-triggered auto-deploy only targets `dev`), but any manual `workflow_dispatch` promotion to `demo` or `production` right now would hit the identical build failure.

**Root cause:** The guard regex in `locale-experience-packs.test.mjs` treats every `experience-packs` import as evidence of "existing UI" reaching into the Phase 5 foundation, but #125/#126 added a second, explicitly-sanctioned, unrendered contract module (`vocal/schema.ts`) that needs the same version-pin pattern the guard was written to prevent *rendered* UI from using. The guard's allowlist was never updated when #125 was scored/approved to add this second consumer.

## Fix

### Layer 1 — Narrow the guard to its actual intent

Update `test/locale-experience-packs.test.mjs`'s import-scan to allowlist known contract/foundation modules (starting with `src/client/performance/vocal/`) that themselves declare no route/render dependency, rather than banning all `experience-packs` imports outright. The scan continues to fail closed on any file under `src/client/routes/`, `src/client/components/`, or any other rendered surface.

### Layer 2 — Preserve the original protection

Keep AC8 from #125 intact: `test/vocal-performance-foundation.test.mjs`'s existing assertion ("no rendered route or transport imports the vocal foundation") continues to be the actual guarantee that `vocal/` stays unconsumed. The Layer 1 change only stops a false positive on the *other* direction (vocal-foundation-imports-experience-packs), which was always intended and already documented in #125's own Final Spec and Models Applied (Systems Thinking: "compatibility pins connect clock, locale, pack... without runtime coupling").

## Acceptance Criteria

- [ ] AC1: `test/locale-experience-packs.test.mjs` subtest 64 passes on the current `main` + this fix, without weakening its check against actual rendered-UI imports of `experience-packs` internals.
- [ ] AC2: A new fixture/case proves a rendered route (e.g. a synthetic `src/client/routes/*` importing `experience-packs/schema`) is still correctly rejected by the narrowed guard.
- [ ] AC3: `npm run build` succeeds end-to-end on `main` with this fix applied (test → tsc → vite build).
- [ ] AC4: No other test in the existing 26-file suite regresses.
- [ ] AC5: The dev auto-deploy on merge of this fix's PR completes successfully (`wrangler deploy --env dev` reached and green).

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | `locale-experience-packs.test.mjs`'s import guard, written for Phase 5, unconditionally bans all `experience-packs` imports outside its own known files. |
| Target subjects | The guard allowlists sanctioned non-rendered foundation modules (starting with `vocal/schema.ts`) while continuing to reject rendered-UI imports. |
| Migration | Test-only change; no production schema, contract, or runtime behavior changes. `vocal/schema.ts` itself is unmodified. |
| Compatibility | No version bump needed; this fixes a test false-positive, not a contract change. |
| Rollback | Revert the guard-test edit; `main` returns to its current (broken) state. No data or deployed behavior is affected either way. |
| Open questions | Whether future foundation modules should use a shared allowlist convention or per-module guard exemptions; left to whoever authors the next Phase 7+ foundation file. |

## Files

```text
test/locale-experience-packs.test.mjs
```

No other file is in scope. No production code, schema, or deployed behavior changes.

## Legal triggers

None. This is a test-infrastructure fix with no change to public claims, data handling, third-party content, or user-facing behavior.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Guard-regex fix, fixture, review | 0.5–1.5 hours |
| Total | 0.5–1.5 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, CI, review, dev deploy verification | 1–4 hours |
| Total | 1–4 hours |

### Assumptions

- No schema, contract, or production-behavior change is required — this is a test-guard fix only.
- `main`'s current failure is isolated to this one guard; no other regression is masked behind it.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 0.5–1.5 active hours / 1–4 hours | TBD | TBD |
| Total | 0.5–1.5 active hours / 1–4 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-09-05T14:49:34.337Z
- **Score:** 8/8
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| repro | PASS |
| fix | PASS |
| acceptance_criteria | PASS |
| migration_summary | PASS |
| files | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__bug__inline.md_

---

## Provenance (auto-materialized)

- **Source:** inline-scored GitHub issue body (Path B, IMPLW_FLOW.md §2).
- **Issue:** UzorAI/uzorai.com#127
- **Materialized by:** implw (§4 auto-materialize) during the implementation run.
- **Filename derivation (§4.1):** from the `_Source: 2026-05-09__bug__inline.md_` footer → base name `2026-05-09__bug__inline.scored.md` already taken by issue #58; suffixed to `2026-05-09__bug__inline-v2.scored.md` per §4.2 collision-avoidance.
- **Integrity re-score (§3):** `score_spec` (spec_type=bug) returned 8/8 PASS, rubric 1.5.0 — matches the stored score block.
- **Path A divergence note (§7):** `issues/2026-05-09__bug__inline.scored.md` exists (Passed: YES) but contains the spec for issue #58, not #127 — naming collision; Path B content used for implementation, Path A file left unmodified.
