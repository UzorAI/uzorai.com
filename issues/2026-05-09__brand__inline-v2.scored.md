# BRAND: replace the footer Cyrillic etymology line with the technology-pattern tagline

## Intent

The footer carries a second Cyrillic instance the meaning-strip fix (BRAND #38) did not reach — `узор — the pattern beneath orchestration, governance, and execution.` hardcoded in `Footer.tsx`, plus a code comment glossing the Russian root of the brand name. This is the same off-positioning #38 removed from the hero strip: a Russian-language etymology on a governed-AI platform that denies third-party translation and ships its own i18n. Replace the Cyrillic with the `UZOR` mark while preserving the line's cadence — "the pattern beneath orchestration, governance, and execution" deliberately echoes the adjacent "Orchestrate. Govern. Execute." copyright — so the footer reads as a technology pattern consistent with the strip's `UZOR · THE PATTERN`. No Cyrillic anywhere in `Footer.tsx`, rendered text or comments. Text-only; layout unchanged.

## Jobs To Be Done

- As a visitor scanning the footer, I want a one-line essence of UZOR that echoes the product's three verbs, not a foreign-language vocabulary note.
- As a brand steward, I want every homepage instance of the Cyrillic etymology gone — the #38 strip fix left this second copy live in the footer.
- As a developer reading the source, I want the misleading "Russian root of the brand" comment removed so the code matches the shipped positioning.

## Design Rationale

The footer keeps its exact structure — a low-emphasis mono line on the left, the copyright span on the right, on the surface band above a hairline border. Only the text changes: `узор` becomes `UZOR`, preserving the "the pattern beneath orchestration, governance, and execution" cadence that rhymes with the neighbouring "Orchestrate. Govern. Execute." copyright. The code comment that frames узор as the Russian brand root is replaced with a neutral one-line description. No layout, spacing, token, or color change.

### Interaction of Color

Unchanged. The footer line stays `--muted` mono text on the `--surface` band above the `--slate-700` hairline, paired with the equally muted copyright span — a deliberately quiet, secondary register subordinate to the page body. The reframed text reuses the identical token; no new colors, no contrast or emphasis change.

## Acceptance Criteria

- [ ] The `Footer.tsx` rendered tagline reads `UZOR — the pattern beneath orchestration, governance, and execution.` with no Cyrillic.
- [ ] The `Footer.tsx` code comment no longer references the Russian word or root; it neutrally describes the line.
- [ ] No Cyrillic appears anywhere in `Footer.tsx` (rendered text or comments).
- [ ] The footer layout, tokens, and colors are unchanged (text-only); the copyright span is untouched.
- [ ] `npm run build` passes (no-translate guard + tsc + vite).

## Assets / Files

```
src/client/components/Footer.tsx   (UPDATED - rendered "узор —" -> "UZOR —"; replace the Russian-root code comment with a neutral description)
```

Exact rendered copy for the footer line:

```
UZOR — the pattern beneath orchestration, governance, and execution.
```

## Legal triggers

None. First-party footer copy. No contracts, certification claims, PII/PHI/PAN, licensing, or third-party terms. "UZOR" is the operator's own brand mark.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review BRAND spec + implw PR | 8 min |
| Approve + human_merge | 4 min |
| Deploy + verify | 3 min |
| Total | 15 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run (edit Footer.tsx) | 8 min |
| CI deploy | 3 min |
| Total | 11 min |

### Assumptions

- uzorai.com is implw-onboarded (verified this session).
- The footer line is not i18n'd (hardcoded in `Footer.tsx`); no dictionary changes are needed.
- `index.html` is untouched; the no-translate guard stays green.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 8 min | TBD | TBD |
| Review + merge | 12 min | TBD | TBD |
| Deploy + verify | 3 min | TBD | TBD |
| Total | 23 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** brand
- **Evaluated at:** 2026-06-15T06:10:03.527Z
- **Score:** 7/7
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| jobs_to_be_done | PASS |
| design_rationale | PASS |
| acceptance_criteria | PASS |
| assets_files | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__brand__inline.md_

---

## Provenance (auto-materialized)

- **Acquisition path:** Path B — inline-scored issue body (MCP). The `_Source:_`
  footer name (`2026-05-09__brand__inline.md`) collides with the file already
  materialized for issue #38 (`issues/2026-05-09__brand__inline.scored.md`),
  whose content is a *different* BRAND spec (the Home.tsx etymology strip). No
  file-uploaded spec for issue #40 resolved, so the GitHub issue body was
  authoritative and is materialized here verbatim under a `-v2` collision suffix
  (§4.2).
- **Source issue:** UzorAI/uzorai.com#40 — "BRAND: replace the footer Cyrillic
  etymology line with the technology-pattern tagline" (created 2026-06-15T06:10:03Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=brand) on the acquired body →
  7/7 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** BRAND → HOLD. Headless run (implw runner; spec staged to a temp file and
  passed as an argument). The `needs-approval` label was absent on issue #40, so the
  HOLD cleared as solo-operator approved via the `label-absent` channel (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #40 on branch
  `htu/footer-cyrillic-technology-pattern-40`; committed with the implementation PR.
