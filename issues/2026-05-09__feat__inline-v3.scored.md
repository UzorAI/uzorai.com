# FEAT: Navigation shell (responsive) for uzorai.com — EPIC #29 Phase C

## Intent

Replace uzorai.com's static Header/Nav with a responsive navigation shell ported from htu.io's `NavMenu` + `VersionFooter`: a horizontal top bar on desktop that collapses to a vertical drawer on mobile, wiring the existing react-router routes (Home, Platform, Pricing, Docs, Governance, Contact) and hosting the ThemeToggle (Phase A) + LanguagePicker (Phase B). EPIC #29 Phase C; depends on A (#30) + B (#31) for the controls it hosts.

## Decision Tree

| Decision | Options | Choice | Why |
|---|---|---|---|
| Nav pattern | two separate navs / one responsive NavMenu | one responsive NavMenu | the htu.io pattern; horizontal↔drawer is one component, less duplication |
| Mobile collapse | CSS-only / JS drawer state | JS drawer state (useState) + CSS | a drawer needs open/close + focus trap; matches the htu NavMenu |
| Route source | hardcode in nav / read a route config | shared route config | a single source for nav + router; avoids drift |
| Controls placement | separate toolbar / inside the nav bar | inside the nav bar | matches htu.io; toggle + picker live in the bar (desktop) and the drawer (mobile) |
| Breakpoint | match htu / bespoke | match the htu breakpoint | parity; consistent behaviour across HTU sites |

### Trigger for change
If uzorai later needs a persistent side rail (docs-style vertical nav coexisting with the top bar), that is a NEW pattern → a separate FEAT, not an extension of this responsive NavMenu.

## Final Spec

- A `NavMenu` component: horizontal bar at or above the breakpoint; below it, a hamburger toggling a vertical drawer.
- Drawer: focus-trapped, closes on route change, Escape, and backdrop click.
- Route set from a shared `routes` config consumed by both the nav and the router.
- The nav bar hosts the brand mark (link to Home), the route links, the ThemeToggle, and the LanguagePicker; in the drawer these stack vertically.
- `VersionFooter` ported (build/version stamp) at the app foot.
- Active-route styling via react-router `NavLink`.

## Acceptance Criteria

- [ ] Desktop (≥ breakpoint) renders the horizontal bar with all routes + ThemeToggle + LanguagePicker.
- [ ] Below the breakpoint the bar collapses to a hamburger that opens a vertical drawer with the same items.
- [ ] The drawer closes on route change, Escape, and backdrop click; focus is trapped while it is open.
- [ ] Every existing route (Home, Platform, Pricing, Docs, Governance, Contact) is reachable from the nav and the active route is visually marked.
- [ ] Nav labels render via i18n `t()` (Phase B) and the bar respects the theme (Phase A).
- [ ] `npm run build` passes, including the no-translate guard.

## Game Theory Cooperative Model review

### Who benefits
Visitors (consistent wayfinding on any device), the brand (htu.io nav parity), and the Theme + i18n FEATs — the nav is where their controls surface to users.

### Abuse vector
A deep-link to a route removed from the config, or a drawer left open trapping focus, could strand a keyboard / screen-reader user; an unbounded route config could let an injected entry render an arbitrary link.

### Mitigation
Routes come from a single typed `routes` config (no user input); unknown paths hit the router's 404; the drawer's focus trap always exposes an Escape + close affordance and releases focus on close; nav entries are compile-time, not runtime data.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Navigation | static Header.tsx + Nav.tsx | responsive NavMenu (bar ↔ drawer) |
| Route definitions | inline in components | a shared routes config (nav + router) |
| Theme/locale controls | none in nav | ThemeToggle + LanguagePicker hosted in the nav |
| Footer | static Footer.tsx | adds VersionFooter (build/version stamp) |
| Open questions | keep existing Header/Footer or fully replace? | tracked; replace Nav, fold the Header brand into NavMenu, keep Footer and add VersionFooter |

## Files created / updated

```
src/client/components/NavMenu.tsx        (NEW - responsive bar + drawer, ported)
src/client/components/VersionFooter.tsx  (NEW - ported build/version stamp)
src/client/config/routes.ts              (NEW - shared route config: path, label-key, element)
src/client/components/Nav.tsx            (UPDATED - superseded by NavMenu)
src/client/components/Header.tsx         (UPDATED - brand mark folded into NavMenu)
src/client/App.tsx                       (UPDATED - render NavMenu + routed outlet + VersionFooter)
```

## Models Applied

- **#1 Game Theory Cooperative** — declared and evidenced by the `### Abuse vector` subsection (route and focus-trap abuse + mitigation).
- **#2 Decision Tree** — declared and evidenced by the Decision Tree table (Options / Choice / Why) plus `### Trigger for change`.

## Legal triggers

None. Client-side navigation UI. No contracts, PII/PHI/PAN, licensing, royalties, or third-party terms.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review FEAT + implw PR | 20 min |
| Approve + human_merge | 5 min |
| Deploy + verify desktop + mobile | 10 min |
| Total | 35 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| Phase A (#30) + Phase B (#31) merged | blocking |
| implw run (nav + drawer + footer) | 25 min |
| CI deploy | 3 min |
| Total | 28 min after A+B |

### Assumptions

- Phase A (#30) and Phase B (#31) are merged first — this nav hosts their controls.
- uzorai.com is implw-onboarded.
- The existing route set is the six current marketing routes.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 25 min | TBD | TBD |
| Review + merge | 25 min | TBD | TBD |
| Deploy + verify | 10 min | TBD | TBD |
| Total | 60 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-06-14T06:57:25.161Z
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

- **Materialized by:** `implw` (IMPLW_FLOW.md §4) from the inline-scored body of
  issue **UzorAI/uzorai.com#32** — _FEAT: Navigation shell (responsive) for
  uzorai.com — EPIC #29 Phase C_.
- **Acquisition path:** Path B (inline-scored issue body). The issue's
  `_Source:_` footer names `2026-05-09__feat__inline.md`, but the matching
  `issues/2026-05-09__feat__inline.scored.md` (and `-v2`) are unrelated specs
  (Phase B i18n and Phase A theme), so Path A does not resolve to this content;
  the inline body is authoritative.
- **Filename collision (§4.2):** base `2026-05-09__feat__inline.scored.md` and
  `-v2` already exist (Phase B, Phase A) → suffixed `-v3`.
- **Integrity re-score (§3):** re-scored via the UZOR Skills `score_spec` tool
  (`spec_type=feat`) → **10/10 PASS**, rubric **1.5.0** — matches the stored
  score block.
- **Gate 1:** `feat` → HOLD; headless run with the `needs-approval` label absent
  → cleared `label-absent` (attributed to daniel-silvers). PR review by
  daniel-silvers still required to merge.
