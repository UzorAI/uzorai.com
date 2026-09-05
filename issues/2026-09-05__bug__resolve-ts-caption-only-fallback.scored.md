# BUG: resolve.ts fails tsc — 'caption-only-fallback' literal widens to string, breaking CaptionOnlyPlan.diagnostics typing

Parent: UzorAI/uzorai.com#69
Related: #125, #126 (introduced), #127/#129 (unblocked npm test, exposed this at tsc)

## Intent

`main` is still red after #129 merged. #127 fixed the `npm test` guard-regex false positive from #126, which let the build pipeline advance one stage further — into `tsc --noEmit` — where a second, independent, pre-existing type error in #126's own code is now exposed: `src/client/performance/vocal/resolve.ts(68,11)` fails with `TS2322`, because the `diagnostics` array built for `CaptionOnlyPlan` infers as `readonly string[]` instead of `readonly VocalDiagnosticCode[]`. This blocks `npm run build` and therefore blocks the dev auto-deploy on every subsequent push to `main` until fixed.

## Repro

**Preconditions:** `main` at commit `11d8521f...` (post-#129 merge).

**Steps:**
1. Run `npm run build` (or `tsc --noEmit` directly) on `main`.
2. Observe the compiler error at `src/client/performance/vocal/resolve.ts:68:11`.

**Expected:** `tsc --noEmit` passes with zero errors; `npm run build` completes; the dev auto-deploy (`deploy.yml` on push to `main`) succeeds.

**Actual:** Compilation fails:
```
src/client/performance/vocal/resolve.ts(68,11): error TS2322: Type 'Readonly<{ kind: "caption-only"; ...; diagnostics: readonly string[]; }>' is not assignable to type 'CaptionOnlyPlan'.
  Types of property 'diagnostics' are incompatible.
    Type 'readonly string[]' is not assignable to type 'readonly VocalDiagnosticCode[]'.
      Type 'string' is not assignable to type 'VocalDiagnosticCode'.
```
`npm test` (125/125 subtests) passes cleanly first — this is purely a `tsc` failure, one stage later in the `npm run build` chain (`test && tsc --noEmit && vite build`). The 2026-09-05T17:09 dev-deploy run (triggered by #129's merge) fails at this exact step, exit code 2, before `vite build` or `wrangler deploy` ever run.

**Root cause:** At line 68, `diagnostics: Object.freeze([...diagnostics, 'caption-only-fallback'])` spreads the properly-typed local `diagnostics: VocalDiagnosticCode[]` array and appends the bare string literal `'caption-only-fallback'`. That literal has no contextual type at the point of the array-literal expression (the `CaptionOnlyPlan` annotation on the enclosing `const plan` does not propagate through `Object.freeze`'s generic inference into the spread-element array literal), so TypeScript widens it to the general `string` type. The resulting array type becomes `(VocalDiagnosticCode | string)[]`, which TypeScript displays and treats as `string[]` — incompatible with the `readonly VocalDiagnosticCode[]` field on `CaptionOnlyPlan`.

## Fix

### Layer 1 — Remove the untyped literal at the point of use

Replace the inline string literal with a module-level typed constant so the pushed value carries `VocalDiagnosticCode` typing from its declaration, not inferred at the spread site:

```ts
const CAPTION_ONLY_FALLBACK: VocalDiagnosticCode = 'caption-only-fallback'
// ...
diagnostics: Object.freeze([...diagnostics, CAPTION_ONLY_FALLBACK]),
```

This guarantees the array-literal's inferred element type stays `VocalDiagnosticCode` end to end, since no element in the spread is an untyped bare literal.

### Layer 2 — Type-level regression guard

Add a `tsc`-only assertion (or a `test/*.test-d.ts`-style type check, matching existing repo conventions) that `resolveVocalCue`'s `CaptionOnlyPlan` branch return type is exactly `CaptionOnlyPlan`, so any future untyped literal added to `diagnostics` fails at compile time rather than silently widening.

## Acceptance Criteria

- [ ] AC1: `tsc --noEmit` passes with zero errors on `main` + this fix.
- [ ] AC2: `npm run build` completes end-to-end (test → tsc → vite build).
- [ ] AC3: All 125 existing subtests in `vocal-performance-foundation.test.mjs` continue to pass unchanged.
- [ ] AC4: `resolveVocalCue`'s caption-only-fallback code path is covered by an existing or new test asserting the literal `'caption-only-fallback'` is present in the returned `diagnostics` array at runtime (behavior must be unchanged, only the type must be fixed).
- [ ] AC5: The dev auto-deploy on merge of this fix's PR completes successfully (`wrangler deploy --env dev` reached and green).

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | `resolve.ts`'s `CaptionOnlyPlan` construction uses an untyped inline string literal that widens under `tsc`, blocking the build. |
| Target subjects | The literal is replaced by a typed module-level constant; runtime behavior (the literal string value in the diagnostics array) is unchanged. |
| Migration | Single-file, type-only change; no schema, contract, or runtime behavior modification. |
| Compatibility | No version bump needed — this is a compile-time fix with identical runtime output. |
| Rollback | Revert the constant/typing change; `main` returns to its current (build-broken) state. No data or deployed behavior are affected either way. |
| Open questions | Whether other modules in `vocal/` have similar untyped-literal-in-spread patterns that haven't yet been exercised by `tsc` in a code path reached during this build; worth a repo-wide grep as follow-up, out of scope here. |

## Files

```text
src/client/performance/vocal/resolve.ts
```

No other file is in scope. No production schema, contract, or deployed behavior changes.

## Legal triggers

None. This is a compile-time type-correctness fix with no change to public claims, data handling, third-party content, or user-facing behavior.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Typed-constant fix, regression test, review | 0.5–1 hour |
| Total | 0.5–1 hour |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, CI, review, dev deploy verification | 1–3 hours |
| Total | 1–3 hours |

### Assumptions

- No other file shares this exact widening pattern in a way currently reached by `tsc`; if the fix doesn't fully clear the build, a follow-up BUG will be filed against whatever remains.
- Runtime behavior of `resolveVocalCue` is unchanged; this is a type-level-only fix.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 0.5–1 active hour / 1–3 hours | TBD | TBD |
| Total | 0.5–1 active hour / 1–3 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-09-05T17:18:02.548Z
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
- **Issue:** UzorAI/uzorai.com#130
- **Materialized by:** implw (§4 auto-materialize) during the implementation run.
- **Filename derivation (§4.1):** from the `_Source: 2026-05-09__bug__inline.md_` footer → `2026-05-09__bug__inline.scored.md`; name collision with issue #58 (v2 with issue #58's own materialization also collides); materialized as `2026-09-05__bug__resolve-ts-caption-only-fallback.scored.md` (date-disambiguated to avoid -v3 stacking on the generic template name).
- **Path A divergence:** `issues/2026-05-09__bug__inline.scored.md` resolves but contains the spec for issue #58 (i18n bug), not #130. Content divergence noted; issue body treated as authoritative per §7 edge case (same-template naming collision between distinct issues).
- **Integrity re-score (§3):** `score_spec` (spec_type=bug) returned 8/8 PASS, rubric 1.5.0 — matches the stored score block.
