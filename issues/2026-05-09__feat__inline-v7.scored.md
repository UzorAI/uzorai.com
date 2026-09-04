# FEAT: Arabic (ar) locale for uzorai.com (EPIC #108 Phase 2)

Parent: UzorAI/uzorai.com#108
Phase: 2 of 5
Depends on: UzorAI/uzorai.com#109 (Phase 1 — base hardening)

## Intent

Add Arabic as a fifth shipped locale on top of the existing `LocaleProvider`/`config/languages.ts`/dictionary architecture (en/es/ru/zh already shipped via EPIC #29). `styles/rtl.css` and `LocaleProvider`'s `dir` handling were already written anticipating this locale, so the remaining work is a dictionary plus real RTL verification against actual Arabic content, not new plumbing. Canonical workflow order (per EPIC #69's Cultural Engine architecture) stays semantically forward — only visual direction flips. Both existing anti-translate guards (`assert-no-translate.mjs`, the `translate.goog` canonical-host redirect) must keep passing. This FEAT authorizes specification and later governed implementation only after approval; it does not itself authorize implw, merge, deployment, or secret handling.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Branch 1 | If a reviewed Arabic string exists for a key, use it; otherwise fall back to `en` per `LocaleProvider`'s existing contract (formalized in Phase 1 / #109) and flag the gap. | Apply deterministically and record evidence. |
| Branch 2 | If `styles/rtl.css`'s existing rules do not correctly flip a given UI element under real Arabic content, add a scoped `[dir="rtl"]` rule rather than reworking the LTR layout. | Apply deterministically and record evidence. |
| Branch 3 | If a component would need to reverse the canonical UZOR workflow order to "look right" in RTL, reject the change — text direction flips, workflow causality does not (per EPIC #69). | Apply deterministically and record evidence. |
| Branch 4 | If adding `ar` regresses either anti-translate guard, block the change until both pass again. | Apply deterministically and record evidence. |

Trigger for change: a new live repository/workflow/version, failed acceptance evidence, or an approved parent rescope changes an assumption in this decision table; update and reapprove the spec before behavior changes.

## Final Spec

- Add `src/client/i18n/ar.json` following the existing flat-key dictionary shape used by `en`/`es`/`ru`/`zh.json`.
- Register `{ code: 'ar', label: 'العربية', dir: 'rtl' }` in `src/client/config/languages.ts`.
- Verify `styles/rtl.css` against real Arabic content in the language picker, header, and footer; add any missing `[dir="rtl"]` scoped rules the existing LTR-safe scaffold doesn't already cover.
- Preserve canonical UZOR workflow order under RTL — direction flips, sequence does not.
- Both `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard (wired together in #109) must still pass.
- No change to `LocaleProvider`'s public API (`useLocale()`, `t()`) — `ar` is a data + metadata addition, per the pattern Phase 1 documents.

### Failure and fallback contract

- A missing `ar` key falls back to `en`, then to the key itself, per `LocaleProvider`'s existing (Phase 1-documented) contract — never blank.
- Preserve current production behavior for all other locales; this FEAT is additive only.

## Acceptance Criteria

- [ ] AC1: `ar` appears in the language picker and switching to it re-renders visible copy in Arabic.
- [ ] AC2: `<html dir="rtl">` is set when `ar` is active; canonical workflow order (per EPIC #69) is unchanged in reading order/semantics.
- [ ] AC3: The language picker, header, and footer render correctly under RTL against real Arabic content (not just the LTR-safe scaffold).
- [ ] AC4: A missing `ar` key falls back to `en` per the Phase 1-documented fallback contract.
- [ ] AC5: `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard both still pass.
- [ ] AC6: No other locale's rendered output changes.

## Game Theory Cooperative Model review

### Who benefits

Arabic-speaking visitors get a first-party, in-house localized experience instead of relying on a third-party translation proxy the site already blocks; the platform gains one more governed locale without touching the reviewed English baseline or the other three shipped locales.

### Abuse vector

A locale addition could be used to smuggle in content that bypasses the anti-translate guards, alters canonical workflow semantics under the excuse of "RTL layout," or introduces unreviewed/unlicensed strings.

### Mitigation

The dictionary is first-party, reviewed content added through the same governed implw/PR/review path as every other change; both anti-translate guards are re-verified as an explicit acceptance criterion; canonical workflow order is an explicit invariant this FEAT cannot touch (Decision Tree Branch 3).

### Cooperative equilibrium

Visitors, the platform, and reviewers all gain from one more correctly-scoped locale; no actor benefits from weakening the guards or workflow invariants this FEAT explicitly preserves.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | `LocaleProvider`, `config/languages.ts`, and 4 shipped dictionaries (en/es/ru/zh); `styles/rtl.css` scaffolded but unverified against real RTL content. |
| Target subjects | The same architecture plus one additional dictionary (`ar.json`) and one additional `languages.ts` entry, with `rtl.css` verified against real content. |
| Migration | Purely additive — one new dictionary file, one new config entry, targeted CSS fixes if verification finds gaps. No existing file's behavior changes for other locales. |
| Compatibility | `LocaleProvider`'s lookup/fallback contract is unchanged; other locales are unaffected by construction (locale-keyed data, not shared logic changes). |
| Rollback | Revert the PR — removes the `ar` dictionary and its `languages.ts` entry; all other locales are untouched. |
| Open questions | None outstanding — Phase 1 (#109) resolves the fallback-contract documentation and test fixtures this FEAT depends on. |

## Files created / updated

```text
Add: src/client/i18n/ar.json
Update: src/client/config/languages.ts (register the ar entry)
Update: src/client/styles/rtl.css (only if verification against real Arabic content finds a gap in the existing scaffold)
Add/update: RTL fixture usage from #109's pseudo-localization/RTL test fixtures, applied to ar specifically
```

## Models Applied

- Decision Tree — governs fallback, RTL-CSS-gap, workflow-order, and guard-regression branches.
- Systems Thinking — connects `LocaleProvider`, `languages.ts`, `rtl.css`, and the two anti-translate guards as one coherent system this FEAT extends without disturbing.
- Swiss Cheese — dictionary review, RTL verification, workflow-order invariant, and both anti-translate guards are independent barriers.
- Anti-Fragile — a missing `ar` key becomes a documented fallback, not a broken render.

## Legal triggers

None. First-party translation content, same as the already-shipped en/es/ru/zh dictionaries; no third-party licensing, contracts, or user-linked data introduced.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Translation review, RTL visual review, governed decisions | 2–4 hours |
| Total | 2–4 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, RTL visual verification, review | 1–2 working days |
| Total | 1–2 working days |

### Assumptions

- #109 (Phase 1) has landed, so the fallback contract and RTL/pseudo-localization fixtures this FEAT reuses already exist.
- No native-speaker review pipeline beyond what the existing es/ru/zh dictionaries used is assumed to be newly required for `ar`.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 2–4 active hours / 1–2 working days | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-04T05:03:26.747Z
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

## Provenance (auto-materialized)

- **Materialized from:** inline-scored issue body (Path B — UzorAI/uzorai.com#110)
- **Materialized by:** implw run on 2026-09-04
- **Collision suffix:** -v7 (2026-05-09__feat__inline.scored.md through -v6 already occupied)
