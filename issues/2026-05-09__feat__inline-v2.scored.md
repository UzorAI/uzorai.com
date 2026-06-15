# FEAT: Theme (dark/light) for uzorai.com — EPIC #29 Phase A

## Intent

Bring uzorai.com to htu.io theme parity: a dark/light theme with persistence and OS-preference detection, ported from htu-foundation's `lib/theme.js` + `ThemeToggle` + theme-token CSS into uzorai.com's React 19 + Vite stack. Today uzorai.com is light-only with brand tokens in `brand/tokens.css`; this adds a theme layer those tokens resolve against, a toggle for the nav, and first-visit `prefers-color-scheme` honouring. EPIC #29 Phase A; foundational, no dependency.

## Decision Tree

| Decision | Options | Choice | Why |
|---|---|---|---|
| Theme storage | localStorage / cookie / none | localStorage | matches htu-foundation; client-only, no SSR round-trip; the Worker serves a static shell |
| Token mechanism | CSS custom props keyed by data-theme / CSS-in-JS / class toggle | CSS custom props keyed by data-theme | matches the htu token contract; zero runtime cost; brand tokens already live in tokens.css |
| First-visit default | always light / always dark / prefers-color-scheme | prefers-color-scheme | respects the OS setting like htu.io; least surprising |
| Port strategy | verbatim copy / adapt to React 19 | adapt to a React 19 provider + hook | htu-foundation theme.js is framework-agnostic init; wrap it in a React context for uzorai |

### Trigger for change
If uzorai.com later adds SSR / edge-rendered HTML, revisit storage (a cookie enables no-flash SSR theming). Today the Worker serves a static client shell, so localStorage + an inline pre-paint script suffice.

## Final Spec

- `data-theme="light|dark"` on `<html>`, set before first paint by a tiny inline head script (no flash-of-wrong-theme).
- A `ThemeProvider` (React context) exposing `{ theme, setTheme, toggle }`; reads localStorage key `uzor-theme`, falls back to `prefers-color-scheme`.
- A `ThemeToggle` button toggling light/dark, ported from htu-foundation.
- `brand/tokens.css` extended with a dark block: the same `--color-*` custom props redefined under `:root[data-theme="dark"]`.
- An `initTheme()` applied in the inline head script and reconciled by the provider on mount.

## Acceptance Criteria

- [ ] Toggling the theme switches `data-theme` on `<html>` and all `--color-*`-driven UI updates with it.
- [ ] The choice persists across reload (localStorage `uzor-theme`).
- [ ] A first visit with no stored choice honours `prefers-color-scheme`.
- [ ] No flash-of-wrong-theme on load (theme applied before first paint).
- [ ] `npm run build` passes, including the existing no-translate guard.
- [ ] The light theme is visually unchanged from today (brand tokens intact).

## Game Theory Cooperative Model review

### Who benefits
Visitors (reduced eye strain, OS-consistent rendering), the brand (parity with htu.io, perceived polish), and the later FEATs — theme tokens are the substrate the nav and i18n render on.

### Abuse vector
A malicious or corrupted stored value (`uzor-theme=<garbage>`) could set an invalid `data-theme`. An actor can only write their own localStorage (no cross-origin write), so the blast radius is the local session.

### Mitigation
The provider validates the stored value against the `light|dark` enum and falls back to `prefers-color-scheme` on anything else; the inline pre-paint script is defensive (try/catch, default light).

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Theme | light-only, no toggle | light/dark with persistence + OS default |
| brand/tokens.css | single token set | adds a `:root[data-theme="dark"]` token block |
| Document | no data-theme | data-theme set pre-paint |
| App root | no theme provider | wrapped in ThemeProvider |
| Open questions | should dark be the brand default rather than OS preference? | tracked; default stays prefers-color-scheme until brand decides |

## Files created / updated

```
src/client/theme/ThemeProvider.tsx     (NEW - context + hook; localStorage + prefers-color-scheme)
src/client/theme/initTheme.ts          (NEW - pre-paint apply, exported for the inline script)
src/client/components/ThemeToggle.tsx  (NEW - ported toggle button)
src/client/brand/tokens.css            (UPDATED - + dark :root[data-theme="dark"] block)
src/client/index.html                  (UPDATED - inline pre-paint theme script in <head>)
src/client/main.tsx                    (UPDATED - wrap App in ThemeProvider)
```

## Models Applied

- **#1 Game Theory Cooperative** — declared and evidenced by the `### Abuse vector` subsection (stored-value abuse + mitigation).
- **#2 Decision Tree** — declared and evidenced by the Decision Tree table (Options / Choice / Why) plus `### Trigger for change`.

## Legal triggers

None. Client-side theming only. No contracts, PII/PHI/PAN, licensing, royalties, or third-party terms. localStorage holds a non-personal UI preference (`light|dark`).

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review FEAT + implw PR | 15 min |
| Approve + human_merge | 5 min |
| Deploy + verify | 5 min |
| Total | 25 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run (port + tests) | 15 min |
| CI deploy | 3 min |
| Total | 18 min |

### Assumptions

- uzorai.com is implw-onboarded (otherwise onboard first per htu-onboard-repo).
- The no-translate build guard stays green (a theme change does not touch the head meta).
- Brand tokens already define the light values; dark is purely additive.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 15 min | TBD | TBD |
| Review + merge | 20 min | TBD | TBD |
| Deploy + verify | 5 min | TBD | TBD |
| Total | 40 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-06-14T06:55:37.262Z
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

- **Source:** inline-scored GitHub issue body (IMPLW_FLOW.md §2 Path B / MCP).
- **Issue:** UzorAI/uzorai.com#30 — _FEAT: Theme (dark/light) for uzorai.com — EPIC #29 Phase A_.
- **Materialized by:** implw run on 2026-06-14, committed with the implementation PR (§4.4).
- **Integrity re-score (§3):** re-scored via the UZOR Skills `score_spec` tool (`spec_type=feat`, rubric 1.5.0) → 10/10 PASS, matching the issue's inline score block.
- **Filename collision (§4.2):** the `_Source:` slug `2026-05-09__feat__inline.md` is non-unique across EPIC #29 — Phase B (i18n) materialized first and holds the canonical `2026-05-09__feat__inline.scored.md`. This Phase A (theme) spec is therefore suffixed `-v2`. Path A did **not** genuinely resolve for this issue: the canonical file's body is the Phase B i18n spec, not this issue's content, so acquisition fell through to Path B.
