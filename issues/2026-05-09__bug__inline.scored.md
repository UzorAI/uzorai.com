# BUG: hero meaning-strip label "UZOR · THE PATTERN" is hardcoded — untranslated in every non-English locale

## Intent

The hero "meaning strip" label `UZOR · THE PATTERN` renders the same English text in every locale because it is a hardcoded JSX literal in `Home.tsx`, not routed through `t()`. Every other hero string localizes, and the gloss right beside it (`home.meaning.text`) already shows 范式 in Chinese — so the untranslated label looks like a defect sitting next to translated copy. Fix: route the label through a new `home.meaning.label` i18n key and supply localized values in all four dictionaries (en/es/ru/zh). The `UZOR` brand mark stays verbatim; the "THE PATTERN" gloss localizes (zh → 范式, matching the body).

## Repro

### Preconditions

- uzorai.com built from current `main`; the LanguagePicker is available in the header.

### Steps

1. Load the home page.
2. Switch the language to 中文 (or any non-English locale: es / ru).

### Expected

- The meaning-strip label localizes like the rest of the hero — e.g. `UZOR · 范式` in Chinese.

### Actual

- The label stays `UZOR · THE PATTERN` in English across every locale, beside an already-translated gloss.

### Root cause

- In `src/client/routes/Home.tsx`, the meaning-strip `<span>` contains the literal text `UZOR · THE PATTERN` instead of a `t(...)` call. The adjacent gloss uses `t('home.meaning.text')`, so only the gloss localizes and the label does not.

## Fix

### Layer 1 — route the label through i18n

Replace the hardcoded `UZOR · THE PATTERN` literal in the meaning-strip `<span>` of `Home.tsx` with `{t('home.meaning.label')}`.

### Layer 2 — add the key to every dictionary

Add `home.meaning.label` to `en.json`, `es.json`, `ru.json`, and `zh.json`. The `UZOR` mark stays verbatim; the gloss localizes. Suggested values (final wording at implementer/translator discretion): en `UZOR · THE PATTERN`; zh `UZOR · 范式`; es `UZOR · EL PATRÓN`; ru `UZOR · ПАТТЕРН`.

## Acceptance Criteria

- [ ] The meaning-strip label renders via `t('home.meaning.label')`; no hardcoded label copy remains in `Home.tsx`.
- [ ] `home.meaning.label` exists in all four dictionaries (en/es/ru/zh), with the `UZOR` mark preserved and the gloss localized.
- [ ] Switching to 中文 shows the localized label (e.g. `UZOR · 范式`); the English rendering is unchanged.
- [ ] No other hero string regresses; the en fallback still resolves if a key is ever missing.

## Subject Migration Summary

| Subject | From | To | Notes |
|---|---|---|---|
| Meaning-strip label | Hardcoded `UZOR · THE PATTERN` literal in `Home.tsx` | `t('home.meaning.label')` | Routed through i18n like the rest of the hero |
| Dictionaries | No `home.meaning.label` key | Key present in en/es/ru/zh | `UZOR` mark kept; gloss localized |
| Open questions | Keep `UZOR ·` inside the translated value, or render the mark separately and translate only the gloss? | Implementer's call — either satisfies the AC as long as the gloss localizes | A single key is the simplest path |

## Files

```
src/client/routes/Home.tsx        # replace the hardcoded "UZOR · THE PATTERN" literal with t('home.meaning.label')
src/client/i18n/en.json           # add home.meaning.label
src/client/i18n/es.json           # add home.meaning.label
src/client/i18n/ru.json           # add home.meaning.label
src/client/i18n/zh.json           # add home.meaning.label
```

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review + file | 3 min |
| Review PR + approve + merge | 5 min |
| Deploy + verify | 3 min |
| Total | 11 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run | ~10 min |
| Pages deploy | ~3 min |
| Total | ~13 min |

### Assumptions

- The `t()` resolver falls back to en when a key is missing (LocaleProvider), so a partial rollout never crashes.
- `UZOR` is a brand mark that stays untranslated; only the gloss localizes.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Active operator time | 11 min | TBD | TBD |
| Wall-clock time | 13 min | TBD | TBD |

## Legal triggers

None. Front-end copy localization only; no PII, no contractual or regulated content. The `UZOR` brand mark is preserved verbatim.

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-06-19T03:20:06.965Z
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
- **Issue:** UzorAI/uzorai.com#58
- **Materialized by:** implw (§4 auto-materialize) during the implementation run.
- **Filename derivation (§4.1):** from the `_Source: 2026-05-09__bug__inline.md_` footer → `2026-05-09__bug__inline.scored.md`.
- **Integrity re-score (§3):** `score_spec` (spec_type=bug) returned 8/8 PASS, rubric 1.5.0 — matches the stored score block.
