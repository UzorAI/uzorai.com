# CHORE: i18n base hardening (EPIC #108 Phase 1)

Parent: UzorAI/uzorai.com#108
Phase: 1 of 5

## Intent

Harden the existing i18n foundation (`LocaleProvider`, `config/languages.ts`, the JSON dictionary pattern, `styles/rtl.css`) rather than rebuild it, closing the real gaps against #73's original acceptance bar: an undocumented fallback contract, missing per-string review/version metadata, no pseudo-localization/RTL fixtures, no timing/mobile/accessibility/brand-tone test coverage, and no formalized regression gate for the two existing anti-translate guards. This CHORE blocks EPIC #108 Phases 2-5 (ar/he/fr/uk locale FEATs), which build on the schema and fixtures this phase establishes.

## Action

1. Audit `src/client/i18n/{en,es,ru,zh}.json` against #73's stricter bar; add a test asserting `LocaleProvider.t()`'s existing fallback order (active dict → `en` → key) for a missing key.
2. Add per-string review/version metadata as an additive, parallel structure keyed by the same flat keys (e.g. `src/client/i18n/meta/*.json`) — do not restructure the dictionary lookup format `LocaleProvider` already implements.
3. Add pseudo-localization and RTL test fixtures under `test/` reusable by the Phase 2/3 (ar/he) locale FEATs.
4. Add timing/mobile/accessibility/brand-tone test coverage for the 4 shipped locales.
5. Wire `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard into one documented, single check every subsequent locale FEAT (#108 Phases 2-5) must pass.
6. Document the flat-key dictionary schema actually in use so later locale FEATs implement against one written contract.

## Acceptance Criteria

- [ ] AC1: A test asserts `LocaleProvider.t()`'s fallback order (active dict → `en` → key) for a missing key, exercised against each of the 4 shipped locales.
- [ ] AC2: Per-string review/version metadata exists for en/es/ru/zh without changing `LocaleProvider`'s existing dictionary lookup behavior or any current runtime output.
- [ ] AC3: Pseudo-localization and RTL fixtures exist under `test/`, wired into the repo's existing test config, ready for reuse by Phase 2 (ar).
- [ ] AC4: Timing/mobile/accessibility/brand-tone test coverage exists for en/es/ru/zh.
- [ ] AC5: `scripts/assert-no-translate.mjs` and the `translate.goog` canonical-host guard both still pass, exercised together by one documented check.
- [ ] AC6: A short doc describes the dictionary schema and review/fallback contract, referenced as the contract EPIC #108 Phases 2-5 implement against.

## Files

```text
Update: src/client/i18n/LocaleProvider.tsx (only if AC1's test surfaces a real fallback bug; no behavior change otherwise expected)
Add: src/client/i18n/meta/{en,es,ru,zh}.json (or equivalent per-string review/version metadata)
Add: test fixtures/specs for the fallback contract, pseudo-localization, RTL, and timing/mobile/accessibility/brand-tone coverage under test/
Add/update: one script or test step wiring scripts/assert-no-translate.mjs + the translate.goog guard into a single documented gate
Add: a short doc describing the dictionary/review/fallback schema (e.g. docs/i18n-schema.md)
```

Paths are best-effort from live inspection of `src/client/i18n/`, `src/client/config/`, `scripts/`, and `test/`; exact filenames are resolved during implementation against this repo's actual test and doc conventions.

## Legal triggers

None. Internal test/documentation hardening of already-shipped, first-party locale content; no new third-party content, licensing, or contracts introduced.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Implementation review and governed decisions | 1–2 hours |
| Total | 1–2 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, test run, review | 1 working day |
| Total | 1 working day |

### Assumptions

- No breaking change to `LocaleProvider`'s public contract (`useLocale()`, `t()`) is required to add metadata/tests/docs.
- The existing `en/es/ru/zh` dictionaries do not need translation content changes — only metadata, tests, and documentation are added.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 1–2 active hours / 1 working day | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-09-04T04:48:45.942Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). Path A failed: `issues/2026-05-09__chore__inline.scored.md` exists but contains a different spec (issue #53, Russian tagline chore), not this one.
- **Source issue:** UzorAI/uzorai.com#109 — "CHORE: i18n base hardening (EPIC #108 Phase 1)" (created 2026-09-04T04:48:46Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=chore) on the acquired body → 6/6 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** CHORE → AUTO (full pass, no `gates[]` declared). No HOLD; no approval channel required. PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #109 on branch `htu/i18n-base-hardening-epic-108-phase-1-109`; committed with the implementation PR.
