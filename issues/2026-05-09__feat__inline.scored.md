# FEAT: i18n (in-house translation) for uzorai.com — EPIC #29 Phase B

## Intent

Port htu.io's in-house i18n into uzorai.com: a locale provider + dictionaries + a `LanguagePicker`, so visitors read uzorai.com in their language. This is the translation path PR #27 (deny third-party translation) assumes — denying Google only makes sense once UZOR provides translation. Bundle en + es/ru/zh (htu.io's core set), ar optional with RTL. Adapt htu-foundation's `src/i18n/` provider, `config/languages.js`, and `LanguagePicker` to React 19 + react-router v7. EPIC #29 Phase B; foundational, no dependency.

## Decision Tree

| Decision | Options | Choice | Why |
|---|---|---|---|
| i18n engine | port htu-foundation provider / react-i18next / FormatJS | port htu-foundation provider | framework parity; the htu pattern is a lightweight dict + context, no heavy dependency |
| Locale set v1 | en only / en+es+ru+zh / all six incl fr+ar | en+es+ru+zh (ar optional) | matches the htu core + org locale set; ar adds RTL cost, so it is gated |
| Dictionary load | bundle all / lazy per-locale | lazy per-locale | keeps the initial bundle small; only the active locale ships |
| Persistence | localStorage / cookie / URL path | localStorage | matches htu + the Theme FEAT pattern; static-shell Worker |
| Missing-key behaviour | throw / blank / fall back to en | fall back to en | never blank the UI; en is the source dictionary |

### Trigger for change
If per-locale SEO URLs become a requirement, revisit persistence (URL-path / subpath locale + hreflang) instead of localStorage-only.

## Final Spec

- A `LocaleProvider` (React context) exposing `{ locale, setLocale, t }`; `t(key)` resolves from the active dictionary, falling back to `en`.
- Locale dictionaries as JSON: `en`, `es`, `ru`, `zh` (ar optional). `en` is canonical.
- `config/languages.ts` — locale metadata (code, label, dir).
- A `LanguagePicker` component (ported) switching locale and persisting to localStorage `uzor-locale`.
- `dir="rtl"` on `<html>` for RTL locales (ar), with `rtl.css` for flips.
- Lazy dictionary import per locale.

## Acceptance Criteria

- [ ] Switching locale via the picker re-renders all visible copy in the selected language.
- [ ] The choice persists across reload (localStorage `uzor-locale`).
- [ ] A missing key falls back to the `en` string, never blank.
- [ ] First visit defaults to `en` or the best `navigator.languages` match among bundled locales.
- [ ] Selecting `ar` (if shipped) sets `dir="rtl"` and the layout flips.
- [ ] `npm run build` passes, including the no-translate guard.

## Game Theory Cooperative Model review

### Who benefits
Non-English visitors (read in their language — the point of denying Google Translate), the brand (controlled, accurate translation vs machine output), and contributors (a clear dictionary to extend).

### Abuse vector
A corrupted or invalid stored `uzor-locale`, or a partially-translated dictionary, could render blank or mixed-language UI; a malicious dictionary contribution could inject content.

### Mitigation
The provider validates `uzor-locale` against the known-locale enum (fallback en); missing keys fall back to en (no blank UI); dictionaries are first-party and reviewed via the normal PR + dual-control merge — there are no runtime user-supplied dictionaries.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Translation | none (English-only; Google denied by #27) | in-house i18n, en+es+ru+zh (ar optional) |
| Component copy | hardcoded English strings | `t(key)` lookups against dictionaries |
| App root | no locale provider | wrapped in LocaleProvider |
| Document dir | always ltr | dir set per locale (rtl for ar) |
| Open questions | exact v1 locale set; ar/RTL in v1 or deferred? | tracked; default en+es+ru+zh, ar gated on an RTL review |

## Files created / updated

```
src/client/i18n/LocaleProvider.tsx        (NEW - context + t() + fallback-to-en)
src/client/i18n/en.json                   (NEW - canonical source dictionary)
src/client/i18n/es.json                   (NEW)
src/client/i18n/ru.json                   (NEW)
src/client/i18n/zh.json                   (NEW)
src/client/config/languages.ts            (NEW - locale metadata: code, label, dir)
src/client/components/LanguagePicker.tsx  (NEW - ported switcher; persists uzor-locale)
src/client/styles/rtl.css                 (NEW - RTL flips, loaded for rtl locales)
src/client/main.tsx                       (UPDATED - wrap App in LocaleProvider)
```

## Models Applied

- **#1 Game Theory Cooperative** — declared and evidenced by the `### Abuse vector` subsection (stored-locale and dictionary-injection abuse + mitigation).
- **#2 Decision Tree** — declared and evidenced by the Decision Tree table (Options / Choice / Why) plus `### Trigger for change`.

## Legal triggers

None. First-party UI translation content. No contracts, PII/PHI/PAN, licensing, royalties, or third-party terms. `uzor-locale` is a non-personal UI preference; the dictionaries are first-party authored content, not third-party licensed text.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review FEAT + implw PR | 20 min |
| Approve + human_merge | 5 min |
| Deploy + spot-check locales | 10 min |
| Total | 35 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run (provider + dicts + picker) | 20 min |
| CI deploy | 3 min |
| Total | 23 min |

### Assumptions

- uzorai.com is implw-onboarded.
- v1 locale set is en+es+ru+zh; ar/RTL is gated on a separate review.
- Dictionaries are seeded from the existing marketing copy (Home/Pricing/Platform/Docs/Governance/Contact); translating the strings is content work that can follow the scaffold.
- The no-translate build guard stays green.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 20 min | TBD | TBD |
| Review + merge | 25 min | TBD | TBD |
| Deploy + verify | 10 min | TBD | TBD |
| Total | 55 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-06-14T06:56:33.323Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). No file-uploaded
  spec resolved from the `_Source:_` footer (`issues/2026-05-09__feat__inline.scored.md`
  did not exist prior to this run; `issues/` carried only the REFACTOR specs), so the
  GitHub issue body was authoritative and is materialized here verbatim.
- **Source issue:** UzorAI/uzorai.com#31 — "FEAT: i18n (in-house translation) for
  uzorai.com — EPIC #29 Phase B" (created 2026-06-14T06:56:33Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=feat) on the acquired body →
  10/10 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** FEAT → HOLD. Headless run (implw runner; spec staged to a temp file and
  passed as an argument). The `needs-approval` label was absent on issue #31, so the
  HOLD cleared as solo-operator approved via the `label-absent` channel (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #31 on branch
  `htu/i18n-in-house-translation-31`; committed with the implementation PR.
