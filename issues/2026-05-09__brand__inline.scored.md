# BRAND: replace the UZOR etymology strip with a technology-pattern statement

## Intent

The homepage "meaning strip" glosses UZOR through its Russian etymology — `UZOR · узор — a woven pattern…` — printing a Cyrillic word as the brand's origin story. That is off-positioning for a governed-AI platform, and incongruous now that uzorai.com denies third-party translation (PR #27) and ships its own i18n. Reframe UZOR as a technology pattern: the disciplined way the platform coordinates agents, tools, and workflows, pointing to ZiLin skills from High Tech United for quality, security, and expansion. No Cyrillic in the default (English) view; the cube/weave mark and the strip's layout are unchanged. Text-only.

## Jobs To Be Done

- As a first-time visitor, I want one line that says what "UZOR" means in product terms, so I grasp the value without a vocabulary lesson.
- As an enterprise evaluator, I want the qualities that matter — quality, security, expansion — tied to a concrete substrate (ZiLin skills / High Tech United), so I know what I would actually adopt.
- As a brand steward, I want the homepage free of a literal foreign-language etymology that conflicts with the platform's no-third-party-translation stance.
- As a non-English visitor, I want this line localized through the site's own i18n like everything else, not pinned to one language.

## Design Rationale

The meaning strip keeps its role — a quiet, single-line definition sitting between the hero and the pillars — but its content shifts from linguistic etymology to an operating-pattern statement. The mono label drops the Cyrillic (`· узор`) and reads `UZOR · THE PATTERN`; the gloss reframes UZOR as how the platform runs and names the ZiLin / High Tech United substrate. Voice matches the hero's imperative cadence ("Orchestrate. Govern. Execute."). Typography, spacing, and the strip's translucent slate container are unchanged — only the label text and the `home.meaning.text` string change, in `Home.tsx` and the four locale dictionaries respectively.

### Interaction of Color

The strip's existing two-tone contrast pairing is preserved exactly: the mono label renders in `--accent` (aqua on the dark graphite strip, teal on light), the gloss in `--muted`, over the translucent `rgba(30,41,59,0.35)` slate band. The reframed copy reuses these same tokens — no new colors, no contrast change — so the strip stays a low-emphasis definition line, subordinate to the hero, with accent reserved for the single highlighted `UZOR` label.

## Acceptance Criteria

- [ ] The hardcoded mono label in `Home.tsx` no longer contains Cyrillic; it reads `UZOR · THE PATTERN`.
- [ ] `home.meaning.text` (en) reads the technology-pattern statement naming quality, security, and expansion plus ZiLin skills and High Tech United.
- [ ] `home.meaning.text` is updated in es / ru / zh to localized equivalents (ru is the Russian locale's own translation; the default/en render shows no Cyrillic).
- [ ] No Cyrillic appears anywhere in the default (English) homepage render.
- [ ] The strip's layout, tokens, and colors are unchanged (text-only change); the cube mark is untouched.
- [ ] `npm run build` passes (no-translate guard + tsc + vite).

## Assets / Files

```
src/client/routes/Home.tsx   (UPDATED - mono label "UZOR · узор" -> "UZOR · THE PATTERN"; update the "узор gloss" code comments to "UZOR pattern gloss")
src/client/i18n/en.json      (UPDATED - home.meaning.text -> technology-pattern statement, exact copy below)
src/client/i18n/es.json      (UPDATED - home.meaning.text -> Spanish localization of the new statement)
src/client/i18n/ru.json      (UPDATED - home.meaning.text -> Russian localization of the new statement)
src/client/i18n/zh.json      (UPDATED - home.meaning.text -> Chinese localization of the new statement)
```

Exact en copy for `home.meaning.text`:

```
UZOR is the pattern your AI runs on — every agent, tool, and workflow coordinated into one governed, auditable system. For quality, security, and expansion by design, build on ZiLin skills from High Tech United.
```

## Legal triggers

None. First-party marketing copy on the homepage. No contracts, certification claims, PII/PHI/PAN, licensing, or third-party terms. "High Tech United" and "ZiLin" are the operator's own brand names.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---|
| Review BRAND spec + implw PR | 10 min |
| Approve + human_merge | 5 min |
| Deploy + verify live | 5 min |
| Total | 20 min |

### Wall-clock time

| Wait dependency | Estimate |
|---|---|
| implw run (edit Home.tsx + 4 dicts) | 10 min |
| CI deploy | 3 min |
| Total | 13 min |

### Assumptions

- uzorai.com is implw-onboarded (verified this session).
- The es / ru / zh localizations are authored by the implw agent from the en source.
- The no-translate guard stays green — the strip is body content; `index.html` is untouched.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| implw run | 10 min | TBD | TBD |
| Review + merge | 15 min | TBD | TBD |
| Deploy + verify | 5 min | TBD | TBD |
| Total | 30 min | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** brand
- **Evaluated at:** 2026-06-15T05:29:14.792Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). No file-uploaded
  spec resolved from the `_Source:_` footer (`issues/2026-05-09__brand__inline.scored.md`
  did not exist prior to this run; `issues/` carried only FEAT and REFACTOR specs), so
  the GitHub issue body was authoritative and is materialized here verbatim.
- **Source issue:** UzorAI/uzorai.com#38 — "BRAND: replace the UZOR etymology strip
  with a technology-pattern statement" (created 2026-06-15T05:29:15Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=brand) on the acquired body →
  7/7 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** BRAND → HOLD. Headless run (implw runner; spec staged to a temp file and
  passed as an argument). The `needs-approval` label was absent on issue #38, so the
  HOLD cleared as solo-operator approved via the `label-absent` channel (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #38 on branch
  `htu/uzor-etymology-strip-technology-pattern-38`; committed with the implementation PR.
