# CHORE: Russian hero tagline to informal imperative

## Intent

The Russian hero phrase and header tagline use the formal/plural imperative ("Оркестрируйте. Управляйте. Выполняйте."). Switch the three verbs to the informal/singular imperative ("Оркестрируй. Управляй. Выполняй.") to match the intended brand voice. The phrase renders in the per-page header tagline and the Home hero, so the change touches four keys in the Russian locale only. Other locales and unrelated body imperatives are out of scope.

## Action

1. In `src/client/i18n/ru.json`, set `header.tagline` from `Оркестрируйте. Управляйте. Выполняйте.` to `Оркестрируй. Управляй. Выполняй.`.
2. Set `home.hero.headline.1` from `Оркестрируйте.` to `Оркестрируй.`.
3. Set `home.hero.headline.2` from `Управляйте.` to `Управляй.`.
4. Set `home.hero.headline.3` from `Выполняйте.` to `Выполняй.`.
5. Leave every other key, the noun forms (Оркестрация, Управление, Выполнение), and the `en.json` / `es.json` / `zh.json` locales unchanged.

## Acceptance Criteria

- [ ] `header.tagline` reads exactly `Оркестрируй. Управляй. Выполняй.`.
- [ ] `home.hero.headline.1` / `.2` / `.3` read `Оркестрируй.` / `Управляй.` / `Выполняй.`.
- [ ] No other `ru.json` key value changes; `en.json`, `es.json`, `zh.json` are untouched.
- [ ] `ru.json` remains valid JSON and its key set is unchanged.

## Files

```
src/client/i18n/ru.json   # 4 value edits: header.tagline + home.hero.headline.1/2/3
```

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review and approve PR | 3 min |
| Approve and human_merge | 3 min |
| Total | 6 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run | ~8 min |
| Review, merge, deploy | ~7 min |
| Total | ~15 min |

### Assumptions

- `ru.json` is the only place these three verb forms appear (verified against the current file).
- Deploy is automatic on merge via Pages git-integration, or a standard publish step.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Active operator time | 6 min | TBD | TBD |
| Wall-clock time | 15 min | TBD | TBD |

## Legal triggers

None.

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-06-18T04:33:01.166Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). No file-uploaded
  spec resolved from the `_Source:_` footer (`issues/2026-05-09__chore__inline.scored.md`
  did not exist prior to this run; `issues/` carried only BRAND, FEAT, and REFACTOR
  specs), so the GitHub issue body was authoritative and is materialized here verbatim.
- **Source issue:** UzorAI/uzorai.com#53 — "CHORE: Russian hero tagline to informal
  imperative" (created 2026-06-18T04:33:01Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=chore) on the acquired body →
  6/6 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** CHORE → AUTO (full pass, no `gates[]` declared). No HOLD; no approval
  channel required. PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #53 on branch
  `htu/russian-hero-tagline-to-informal-imperative-53`; committed with the implementation PR.
