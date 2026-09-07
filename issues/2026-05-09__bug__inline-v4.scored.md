# BUG: uzorai.com renders Hebrew locale in a dated system font instead of a modern Hebrew webfont

## Intent

uzorai.com's Hebrew UI (nav bar, hero heading "מנוע UZOR", body copy) renders in an outdated system-era Hebrew face rather than an explicitly declared modern webfont. A native Hebrew-speaking reviewer flagged the current rendering as looking old-fashioned, comparing it unfavorably to legacy Yiddish-press typography — inconsistent with the product's positioning as a modern AI/orchestration platform. Contemporary Israeli tech/SaaS sites (Wix, monday.com, and most Google-Fonts-driven products) standardize on faces purpose-built for modern Hebrew screens, such as Heebo, Rubik, or Assistant. This bug scopes only the Hebrew locale; other site languages will be validated and filed separately.

## Repro

**Preconditions:** Browser or site language set to Hebrew (עברית); no custom font declared/loaded for the Hebrew subset.

**Steps:**
1. Set browser/OS language preference to Hebrew, or use the in-site language switcher (top nav, עברית).
2. Navigate to uzorai.com.
3. Inspect the rendered nav items (בית, פלטפורמה, תיעוד, ממשל, תמחור, יצירת קשר) and hero heading "מנוע UZOR".
4. Inspect computed `font-family` via devtools on Hebrew text elements.

**Expected:** Hebrew text renders in a contemporary, high-contrast, well-spaced webfont explicitly declared for the Hebrew subset (Heebo / Rubik / Assistant), matching modern Israeli tech UI conventions.

**Actual:** Hebrew text falls back to an old-style system/serif-leaning face (Arial Hebrew / David / unstyled fallback) — no modern Hebrew webfont is declared, or the declared stack doesn't cover the Hebrew unicode range.

**Root cause:** No Hebrew-subset webfont is loaded/declared in the site's CSS font stack; Hebrew glyphs fall through to OS default fonts, which render as dated system faces.

## Fix

### Layer 1 — Declare a modern Hebrew font stack
Load **Heebo** (default), with **Rubik** and **Assistant** as declared alternates, via Google Fonts or self-hosted Fontsource files, Hebrew subset included. Apply to `html[lang="he"]`/`dir="rtl"` scope so Latin brand elements (e.g. "UzorAI" wordmark) are unaffected:

```css
html[lang="he"] body {
  font-family: 'Heebo', 'Rubik', 'Assistant', 'Arial Hebrew', Arial, sans-serif;
}
```

### Layer 2 — Verify weight/heading mapping
Confirm heading weights (nav, hero H1 "מנוע UZOR") map to available Heebo weights (400–800) rather than synthetic bold, and that loaded font-display avoids FOIT (use `font-display: swap`).

## Acceptance Criteria

- [ ] Computed `font-family` for Hebrew-locale nav and hero text resolves to Heebo (or declared fallback Rubik/Assistant), not a system default
- [ ] Font is loaded via Google Fonts/Fontsource with the Hebrew subset and Hebrew-specific glyphs (geresh ׳, gershayim ״, maqaf ־, ₪) render correctly
- [ ] No FOIT/FOUT flash exceeding 200ms on first paint (font-display: swap verified)
- [ ] Latin/logo elements ("UzorAI", "UZOR GO") are unaffected by the Hebrew font-stack scoping
- [ ] Native Hebrew-speaker visual review confirms the site reads as "modern," not dated

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Hebrew body/nav font | Unstyled system fallback (Arial Hebrew/David-like) | Heebo (primary), Rubik/Assistant fallback |
| Font loading | Not explicitly declared for Hebrew subset | Explicit Hebrew-subset webfont load, `font-display: swap` |
| Open questions | Should heading weight differ from body weight (e.g. Heebo 700 for H1 vs 400 body)? Self-host vs Google Fonts CDN for privacy/perf? | resolved on merge |

## Files

```
src/styles/fonts.css          # NEW — @font-face / @import for Heebo, Rubik, Assistant (Hebrew subset)
src/styles/rtl.css            # MODIFIED — scope Hebrew font-family under html[lang="he"]
src/components/Nav.tsx        # MODIFIED — verify no inline font-family override
```

## Legal triggers

None. (Google Fonts / Fontsource fonts used here — Heebo, Rubik, Assistant — are OFL-licensed, no attribution/royalty obligations. No contract, PHI, PCI, or data-residency implications from a font-stack change.)

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Add font-face/import + scope CSS | None | 20 min |
| QA pass (devtools + native speaker review) | None | 15 min |
| **Total** | — | 35 min |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation + PR | None | Same day |
| Review + merge | Approver availability | 1 day |
| **Total** | — | 1 day |

### Assumptions

- Site's build pipeline already supports adding a Google Fonts/Fontsource import without a broader CDN policy change.
- No brand guideline currently mandates the existing Hebrew fallback font.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Implementation | 35 min | TBD | TBD |
| **Total** | 35 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-09-07T08:43:52.773Z
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
- **Issue:** UzorAI/uzorai.com#140
- **Materialized by:** implw (§4 auto-materialize) during the implementation run.
- **Filename derivation (§4.1):** from the `_Source: 2026-05-09__bug__inline.md_` footer → `2026-05-09__bug__inline.scored.md`; `-v4` suffix applied (§4.2) because v1–v3 were already occupied by prior specs.
- **Path A divergence (§7):** `2026-05-09__bug__inline.scored.md` existed but contained a different spec (UzorAI/uzorai.com#58, i18n meaning-strip). Path A did not resolve for this issue; Path B used as authoritative.
- **Integrity re-score (§3):** `score_spec` (spec_type=bug) returned 8/8 PASS, rubric 1.5.0 — matches the stored score block.
