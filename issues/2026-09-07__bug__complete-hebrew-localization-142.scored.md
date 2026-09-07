# BUG: uzorai.com Hebrew locale still contains untranslated English/Latin-alphabet text

## Intent

On the Hebrew locale of uzorai.com, several UI strings remain in English/Latin script instead of being translated: the pipeline-stage labels ("Deployment", "Implementation and verification", "Governance", "Authoring"), the "MCP" label, the "UZOR GO" button text, the demo-artifact block ("Representative demo artifact", "UZOR workflow plan · model 1.0.0"), the music-notation status line ("Bar 32 · Beat 1 · resolution"), and the brand name "UZOR" itself within the hero heading. A fully localized Hebrew page should contain no Latin-alphabet text outside of code/technical identifiers that have no meaningful Hebrew equivalent (if any). This is a follow-up to BUG uzorai.com#140 (Hebrew font modernization) and covers translation completeness rather than typography.

## Repro

**Preconditions:** Site language set to Hebrew (עברית) via the language switcher.

**Steps:**
1. Navigate to uzorai.com with the language switcher set to עברית.
2. Scroll through the hero section and the horizontal pipeline strip ("רצף הבנייה הקנוני").
3. Observe the four pipeline-stage pills: "Deployment", "Implementation and verification", "Governance", "Authoring" — all rendered in English.
4. Observe "MCP" in the top meta line, the "UZOR GO" button, "UZOR" in the H1 ("UZOR מנוע"), and the "Bar 32 · Beat 1 · resolution" / "Representative demo artifact" / "UZOR workflow plan · model 1.0.0" block further down the page.
5. Confirm via view-source or devtools that these strings are hardcoded English rather than pulled from the Hebrew locale's translation table (or that no Hebrew translation key exists for them).

**Expected:** Every user-facing string on the Hebrew locale — including the four pipeline-stage labels, "MCP", the CTA button, and the demo-artifact block — renders in Hebrew. No Latin-alphabet text is visible on the page while the site is set to עברית, including the "UZOR" brand string in running text.

**Actual:** The pipeline-stage pills, "MCP", "UZOR GO", "UZOR" in the hero heading, and the demo-artifact/status block all render in English/Latin script, mixed in with the translated Hebrew copy around them.

**Root cause:** These strings are either missing from the Hebrew locale's translation dictionary (i18n keys fall back to the English default) or are hardcoded directly in the component markup rather than passed through the translation layer.

## Fix

### Layer 1 — Audit and complete the Hebrew translation table
Grep the codebase for hardcoded strings matching the flagged labels ("Deployment", "Implementation and verification", "Governance", "Authoring", "MCP", "UZOR GO", "Representative demo artifact", "UZOR workflow plan", "Bar", "Beat", "resolution") and move them into the i18n dictionary under Hebrew keys, e.g.:

```
he: {
  pipeline_deployment: "פריסה",
  pipeline_impl_verification: "יישום ואימות",
  pipeline_governance: "ממשל",
  pipeline_authoring: "יצירה",
  mcp_label: "פרוטוקול הקשר-מודל", // or transliteration if no established Hebrew term
  cta_uzor_go: "הפעלת אוזור גו", // see open question on brand-name handling below
  demo_artifact_label: "תוצר הדגמה מייצג",
  workflow_plan_label: "תוכנית זרימת עבודה · דגם 1.0.0",
}
```

### Layer 2 — Resolve brand-name handling for "UZOR"/"UzorAI"
Decide and apply one consistent treatment site-wide for the brand name in Hebrew running text: Hebrew transliteration (e.g. "אוזור"), or keep the registered wordmark untranslated as a proper-noun exception. Apply the decision consistently to the H1 ("UZOR מנוע" → e.g. "מנוע אוזור"), the CTA ("UZOR GO" → e.g. "הפעלת אוזור גו"), and the demo-artifact copy.

### Layer 3 — Guard against future regressions
Add an i18n-completeness lint/CI check that fails the build if any Latin-alphabet string (outside an allow-list for actual code identifiers/URLs) ships on a page rendered under the `he` locale.

## Acceptance Criteria

