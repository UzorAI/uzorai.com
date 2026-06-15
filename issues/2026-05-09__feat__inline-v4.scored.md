# FEAT: complete site-wide i18n — route pages, footer, and hero all through t()

## Intent

EPIC #29 Phase B localized only the nav chrome and the Home body. Switching the language picker to es / ru / zh leaves the five route pages (Platform, Governance, Docs, Pricing, Contact), the footer (its tagline and the "Orchestrate. Govern. Execute." verbs in the copyright line), and the Home hero headline in English — a half-localized site that contradicts the governed multi-locale positioning. Route every remaining user-facing string through the `LocaleProvider`'s `t()` and add es / ru / zh translations, so the entire site localizes on a language switch. String-plumbing plus dictionaries only; no layout, routing, or component-structure change. Supersedes #42 (which covered only the route pages).

## Decision Tree

| Decision | Options | Chosen | Why |
|---|---|---|---|
| Scope | route pages only (as in #42) vs every remaining hardcoded user-facing string | every remaining string — route pages + footer + hero headline | the requirement is that a language switch localizes the whole site; partial coverage is the defect |
| Key namespacing | one flat space vs per-surface namespace | per-surface (`platform.*`, `governance.*`, `docs.*`, `pricing.*`, `contact.*`, `footer.*`) + reuse `home.*` / `header.*` where identical | mirrors the `home.*` convention; reuse prevents duplicate translations drifting |
| Hero headline "Orchestrate. Govern. Execute." | keep as the English brand wordmark vs localize | localize via `home.hero.headline`, preserving the en two-tone accent; other locales render the localized phrase | the directive is "everything"; trivially reverted by pinning the key to en if the brand prefers the wordmark |
| Footer copyright verbs | new key vs reuse `header.tagline` | reuse `header.tagline` for the verbs; keep "© UzorAI." literal | the verbs already have translations; the legal mark stays fixed |
| Locale coverage | en-only keys now vs all four locales | all four (en/es/ru/zh) | matches the coverage the shipped dictionaries already carry; `ar` stays gated per `languages.ts` |

### Trigger for change

If a surface is removed or merged, drop its key namespace from all four dictionaries in the same change. If a new locale is added (e.g. `ar`), these namespaces are part of the dictionary it must cover.

## Final Spec

Enumerate and extract every user-facing literal on the five route pages (page `<h1>`, the mono tagline, the body paragraph(s), the card-array `h`/`p` entries, CTA/button labels, the contact email line), in the footer (the tagline and the "Orchestrate. Govern. Execute." verbs of the copyright), and the Home hero headline. Replace each with `t('<namespace>.<key>')` and add es/ru/zh values. Reuse `home.cta.*` and `header.tagline` where the string is identical rather than re-keying. The `en.json` entries are the canonical source text, verbatim from today's copy; es/ru/zh follow the tone already shipped for `home.*`. Styling is preserved: the footer stays mono/muted; the hero keeps its two-tone accent for en, and for other locales the accent applies to the central clause where cleanly separable, else a uniform treatment (implw's call with codebase context). The `VersionFooter` "uzorai.com · vX" stamp stays literal (build metadata, not prose); the `UZOR` / `UzorAI` wordmark tokens stay literal (brand marks).

## Acceptance Criteria

- [ ] Switching to es / ru / zh localizes ALL of: the five route pages, the footer tagline, the footer copyright verbs, and the Home hero headline.
- [ ] No user-facing English literal remains in the default render of any page on a non-en locale, except intentional brand marks (the `UZOR` / `UzorAI` wordmark tokens) and the version stamp.
- [ ] Every new key exists in `en.json`, `es.json`, `ru.json`, and `zh.json` (key parity) — no key present in one dictionary and missing in another.
- [ ] A missing translation falls back to the `en` value (never a raw key string) via the existing fallback path.
- [ ] No layout, routing, mark, or color change; the cube mark and the en two-tone hero treatment are preserved.
- [ ] `npm run build` passes (no-translate guard + tsc + vite).

## Game Theory Cooperative Model review

### Who benefits

Non-English visitors get a fully localized site instead of a half-translated one; the brand reads as coherent across every route and the footer. Future locale work benefits because every string then lives in the dictionaries, so adding `ar` or another locale is a dictionary task, not a per-file code hunt.

### Abuse vector

The failure mode is structural, not adversarial: a key added to `en.json` but forgotten in `ru.json` (or vice versa) renders either a raw key string (`platform.cap.1.h`) or a mixed-language page — worse UX than the current uniform English.

### Mitigation

`en` is the canonical fallback dictionary (`DEFAULT_LOCALE` in `config/languages.ts`); `t()` resolves a missing locale key to the `en` value, never the raw key. The Acceptance Criteria require key parity across all four dictionaries, and the build is the gate. The change is fully reversible (revert the PR) and ships no schema or data migration.

