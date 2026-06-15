# FEAT: canonical-host guard against the translate.goog proxy

## Intent

uzorai.com already denies client-side translation (`<html translate="no">` + `meta notranslate`, with a build guard). That stops Chrome's inline translate, but Google's server-side translation proxy can still fetch the origin and re-serve the page under `*.translate.goog`. Now that the site ships first-party i18n (en/es/ru/zh), a third-party-translated mirror is both off-brand for a governed, auditable platform and a worse experience than the in-app picker. Add a tiny pre-paint canonical-host guard to `index.html`: when the page is served under a `.translate.goog` host, redirect to the canonical `uzorai.com` (path preserved), so visitors land on the real domain and use the first-party language picker. Directives and layout unchanged.

## Decision Tree

| Decision | Options | Chosen | Why |
|---|---|---|---|
| Mechanism | Worker edge block vs client-side host guard | client-side host guard | translate.goog fetches the origin server-side from Google IPs — the edge can't reliably distinguish it from Googlebot, and UA/IP blocking is fragile and risks blocking legitimate crawlers |
| Action on a proxy host | banner-only vs top-level redirect | top-level redirect to the canonical origin, path/query/hash preserved | the site ships first-party i18n; visitors should use the in-app picker on the real domain, not a machine-translated mirror |
| Trigger condition | any non-canonical host vs only known translate-proxy hosts | only hosts whose name ends with `.translate.goog` | avoids breaking `localhost`, `*.workers.dev` previews, and the canonical host; targeted and loop-free |
| Placement | `main.tsx` vs inline pre-paint in `index.html` `<head>` | inline pre-paint in `index.html` | runs before the SPA paints (no flash of proxied content) and sits beside the existing translate=no directives |

### Trigger for change

If Google changes the proxy host suffix, or another server-side translation proxy appears, extend the host-suffix match list in the guard.

## Final Spec

Add a small inline script to `index.html` `<head>`, before the SPA bundle and alongside the existing pre-paint theme script, that reads `location.hostname`. If it ends with `.translate.goog`, call `location.replace('https://uzorai.com' + location.pathname + location.search + location.hash)`. The check fires only on the `.translate.goog` suffix, so the canonical host, `localhost`, and `*.workers.dev` preview hosts never match — there is no redirect loop and no dev/preview breakage. The existing `<html translate="no">` and `meta notranslate` directives are left untouched (the no-translate build guard must stay green). No layout, routing, or component change.

## Acceptance Criteria

- [ ] `index.html` contains a pre-paint script that, when `location.hostname` ends with `.translate.goog`, runs `location.replace` to `https://uzorai.com` + the current path + query + hash.
- [ ] The guard does NOT fire on the canonical host, `localhost`, or `*.workers.dev` (no redirect loop, no dev/preview breakage).
- [ ] The existing `translate="no"` / `meta notranslate` directives remain present (no-translate build guard stays green).
- [ ] The script runs before the SPA bundle (pre-paint), so no proxied content flashes before the redirect.
- [ ] `npm run build` passes (no-translate guard + tsc + vite).

## Game Theory Cooperative Model review

### Who benefits

Visitors land on the canonical, governed site with the real language picker instead of a third-party-translated mirror, so they get the curated en/es/ru/zh copy. The brand keeps its integrity and the auditable-control-plane positioning; the site owner keeps control of how the product reads in every language.

### Abuse vector

An over-broad host check could redirect legitimate preview/localhost hosts (breaking development) or, if it matched the canonical host, cause an infinite redirect loop.

### Mitigation

The guard fires ONLY on the `.translate.goog` suffix — the canonical host, `localhost`, and `*.workers.dev` never match, so there is no loop and no dev breakage. It uses `location.replace` (no history pollution) and preserves path/query/hash. The change is one inline script, trivially reverted.

## Subject Migration Summary

| Subject | From | To | Notes |
|---|---|---|---|
| Third-party translation defense | client `translate=no` + `meta notranslate` (stops Chrome translate; proxy may still serve) | + canonical-host guard (stops the translate.goog proxy serving) | layered defense |
| `index.html` | translate=no directives + theme pre-paint script | + canonical-host guard pre-paint script | directives unchanged |
| Open questions | — | Hard redirect vs a "view the original" banner — chosen the redirect for the governed-platform stance; revisit if it harms accessibility for visitors who genuinely rely on machine translation and cannot read the four shipped locales. | — |

## Files created / updated

```
src/client/index.html   (UPDATED - add pre-paint canonical-host guard script; translate=no / notranslate directives unchanged)
```

## Models Applied

- **#1 Game Theory Cooperative** — applied in the `## Game Theory Cooperative Model review` section above with explicit `### Who benefits`, `### Abuse vector`, and `### Mitigation` subsections.
- **#2 Decision Tree** — applied in the `## Decision Tree` section above: a markdown table of Decision / Options / Chosen / Why plus a `### Trigger for change` subsection.

## Legal triggers

None. First-party client-side navigation guard on the operator's own domain. No contracts, certification claims, PII/PHI/PAN, licensing, or third-party terms. (An accessibility consideration for machine-translation-reliant visitors is noted in Open questions, not a legal trigger.)

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Clear needs-approval + dispatch implw | 3 min |
| Review implw PR | 6 min |
| Approve + human_merge | 4 min |
| Verify (deploy is push-to-main) | 4 min |
| Total | 17 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run (single index.html edit) | 7 min |
| CI deploy | 3 min |
| Total | 10 min |

### Assumptions

- uzorai.com is implw-onboarded; the `needs-approval` gate is now live (labels apply after BUG #165 + the PAT Issues:write grant).
- Google's server-side translation proxy continues to serve under the `.translate.goog` host suffix.
- The inline guard is exempt from / compatible with the no-translate build assertion (it adds a script; it does not remove the directives).

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 7 min | TBD | TBD |
| Review + merge | 10 min | TBD | TBD |
| Deploy + verify | 4 min | TBD | TBD |
| Total | 21 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-06-15T14:12:59.308Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). The `_Source:_`
  footer (`2026-05-09__feat__inline.md`) is a non-unique legacy filename: the
  matching `issues/2026-05-09__feat__inline.scored.md` already holds a *different*
  spec (the i18n EPIC #29 Phase B, issue #31), as do `-v2` (Theme, #30), `-v3`
  (Navigation shell), and `-v4` (site-wide i18n, #43). None resolved to issue #47's
  canonical-host guard, so Path A did not resolve and the GitHub issue body was
  authoritative; it is materialized here verbatim, suffixed `-v5` per the collision
  rule (§4.2).
- **Source issue:** UzorAI/uzorai.com#47 — "FEAT: canonical-host guard against the
  translate.goog proxy" (created 2026-06-15T14:12:59Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=feat) on the acquired body →
  10/10 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** FEAT → HOLD. Headless run (implw runner; spec staged to a temp file and
  passed as an argument). The `needs-approval` label was absent on issue #47, so the
  HOLD cleared as solo-operator approved via the `label-absent` channel (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #47 on branch
  `htu/canonical-host-guard-translate-goog-47`; committed with the implementation PR.
