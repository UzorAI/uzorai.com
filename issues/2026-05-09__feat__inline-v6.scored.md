# FEAT: port htu.io VersionFooter — sticky stripe, clickable version, Deployment History

## Intent

uzorai.com's footer should match htu.io's canonical module: a fixed-bottom version stripe whose version label is a button that opens a Deployment History overlay (release list, then a detail view with status and change bullets, closed by ESC, backdrop, or the close button). Today uzorai renders a static text VersionFooter (package.json inlined) plus a separate content Footer, both in normal flow — no sticky stripe, no clickable history. Port htu.io's `foundation/components/VersionFooter.jsx`: a fixed-bottom stripe, a `CURRENT_VERSION` const and `DEPLOYMENTS` array as the source (replacing the package.json read), and the click-to-open overlay, adapted to uzorai's design tokens and i18n. Supersedes BUG #55 (the sticky-footer plus package.json approach), closed in favour of this single coherent port.

## Decision Tree

| Options | Chosen | Why |
|---|---|---|
| Port htu.io's foundation VersionFooter wholesale / extend uzorai's static footer / keep package.json and bolt on a modal | Port htu.io's foundation VersionFooter | "Exactly like htu.io"; one mature, maintained module; avoids two divergent version mechanisms |
| Version source: package.json build-inline / `CURRENT_VERSION` const + `DEPLOYMENTS` array | `CURRENT_VERSION` const + `DEPLOYMENTS` array (htu.io pattern) | The history needs per-release metadata (title/date/status/details) a bare package.json version cannot carry |
| Language/Theme controls: move into the stripe (htu.io layout) / leave in uzorai's existing header | Leave in uzorai's header; stripe hosts the version button only | uzorai's header already hosts them; duplicating into the stripe is churn and a double control |
| Content Footer ("UZOR — …"): remove / keep above the fixed stripe | Keep, with bottom padding so the fixed stripe never overlaps content | Preserves the brand line; htu.io's stripe coexists with page content |

### Trigger for change

Revisit if uzorai adopts a build pipeline that emits deployment metadata automatically (the hand-maintained `DEPLOYMENTS` array would be generated instead), or if the foundation VersionFooter is extracted into a shared package both sites import.

## Final Spec

Replace `src/client/components/VersionFooter.tsx` with a TypeScript port of htu.io's `src/foundation/components/VersionFooter.jsx`:

1. A fixed-bottom stripe (`position: fixed; bottom: 0; left/right: 0; zIndex: 40`) styled with uzorai's tokens.
2. The version label is a `<button>` showing `v{CURRENT_VERSION}` (plus `-{mode}` outside production) that toggles a Deployment History overlay.
3. Overlay: backdrop (click-to-close) + centered card; header with the title (`footer.deploymentHistory`) and a close button; a list of `DEPLOYMENTS` rows ({version, date, title, environment, status, details}); clicking a row shows its detail (status + `details` as a check list) with a back button (`footer.back`); ESC closes.
4. `CURRENT_VERSION` const + `DEPLOYMENTS` array as the source — drop the `package.json` import.
5. Map htu.io's `--color-*` stripe/overlay tokens to uzorai's token names in `tokens.css` (add any missing).
6. Add `footer.deploymentHistory` and `footer.back` to en/es/ru/zh.
7. Add bottom padding to the layout so the fixed stripe never overlaps content.
8. Keep the existing content `Footer` line above the stripe; do not duplicate LanguagePicker/ThemeToggle into the stripe (they stay in the header).

Seed `DEPLOYMENTS` with uzorai's real release history (at minimum the current release, including the recent Russian-imperative i18n change) and set `CURRENT_VERSION` to the new release.

## Acceptance Criteria

- [ ] The footer is a fixed-bottom stripe pinned to the viewport, matching htu.io; page content is never hidden behind it (bottom padding present).
- [ ] The version label is a button; clicking opens the Deployment History overlay; ESC, backdrop click, and the close button all dismiss it.
- [ ] The overlay lists `DEPLOYMENTS` (title, version, date); clicking a row shows its detail (status + details bullets) with a working back button.
- [ ] Version and history come from `CURRENT_VERSION` + `DEPLOYMENTS`; the `package.json` version import is removed.
- [ ] `footer.deploymentHistory` and `footer.back` exist in en/es/ru/zh and render in each.
- [ ] LanguagePicker/ThemeToggle are not duplicated; they remain in the header; the content Footer line is preserved.
- [ ] Build green (`tsc --noEmit` plus `vite build`); the no-translate guard is unaffected.

## Game Theory Cooperative Model review

