# BUG: uzorai.com footer not sticky and version stamp frozen

## Intent

The uzorai.com footer should match the canonical htu.io / streettt.com treatment: the footer block (brand line plus version stamp) pinned to the bottom of the viewport the same way the header is pinned to the top, and the version stamp reflecting the deployed release. Today the footer sits in normal document flow, so on short routes it floats mid-page, and the version is frozen at `v0.1.0` because nothing bumps `package.json`, which `VersionFooter` inlines at build time. Bring both behaviors to parity with htu.io and streettt.com.

## Repro

### Preconditions

- uzorai.com `main`, current production build, tall viewport.

### Steps

1. Load uzorai.com on a short route (Home above the fold).
2. Observe the footer block ("UZOR — …" and "uzorai.com · vX").
3. Ship any change and reload; observe the version stamp.

### Expected

- Footer pinned to the viewport bottom, the way the header is pinned to the top, as on htu.io / streettt.com.
- Version stamp reflects the current release and moves across releases.

### Actual

- Footer sits in normal flow; on short pages it floats above the viewport bottom instead of pinning.
- Version stamp is permanently `v0.1.0`.

### Root cause

- Layout: `App.tsx` renders `<Footer/>` and `<VersionFooter/>` in normal flow under `.app`; there is no flex-column / min-height layout pushing the footer to the bottom the way the header is fixed at the top.
- Version: `VersionFooter` inlines `version` from `package.json` at build time, and `package.json` has never moved off `0.1.0` — uzorai.com has no per-release version bump, unlike htu.io / streettt.com.

## Fix

### Layer 1 — sticky footer layout

Mirror htu.io/streettt.com: make `.app` a flex column at `min-height: 100dvh` with `main` taking `flex: 1`, so the footer block pins to the viewport bottom on short pages and flows after content on long ones — matching the header's static treatment. Read htu.io's and streettt.com's layout/CSS and match their exact approach (sticky vs flex-push) rather than inventing a new one.

### Layer 2 — version stamp reflects the release

Adopt the version-stamp behavior htu.io/streettt.com use: bump `package.json` `version` off `0.1.0` to the current release as part of this fix, following whatever per-release bump convention those repos use so the stamp keeps moving. Keep `VersionFooter`'s build-time inline source unchanged.

## Acceptance Criteria

- [ ] On a short route in a tall viewport, the footer block is pinned to the bottom of the viewport (not floating mid-page), matching htu.io and streettt.com.
- [ ] On a long route, the footer flows normally after content with no overlap.
- [ ] The header's existing static treatment is unchanged.
- [ ] `package.json` `version` is bumped off `0.1.0` and the footer renders the new value.
- [ ] The footer layout approach matches the canonical htu.io/streettt.com pattern with no bespoke divergence.
- [ ] Build green (`tsc --noEmit` plus `vite build`); the no-translate guard is unaffected.

## Subject Migration Summary

| Subject | From | To | Notes |
|---|---|---|---|
| Footer position | Normal flow under `.app` | Pinned to viewport bottom (flex-column / min-height) | Match htu.io/streettt |
| Version stamp | Frozen `v0.1.0` (package.json never bumped) | Reflects release; bumped this PR | Mirror htu.io/streettt bump convention |
| Reference pattern | n/a | htu.io and streettt.com footer/layout | ZiLin-Dev grounds against both |
| Open questions | Do htu.io/streettt use `position: sticky` or a flex-push min-height layout for the footer? | Resolve by reading those repos | Match whichever they use; do not invent |

## Files

```
src/client/App.tsx                          # layout wrapper: flex column / min-height so the footer pins
src/client/components/Footer.tsx            # footer block — match canonical markup/treatment if needed
src/client/components/VersionFooter.tsx     # keep the build-time package.json version source
src/client/brand/tokens.css                 # .app / main / footer layout rules (or wherever layout CSS lives)
package.json                                # bump version off 0.1.0
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
| implw run | ~12 min |
| Review, merge, deploy | ~8 min |
| Total | ~20 min |

### Assumptions

- htu.io and streettt.com share one canonical footer/layout pattern ZiLin-Dev can read and mirror.
- `VersionFooter`'s `package.json` build-time source is retained; only the value and the layout change.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Active operator time | 6 min | TBD | TBD |
| Wall-clock time | 20 min | TBD | TBD |

## Legal triggers

None.

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-06-18T05:08:49.088Z
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

- **Source:** GitHub issue [#55](https://github.com/UzorAI/uzorai.com/issues/55) — inline-scored body (Path B, IMPLW_FLOW.md §4).
- **Acquisition:** inline-scored. No `issues/2026-05-09__bug__inline.scored.md` existed at acquisition time (Path A did not resolve); the issue body carried all three inline-score signals (`## ZAI Spec Score` heading, `**Score:** 8/8` = required section count for `bug`, `**Passed:** YES`), so the body is authoritative.
- **Filename derivation (§4.1):** from the `_Source: 2026-05-09__bug__inline.md_` footer → `issues/2026-05-09__bug__inline.scored.md`. No collision; no `-vN` suffix applied (§4.2).
- **Integrity re-score (§3):** re-ran `score_spec` (spec_type `bug`) via the UZOR Skills MCP — 8/8 PASS, rubric 1.5.0, all eight sections PASS. Matches the stored score block; no divergence.
- **Materialized by:** implw (`htu/footer-sticky-and-version-stamp-55`), committed with the implementation PR (§4.4).
