# FEAT: UZOR Locale Experience Pack foundation

Parent: UzorAI/uzorai.com#69
Phase: 5A of 10
Supersedes the implementation scope of #74 while preserving its cultural-review goals as follow-up work.

## Intent

Ship the deterministic, code-only foundation for Locale Experience Packs. This slice defines and validates the pack contract, provides the reviewed English baseline, and registers all eight launch locales. Locales without separately approved cultural assets explicitly inherit the baseline while retaining localized text. No music, imagery, font binary, generated media, paid provider, secret, deployment, or production-data mutation is authorized.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Pack changes workflow, token silhouette, 8/16/32 timing, construction metaphor, or interaction model | Reject validation | Canonical UZOR identity remains invariant |
| Pack lacks rights, provenance, approval, compatibility, or integrity metadata | Reject validation | It cannot become publishable |
| Locale has no independently reviewed cultural assets | Resolve to the English baseline with that locale's existing text | Launch remains deterministic and culturally conservative |
| Pack references a remote, unsafe, or unowned asset | Reject validation | No runtime fetch or unlicensed content ships |
| A future reviewed locale pack is approved | Add it in a child issue and bump only that pack version | Foundation and other locales remain stable |

Trigger for change: approved cultural evidence, a versioned canonical workflow/clock contract, or failed accessibility/security evidence requires a separately scored change.

## Final Spec

- Add a TypeScript Locale Experience Pack contract with stable pack IDs and independent semantic versions.
- Encode immutable compatibility with the current workflow model, performance clock, voice/cadence contract, and manifest schema.
- Add a pure validator returning deterministic reason codes for invariant changes, missing compatibility, missing rights/provenance/approval, unsafe asset references, duplicate locale IDs, and invalid fallback targets.
- Add one English Robo Tech Rap baseline expressed only as repository-owned design tokens and descriptive arrangement metadata; introduce no binary assets.
- Register en, es, ru, zh, ar, he, fr, and uk. English resolves directly to the baseline. The other seven manifests use explicit `baseline-with-localized-text` fallback until a child issue supplies independently reviewed cultural content.
- Add a compatibility matrix and documentation for versioning, cultural/brand review, rights/provenance, accessibility, and rollback.
- Add tests covering valid resolution, every rejection class, all eight locales, RTL metadata for ar/he, canonical invariant preservation, safe fallback, and offline/no-remote-asset behavior.
- Do not change public UI rendering in this foundation slice. Runtime consumption and culturally adapted assets are separate child issues.

### Failure and fallback contract

Invalid, missing, stale, incompatible, or unapproved packs resolve to the last known-good English baseline while preserving existing localized text. Validation is fail-closed and diagnostic. Resolution never performs network access or runtime generation.

## Acceptance Criteria

- [ ] AC1: A versioned schema and pure validator reject invariant changes, missing compatibility, missing rights/provenance/approval, unsafe references, duplicate locales, and invalid fallbacks.
- [ ] AC2: Exactly eight launch locale registrations exist; en uses the baseline and es/ru/zh/ar/he/fr/uk explicitly use documented baseline fallback.
- [ ] AC3: Resolution is deterministic, offline, and preserves localized text; invalid packs select the last known-good baseline.
- [ ] AC4: Compatibility pins the current workflow and 32-bar clock contracts without changing either source contract.
- [ ] AC5: Tests prove ar/he remain RTL metadata consumers and canonical workflow order is never reversed.
- [ ] AC6: No binary, remote, paid, generated, artist-imitating, political, religious, stereotyped, or unprovenanced asset ships.
- [ ] AC7: Documentation defines the child-review path and rollback by pinning a prior pack version.
- [ ] AC8: Full repository tests and build pass; existing rendered output is unchanged.

## Game Theory Cooperative Model review

### Who benefits

Visitors retain stable localized UI; implementers gain a reusable contract; cultural reviewers can approve one locale at a time; operators gain deterministic fallback and rollback.

### Abuse vector

An author could label stereotypes or unlicensed media as cultural adaptation, weaken invariants, or use remote/runtime generation to bypass review.

### Mitigation

The foundation accepts only local provenance-bearing metadata, rejects invariant changes and unsafe references, and publishes only the conservative baseline until independent child review exists.

### Cooperative equilibrium

Useful reviewed adaptations can advance independently, while rushing unsafe content gains no publication path and cannot destabilize existing locales.

## Subject Migration Summary

| Field | Before | After |
|---|---|---|
| Pack contract | Implicit/absent | Versioned TypeScript schema and validator |
| Launch locales | Text dictionaries only | Eight registrations with deterministic baseline resolution |
| Cultural assets | Unresolved | Explicitly deferred to reviewed child issues |
| Failure behavior | Undefined | Last-known-good baseline plus localized text |
| Runtime UI | Existing experience | Unchanged |
| Rollback | Ad hoc | Pin prior compatible pack version |
| Open questions | Which locale-specific cultural treatments and assets will pass independent review? | Deferred to separately scored child issues; no unresolved choice affects this foundation slice |

## Files created / updated

```text
Add: src/client/experience-packs/schema.ts
Add: src/client/experience-packs/packs.ts
Add: src/client/experience-packs/resolve.ts
Add: test/locale-experience-packs.test.mjs
Add: docs/locale-experience-packs.md
Add: issues/<collision-safe-feat-name>.scored.md
Update: package.json only if needed to include the new test
```

## Models Applied

- Decision Tree — deterministic validation, fallback, and future-change branches.
- Systems Thinking — compatibility connects locale, workflow, clock, accessibility, provenance, and rollback contracts.
- Swiss Cheese — schema, provenance, approval, compatibility, safe-reference, and test gates are independent barriers.
- Anti-Fragile — rejected packs become diagnostics while the last-known-good baseline continues serving.
- Inversion / Premortem — prevents runtime generation, remote assets, invariant drift, and cultural claims without review.

## Legal triggers

This slice ships no third-party media or cultural claims. Future child packs containing music, imagery, fonts, voices, or culturally specific treatments require recorded ownership/license provenance and designated cultural/brand approval before publication. This is not legal advice.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Contract, manifests, tests, documentation, review | 3–6 hours |
| Total | 3–6 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation and independent PR review | 1–2 working days |
| Total | 1–2 working days |

### Assumptions

- EPIC #108 is complete and all eight text locales are on main.
- Existing workflow model and 32-bar performance contracts remain authoritative.
- English baseline metadata uses only repository-owned tokens and descriptive text.
- Cultural assets and runtime UI integration require separately approved child issues.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 3–6 hours / 1–2 working days | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-05T05:32:18.841Z
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

_Source: 2026-09-05__feat__locale-experience-pack-foundation.md_

## Provenance (auto-materialized)

- **Source:** inline-scored issue body — UzorAI/uzorai.com#123.
- **Materialized at:** 2026-09-05T05:45:50.648286+00:00
- **Filename derivation:** source-footer (§4.1 rule 1).
- **Acquisition path:** MCP → GitHub Issue → implw acquisition.
- **Integrity re-score:** 10/10 PASS, feat, rubric 1.5.0; matches stored score.
- **Gate 1:** label-absent (headless; attributed to daniel-silvers). PR review remains required to merge.
- **Command reference:** docs/IMPLW_FLOW.md is absent locally; canonical zi007lin/htu-foundation version was read for acquisition and PR formatting.