- [ ] All four pipeline-stage pills (Deployment, Implementation and verification, Governance, Authoring) render in Hebrew on the Hebrew locale
- [ ] "MCP" meta label renders in Hebrew (or an agreed Hebrew transliteration) on the Hebrew locale
- [ ] The CTA button and hero H1 no longer contain the untranslated Latin string "UZOR" per the brand-name decision in Layer 2
- [ ] "Representative demo artifact" and "UZOR workflow plan · model 1.0.0" render in Hebrew
- [ ] "Bar 32 · Beat 1 · resolution" status line renders in Hebrew
- [ ] A manual full-page scan of uzorai.com under עברית shows zero remaining Latin-alphabet UI strings (screenshot diff or native-speaker sign-off)
- [ ] CI i18n-completeness check added and passing

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Pipeline stage labels | English ("Deployment", "Implementation and verification", "Governance", "Authoring") | Hebrew equivalents added to `he` locale dictionary |
| "MCP" label | English acronym, untranslated | Hebrew label or agreed transliteration |
| Brand name "UZOR"/"UzorAI" in running text | Untranslated Latin string throughout hero, CTA, demo block | Single consistent treatment per Layer 2 decision (transliteration or explicit proper-noun exception) |
| Demo artifact / status block | English ("Representative demo artifact", "Bar 32 · Beat 1 · resolution", "UZOR workflow plan · model 1.0.0") | Hebrew equivalents |
| Open questions | Should "UZOR"/"UzorAI" be transliterated or kept as a protected brand wordmark exception? Does "MCP" have an established Hebrew industry term, or should it stay as a transliterated acronym? | resolved on merge — needs a product/brand decision, not just an engineering one |

## Files

```
src/i18n/he.json              # MODIFIED — add missing keys for pipeline labels, MCP, CTA, demo-artifact block
src/components/PipelineStrip.tsx   # MODIFIED — replace hardcoded English labels with i18n keys
src/components/Hero.tsx       # MODIFIED — route "UZOR" heading fragment and CTA through i18n per brand decision
src/components/DemoArtifact.tsx    # MODIFIED — replace hardcoded English copy with i18n keys
.github/workflows/i18n-lint.yml    # NEW — CI check for stray Latin-alphabet strings under `he` locale build
```

## Legal triggers

None. Brand/trademark handling of "UZOR"/"UzorAI" in Hebrew is a product/brand decision, not a legal-compliance trigger (no contract, PHI, PCI, or data-residency implications from a translation completeness fix).

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Audit + extract hardcoded strings to i18n dictionary | None | 30 min |
| Brand-name decision + apply consistently | Product/brand sign-off | 15 min (post-decision) |
| Add CI i18n-completeness check | None | 20 min |
| Full-page Hebrew scan / sign-off | None | 15 min |
| **Total** | — | 1 hr 20 min |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Brand-name decision | Product/brand owner input | 1–2 days |
| Implementation + PR | None (after decision) | Same day |
| Review + merge | Approver availability | 1 day |
| **Total** | — | 2–3 days |

### Assumptions

- A brand/product owner is available to make the "UZOR" transliteration-vs-proper-noun call before Layer 2 ships.
- The existing i18n framework supports per-locale dictionaries without a larger refactor.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Implementation | 1 hr 20 min | TBD | TBD |
| **Total** | 1 hr 20 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-09-07T08:50:06.143Z
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

## Provenance (auto-materialized)

- Source: inline-scored issue https://github.com/UzorAI/uzorai.com/issues/142
- Original score: 8/8 PASS, rubric 1.5.0. Re-score was verified by the original #142 run.
- Recovery: Claude session limit interrupted run 34105324419 before a commit or PR.
- Path A's generic inline filename belongs to another issue; this unique name prevents collision with #140.
- Current implementation follows the user's explicit continuation: audit the entire site and retain proper brand/protocol names (UZOR, UzorAI, UZOR GO, MCP), translating surrounding prose.
- The original scored body above is retained for provenance; the current clarification and full audit are recorded in docs/hebrew-localization-audit.md.
- Gate 1: continued work expressly authorized in-session; issue has no needs-approval label. Daniel's PR review remains required; no merge or deployment is authorized by this implementation request.