A clickable, legible release history is a cooperative signal between the platform and its visitors: a governance product showing its own change log builds trust, and reusing htu.io's exact module keeps one pattern across sites rather than diverging implementations each owner must maintain.

### Who benefits

Visitors get a transparent, clickable release history — a trust signal fitting a governance platform. The operator gets the same mature module htu.io already runs, so there is one footer pattern across sites and less divergence to maintain. Future sites inherit a proven port. No party is worse off; the stripe adds a control without removing the header's existing ones.

### Abuse vector

The `DEPLOYMENTS` array is author-maintained static content rendered in an overlay; the only surface is the change-log text itself, which is committed code reviewed in the PR — no user input and no remote fetch. Because the overlay renders trusted strings rather than HTML, there is no injection path, and the chief residual risk is a stale or inaccurate change-log entry presented to visitors as fact.

### Mitigation

Defense in depth: entries live in version control under the same review as the code they describe (no entry ships without PR review); the overlay renders text only, never HTML, closing the injection path; and ESC, backdrop click, and the close button all dismiss it, so it cannot trap focus. There is no remote fetch and no user input, so the surface stays bounded to reviewed, committed content.

## Subject Migration Summary

| Subject | From | To | Notes |
|---|---|---|---|
| Version source | package.json build-inline | `CURRENT_VERSION` const + `DEPLOYMENTS` array | Carries per-release metadata |
| Footer position | Normal document flow | Fixed-bottom stripe | Matches htu.io |
| Version label | Static text | Clickable button opening the Deployment History overlay | Ported module |
| Superseded work | BUG #55 / PR #56 | This FEAT | #55 and #56 closed in favour of this |
| Open questions | Move Language/Theme into the stripe like htu.io, or keep them in uzorai's header? | Resolve at implementation | Default: keep in the header, no duplication |

## Files created / updated

```
src/client/components/VersionFooter.tsx   # rewrite: fixed stripe + clickable version + Deployment History overlay + CURRENT_VERSION/DEPLOYMENTS
src/client/App.tsx                        # bottom padding so the fixed stripe never overlaps content
src/client/brand/tokens.css               # map/add htu.io --color-* stripe/overlay tokens to uzorai tokens
src/client/i18n/en.json                   # add footer.deploymentHistory + footer.back
src/client/i18n/es.json                   # same keys
src/client/i18n/ru.json                   # same keys
src/client/i18n/zh.json                   # same keys
```

## Models Applied

- #1 Game Theory Cooperative — declared + detected via the `### Abuse vector`, `### Mitigation`, and `### Who benefits` subsections and the cooperative-transparency framing.
- #2 Decision Tree — declared + detected via the Options/Chosen/Why table and the `### Trigger for change` subsection.
- #11 Progressive Disclosure — declared + detected via the complexity-gated overlay (collapsed version stamp, then release list, then per-release detail), surfacing detail only on demand.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review and approve spec | 5 min |
| Remove needs-approval label (gate) | 2 min |
| Approve and human_merge PR | 5 min |
| Total | 12 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw implementation run | ~15 min |
| Review, merge, deploy | ~10 min |
| Total | ~25 min |

### Assumptions

- ZiLin-Dev grounds against a freshly pulled tree and reads htu.io's `foundation/components/VersionFooter.jsx` as the reference.
- uzorai's header already hosts LanguagePicker/ThemeToggle, so the stripe carries only the version button.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Active operator time | 12 min | TBD | TBD |
| Wall-clock time | 25 min | TBD | TBD |

## Legal triggers

None.

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-06-18T05:28:58.190Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). Path A did not
  genuinely resolve: the `_Source:_` footer names `2026-05-09__feat__inline.md`,
  but the matching `issues/2026-05-09__feat__inline.scored.md` already holds a
  **different** spec (the i18n FEAT materialized for issue #31), and the
  `-v2`…`-v5` variants hold the Theme/Nav/site-i18n/canonical-host FEATs — none
  is this VersionFooter spec. That is a generic-filename collision, not a content
  match, so the GitHub issue #57 body was authoritative and is materialized here
  verbatim under the next free collision suffix (`-v6`).
- **Source issue:** UzorAI/uzorai.com#57 — "FEAT: port htu.io VersionFooter —
  sticky stripe, clickable version, Deployment History" (created
  2026-06-18T05:28:58Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=feat) on the acquired
  body → 10/10 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** FEAT → HOLD. Headless run (implw runner; spec staged to the temp
  file `/tmp/implw-spec-57-0eHX.md` and passed as an argument; stdin is not a
  TTY). The `needs-approval` label was absent on issue #57, so the HOLD cleared
  as solo-operator approved via the `label-absent` channel (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #57 on branch
  `htu/port-versionfooter-deployment-history-57`; committed with the
  implementation PR.
