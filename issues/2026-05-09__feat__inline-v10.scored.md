# FEAT: Hebrew (he) locale for uzorai.com (EPIC #108 Phase 3)

Parent: UzorAI/uzorai.com#108
Phase: 3 of 5
Depends on: UzorAI/uzorai.com#109 (Phase 1 — base hardening), the Arabic (ar) locale FEAT (Phase 2 — establishes real-content RTL verification this FEAT reuses)

## Intent

Add Hebrew as a sixth shipped locale, reusing the RTL verification the Arabic (Phase 2) FEAT already performs against `styles/rtl.css` and `LocaleProvider`'s `dir` handling — both written generically for any RTL locale, not Arabic-specific. The remaining work is a Hebrew dictionary plus confirming the same RTL scaffold holds for Hebrew's specific script/punctuation. Canonical workflow order (per EPIC #69's Cultural Engine architecture) stays semantically forward; only visual direction flips. Both existing anti-translate guards (`assert-no-translate.mjs`, the `translate.goog` canonical-host redirect) must keep passing. This FEAT authorizes specification and later governed implementation only after approval; it does not itself authorize implw, merge, deployment, or secret handling.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Branch 1 | If a reviewed Hebrew string exists for a key, use it; otherwise fall back to `en` per `LocaleProvider`'s existing (Phase 1-documented) contract and flag the gap. | Apply deterministically and record evidence. |
| Branch 2 | If Phase 2's RTL verification does not fully cover a Hebrew-specific rendering difference (e.g. punctuation/niqqud spacing), add a scoped `[dir="rtl"][lang="he"]` rule rather than reworking the shared RTL scaffold. | Apply deterministically and record evidence. |
| Branch 3 | If a component would need to reverse the canonical UZOR workflow order to "look right" in RTL, reject the change — text direction flips, workflow causality does not (per EPIC #69, already established for Arabic in Phase 2). | Apply deterministically and record evidence. |
| Branch 4 | If adding `he` regresses either anti-translate guard, block the change until both pass again. | Apply deterministically and record evidence. |

Trigger for change: a new live repository/workflow/version, failed acceptance evidence, or an approved parent rescope changes an assumption in this decision table; update and reapprove the spec before behavior changes.

## Final Spec

- Add `src/client/i18n/he.json` following the existing flat-key dictionary shape used by `en`/`es`/`ru`/`zh`/`ar.json`.
- Register `{ code: 'he', label: 'עברית', dir: 'rtl' }` in `src/client/config/languages.ts`.
- Confirm `styles/rtl.css` (already verified generically against real RTL content in Phase 2) covers Hebrew; add a scoped fix only if a Hebrew-specific gap is found.
- Preserve canonical UZOR workflow order under RTL — direction flips, sequence does not.
- Both `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard must still pass.
- No change to `LocaleProvider`'s public API (`useLocale()`, `t()`) — `he` is a data + metadata addition.

### Failure and fallback contract

- A missing `he` key falls back to `en`, then to the key itself, per `LocaleProvider`'s existing (Phase 1-documented) contract — never blank.
- Preserve current production behavior for all other locales; this FEAT is additive only.

## Acceptance Criteria

- [ ] AC1: `he` appears in the language picker and switching to it re-renders visible copy in Hebrew.
- [ ] AC2: `<html dir="rtl">` is set when `he` is active; canonical workflow order (per EPIC #69) is unchanged in reading order/semantics.
- [ ] AC3: The language picker, header, and footer render correctly under RTL against real Hebrew content.
- [ ] AC4: A missing `he` key falls back to `en` per the Phase 1-documented fallback contract.
- [ ] AC5: `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard both still pass.
- [ ] AC6: No other locale's rendered output changes, including `ar`.

## Game Theory Cooperative Model review

### Who benefits

Hebrew-speaking visitors get a first-party, in-house localized experience instead of a blocked third-party translation proxy; the platform gains a second RTL locale essentially for the cost of a dictionary, validating that Phase 2's RTL work generalizes.

### Abuse vector

A locale addition could smuggle in content bypassing the anti-translate guards, or reverse canonical workflow semantics under the excuse of RTL layout.

### Mitigation

The dictionary is first-party, reviewed content added through the same governed implw/PR/review path as every other locale; both anti-translate guards are re-verified as an explicit acceptance criterion; canonical workflow order is an explicit invariant this FEAT cannot touch (Decision Tree Branch 3, already enforced identically for `ar`).

### Cooperative equilibrium

Visitors, the platform, and reviewers all gain from one more correctly-scoped locale; no actor benefits from weakening the guards or workflow invariants this FEAT explicitly preserves.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | `LocaleProvider`, `config/languages.ts`, 5 shipped dictionaries (en/es/ru/zh/ar) after Phase 2; `styles/rtl.css` verified against real RTL content in Phase 2. |
| Target subjects | The same architecture plus one additional dictionary (`he.json`) and one additional `languages.ts` entry. |
| Migration | Purely additive — one new dictionary file, one new config entry, a targeted CSS fix only if Hebrew-specific rendering differs from what Phase 2 already verified. |
| Compatibility | `LocaleProvider`'s lookup/fallback contract is unchanged; other locales, including `ar`, are unaffected by construction. |
| Rollback | Revert the PR — removes the `he` dictionary and its `languages.ts` entry; all other locales are untouched. |
| Open questions | None outstanding — Phase 1 (#109) and Phase 2 (ar) resolve the fallback contract and RTL verification this FEAT depends on. |

## Files created / updated

```text
Add: src/client/i18n/he.json
Update: src/client/config/languages.ts (register the he entry)
Update: src/client/styles/rtl.css (only if a Hebrew-specific gap is found beyond what Phase 2 verified)
```

## Models Applied

- Decision Tree — governs fallback, RTL-gap, workflow-order, and guard-regression branches.
- Systems Thinking — reuses the same `LocaleProvider`/`languages.ts`/`rtl.css`/guard system Phase 2 already extended for RTL.
- Swiss Cheese — dictionary review, RTL verification, workflow-order invariant, and both anti-translate guards are independent barriers.
- Anti-Fragile — a missing `he` key becomes a documented fallback, not a broken render.

## Legal triggers

None. First-party translation content, same as the already-shipped locales; no third-party licensing, contracts, or user-linked data introduced.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Translation review, RTL visual spot-check, governed decisions | 1–3 hours |
| Total | 1–3 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, RTL visual verification, review | 1 working day |
| Total | 1 working day |

### Assumptions

- #109 (Phase 1) and the Arabic locale FEAT (Phase 2) have landed, so both the fallback contract and generic RTL verification this FEAT reuses already exist.
- Hebrew does not require RTL scaffold changes beyond what Arabic already exercised, absent a script-specific gap.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 1–3 active hours / 1 working day | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-04T05:03:57.350Z
- **Score:** 10/10
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| decision_tree | PASS |
| final_spec | PASS |
| acceptance_criteria | PASS |
| game_theory | PASS |
| migration_summary | PASS |
| files_list | PASS |
| models_applied | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__feat__inline.md_

---

## Provenance (auto-materialized)

- **Acquisition path:** Path B — inline-scored issue body supplied by the implw workflow and confirmed against UzorAI/uzorai.com#111.
- **Collision:** The `_Source:` filename already resolved to an unrelated scored spec for issue #31; collision suffix `-v10` preserves both documents. The older local content diverges from issue #111 and was not used for implementation.
- **Source issue:** UzorAI/uzorai.com#111 — “FEAT: Hebrew (he) locale for uzorai.com (EPIC #108 Phase 3)” (created 2026-09-04T05:03:57Z).
- **Integrity re-score:** `score_spec` with `spec_type=feat` returned 10/10 PASS on rubric 1.5.0, matching the stored score block.
- **Gate 1:** FEAT → HOLD; headless `needs-approval` label check found the label absent, clearing via `label-absent` attributed to daniel-silvers. PR review by daniel-silvers remains required to merge.
- **Dependencies:** Issues #109 and #110 were both closed before implementation.
- **Materialized by:** `/implw` for issue #111 on branch `htu/hebrew-he-locale-111`.

