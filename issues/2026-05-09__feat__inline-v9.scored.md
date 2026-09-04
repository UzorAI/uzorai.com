# FEAT: Ukrainian (uk) locale for uzorai.com (EPIC #108 Phase 5)

Parent: UzorAI/uzorai.com#108
Phase: 5 of 5
Depends on: UzorAI/uzorai.com#109 (Phase 1 — base hardening)

## Intent

Add Ukrainian as a shipped locale, following the exact pattern already used to ship es/ru/zh (EPIC #29): one flat-key dictionary plus one `config/languages.ts` entry with `dir: 'ltr'`. No RTL, no new plumbing — this is the same shape as the three already-shipped LTR locales, and the closest sibling to the already-shipped Russian dictionary in script (Cyrillic). Both existing anti-translate guards (`assert-no-translate.mjs`, the `translate.goog` canonical-host redirect) must keep passing. This FEAT authorizes specification and later governed implementation only after approval; it does not itself authorize implw, merge, deployment, or secret handling.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Branch 1 | If a reviewed Ukrainian string exists for a key, use it; otherwise fall back to `en` per `LocaleProvider`'s existing (Phase 1-documented) contract and flag the gap. | Apply deterministically and record evidence. |
| Branch 2 | A Ukrainian string must never be a stylistic/dialectal edit of the shipped Russian dictionary — it is authored and reviewed independently as its own language, not a variant. | Apply deterministically and record evidence. |
| Branch 3 | If adding `uk` regresses either anti-translate guard, block the change until both pass again. | Apply deterministically and record evidence. |

Trigger for change: a new live repository/workflow/version, failed acceptance evidence, or an approved parent rescope changes an assumption in this decision table; update and reapprove the spec before behavior changes.

## Final Spec

- Add `src/client/i18n/uk.json` following the existing flat-key dictionary shape used by `en`/`es`/`ru`/`zh.json`, authored and reviewed as Ukrainian in its own right (Decision Tree Branch 2).
- Register `{ code: 'uk', label: 'Українська', dir: 'ltr' }` in `src/client/config/languages.ts`.
- Both `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard must still pass.
- No change to `LocaleProvider`'s public API (`useLocale()`, `t()`), `styles/rtl.css`, or any other locale's dictionary — `uk` is a pure data + metadata addition.

### Failure and fallback contract

- A missing `uk` key falls back to `en`, then to the key itself, per `LocaleProvider`'s existing (Phase 1-documented) contract — never blank.
- Preserve current production behavior for all other locales; this FEAT is additive only.

## Acceptance Criteria

- [ ] AC1: `uk` appears in the language picker and switching to it re-renders visible copy in Ukrainian.
- [ ] AC2: Layout remains LTR with no visual regression, matching the shipped es/ru/zh behavior.
- [ ] AC3: A missing `uk` key falls back to `en` per the Phase 1-documented fallback contract.
- [ ] AC4: `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard both still pass.
- [ ] AC5: No other locale's rendered output changes, including `ru`.

## Game Theory Cooperative Model review

### Who benefits

Ukrainian-speaking visitors get a first-party, in-house localized experience distinct from the Russian dictionary, instead of a blocked third-party translation proxy; the platform gains one more locale at minimal cost since it reuses an already-proven LTR shape.

### Abuse vector

A locale addition could smuggle in content bypassing the anti-translate guards, or be shipped as a low-effort Russian-derived edit rather than a genuine independent Ukrainian translation.

### Mitigation

The dictionary is first-party, reviewed content authored independently of the Russian dictionary (Decision Tree Branch 2) and added through the same governed implw/PR/review path as every other locale; both anti-translate guards are re-verified as an explicit acceptance criterion.

### Cooperative equilibrium

Visitors, the platform, and reviewers all gain from one more correctly-scoped, genuinely independent locale; no actor benefits from weakening the guards or the Russian-independence invariant this FEAT explicitly preserves.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | `LocaleProvider`, `config/languages.ts`, and the shipped dictionaries at the time this FEAT lands. |
| Target subjects | The same architecture plus one additional dictionary (`uk.json`) and one additional `languages.ts` entry. |
| Migration | Purely additive — one new dictionary file, one new config entry. No existing file's behavior changes for other locales, including `ru`. |
| Compatibility | `LocaleProvider`'s lookup/fallback contract is unchanged; other locales are unaffected by construction. |
| Rollback | Revert the PR — removes the `uk` dictionary and its `languages.ts` entry; all other locales are untouched. |
| Open questions | None outstanding — Phase 1 (#109) resolves the fallback-contract documentation this FEAT depends on. |

## Files created / updated

```text
Add: src/client/i18n/uk.json
Update: src/client/config/languages.ts (register the uk entry)
```

## Models Applied

- Decision Tree — governs fallback, Russian-independence, and guard-regression branches.
- Systems Thinking — reuses the same `LocaleProvider`/`languages.ts`/guard system already extended for es/ru/zh.
- Anti-Fragile — a missing `uk` key becomes a documented fallback, not a broken render.

## Legal triggers

None. First-party translation content, same as the already-shipped locales; no third-party licensing, contracts, or user-linked data introduced.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Translation review, governed decisions | 1–2 hours |
| Total | 1–2 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, review | 1 working day |
| Total | 1 working day |

### Assumptions

- #109 (Phase 1) has landed, so the fallback contract this FEAT reuses already exists.
- No RTL or layout work is required — `uk` uses the same LTR shape as es/ru/zh.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 1–2 active hours / 1 working day | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-04T05:04:47.541Z
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

- **Acquisition path:** Path B — inline-scored issue body. The requested source
  filename collided with `issues/2026-05-09__feat__inline.scored.md`, whose
  provenance identifies issue #31 and whose content diverges from issue #113;
  the collision-safe `-v9` suffix preserves both artifacts.
- **Source issue:** UzorAI/uzorai.com#113 — "FEAT: Ukrainian (uk) locale for
  uzorai.com (EPIC #108 Phase 5)" (created 2026-09-04T05:04:47Z).
- **Integrity re-score:** `score_spec` with `spec_type=feat` returned 10/10 PASS,
  rubric 1.5.0, matching the stored score block.
- **Gate 1:** FEAT → HOLD. In this headless run, issue #113 had no
  `needs-approval` label, so the HOLD cleared via `label-absent` (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #113 on branch
  `htu/ukrainian-uk-locale-for-uzorai-com-epic-108-phase-5-113`.