## Subject Migration Summary

| Subject | From | To | Notes |
|---|---|---|---|
| Five route pages | hardcoded en literals | `platform.*` / `governance.*` / `docs.*` / `pricing.*` / `contact.*` via `t()` | h1, mono tagline, body, cards, CTAs, email line |
| Footer tagline | hardcoded en | `footer.tagline` | the `UZOR` token stays literal |
| Footer copyright verbs | hardcoded en | reuse `header.tagline` | "© UzorAI." stays literal |
| Home hero headline | hardcoded en | `home.hero.headline` | preserve en two-tone accent |
| Dictionaries | `home.*` + chrome keys | + route, footer, and hero namespaces | en/es/ru/zh all extended |
| Open questions | — | Keep the giant hero as the English wordmark instead of localizing it? Default here is to localize per the "everything" directive; reverting is a one-line pin of `home.hero.headline` to the en value. | — |

## Files created / updated

```
src/client/routes/Platform.tsx     (UPDATED - literals -> t('platform.*'))
src/client/routes/Governance.tsx   (UPDATED - literals -> t('governance.*'))
src/client/routes/Docs.tsx         (UPDATED - literals -> t('docs.*'))
src/client/routes/Pricing.tsx      (UPDATED - literals -> t('pricing.*'); CTA reuses home.cta.demo)
src/client/routes/Contact.tsx      (UPDATED - literals -> t('contact.*'); CTA reuses home.cta.demo)
src/client/components/Footer.tsx   (UPDATED - tagline -> t('footer.tagline'); copyright verbs -> t('header.tagline'))
src/client/routes/Home.tsx         (UPDATED - hero headline -> t('home.hero.headline'))
src/client/i18n/en.json            (UPDATED - add all new keys, canonical source text)
src/client/i18n/es.json            (UPDATED - Spanish translations of the new keys)
src/client/i18n/ru.json            (UPDATED - Russian translations of the new keys)
src/client/i18n/zh.json            (UPDATED - Chinese translations of the new keys)
```

## Models Applied

- **#1 Game Theory Cooperative** — applied in the `## Game Theory Cooperative Model review` section above, with explicit `### Who benefits`, `### Abuse vector`, and `### Mitigation` subsections (the abuse vector is the key-parity failure mode, mitigated by the `en` fallback + key-parity AC).
- **#2 Decision Tree** — applied in the `## Decision Tree` section above: a markdown table of Decision / Options / Chosen / Why plus a `### Trigger for change` subsection.

## Legal triggers

None. First-party UI copy extraction and translation. No contracts, certification claims, PII/PHI/PAN, licensing, or third-party terms.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Clear needs-approval + dispatch implw | 3 min |
| Review implw PR (7 files + 4 dicts) | 15 min |
| Approve + human_merge | 5 min |
| Deploy + verify localization across locales | 7 min |
| Total | 30 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run (extract + translate every surface x 4 locales) | 14 min |
| CI deploy | 3 min |
| Total | 17 min |

### Assumptions

- uzorai.com is implw-onboarded and labels now exist (verified this session), so the `needs-approval` gate is live.
- The es / ru / zh translations are authored by the implw agent from the canonical en source, consistent with the existing `home.*` tone.
- The `t()` fallback-to-`en` behaviour already exists in `LocaleProvider`.
- No new locale is added by this FEAT (`ar` stays gated).

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 14 min | TBD | TBD |
| Review + merge | 20 min | TBD | TBD |
| Deploy + verify | 7 min | TBD | TBD |
| Total | 41 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-06-15T07:32:50.202Z
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

- **Acquisition path:** B (inline-scored issue body) per IMPLW_FLOW §2.
- **Source issue:** UzorAI/uzorai.com#43 (`FEAT: complete site-wide i18n — route pages, footer, and hero all through t()`), created 2026-06-15T07:32:50Z.
- **Materialized at:** 2026-06-15 by the implw command during the implementation run for #43.
- **Filename collision (§4.2):** the `_Source:` footer derives base `2026-05-09__feat__inline`; `.scored.md`, `-v2`, and `-v3` already exist on disk for **unrelated** earlier FEAT specs (EPIC #29 Phase B i18n bootstrap, Phase A theme, Phase C nav shell — the `_Source:` name is reused across those). This spec was therefore written under the next free suffix, `-v4`, to avoid clobbering them.
- **Integrity re-score (§3):** re-ran `score_spec` (spec_type `feat`) on the acquired body → 10/10 PASS, rubric 1.5.0, all ten sections PASS — matches the stored score block above.
- **Gate 1 (§4):** `feat` → HOLD; resolved in **headless** mode (stdin not a TTY) with the `needs-approval` label **absent** on #43 → cleared via channel `label-absent`, attributed to daniel-silvers.
