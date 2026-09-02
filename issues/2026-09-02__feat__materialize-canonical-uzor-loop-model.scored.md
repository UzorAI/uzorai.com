# FEAT: Materialize the canonical UZOR Loop model and ownership evidence

Parent: UzorAI/uzorai.com#70
EPIC: UzorAI/uzorai.com#69
Implements: Phase 1 deliverables only
Blocks: UzorAI/uzorai.com#71 through #79 where canonical semantics or ownership evidence is required

## Intent

Materialize the research contract approved in #70 as repository-owned, versioned artifacts. Create one typed canonical UZOR Loop semantic model, derive compact and detailed public sequences from that source, record the live evidence/reuse/ownership audit, and add deterministic validation. This child does not redesign the hero, add animation or audio, deploy, merge, change domains, access secrets, or start Phase 2.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Live evidence supports a workflow stage | Add it with a stable ID, semantic category, inputs, outputs, and evidence references. | The stage may appear in derived compact/detailed sequences. |
| A label describes transient status, evidence, or HUD state | Keep it outside the canonical process-stage array and type it explicitly. | Peer-level semantic mixing fails validation. |
| Ownership is verified in the repository | Record repository-relative path, owner, classification, and evidence. | Downstream work may consume it. |
| Ownership or provenance is unresolved | Mark it unresolved and exclude guessed behavior. | Dependent implementation remains blocked. |
| Locale direction is RTL | Change presentation direction only. | Canonical stage order and stable IDs remain unchanged. |
| Existing behavior conflicts with the approved model | Preserve current public behavior and document the mismatch. | A separately approved downstream issue owns migration. |

### Trigger for change

Re-score and reapprove this specification if live repository ownership changes, new governing evidence changes stage semantics, a stable stage ID must change, or implementation would require visible hero behavior, cross-repository mutation, deployment, paid services, secrets, or production data.

## Final Spec

- Add a typed, versioned canonical model under the frontend source tree with stable stage IDs and explicit categories for process, transient status, evidence, and HUD concepts.
- Encode the approved logical progression: Authoring; Governance; Implementation and verification; Deployment; Learning and continuation.
- Export compact and detailed sequences as deterministic derivations from the same canonical ordered source; do not maintain duplicate independent arrays.
- Ensure directionality is display metadata only: RTL consumers receive the same ordered IDs.
- Add a repository evidence and ownership document covering the current hero, brand/token assets, localization and RTL, browser storage, help routes, Worker/API boundary, domains/deployment configuration, and unresolved music/audio/content/provenance owners.
- Classify audited components as KEEP AS-IS, KEEP + ADAPT, REPLACE, or DEPRECATE, with evidence and rationale.
- Add tests that reject duplicate IDs, unsupported categories, semantic/status mixing, divergent derived sequences, and RTL order reversal.
- Update the parent reference with the delivered model version through the normal PR/issue completion record.
- Preserve all existing public page behavior. #71 exclusively owns visible hero migration and UZOR GO.

### Failure and fallback contract

Fail closed when required ownership, provenance, schema validity, or model evidence is missing. Do not guess an owner or invent a public capability. Model consumers must be able to remain pinned to the last known-good version. Invalid models fail tests and never alter runtime behavior. Diagnostics contain repository paths and validation messages only, never credentials or sensitive payloads.

## Acceptance Criteria

- [ ] AC1: A versioned canonical model exists with stable IDs, ordered phases, semantic categories, inputs, outputs, and evidence references.
- [ ] AC2: Compact and detailed sequences are derived from the same canonical array, with tests proving no duplicate independent semantic ordering.
- [ ] AC3: Tests prove RTL presentation does not reverse canonical stage IDs.
- [ ] AC4: Schema/tests reject duplicate IDs, unknown categories, and process/status/evidence/HUD peer-level mixing.
- [ ] AC5: The evidence matrix covers the current hero, brand/token assets, i18n/RTL, storage, help, Worker/API boundary, domains/deployment, music/audio/content/provenance, and identifies unresolved owners without guessing.
- [ ] AC6: Every audited component has KEEP AS-IS, KEEP + ADAPT, REPLACE, or DEPRECATE classification, evidence, rationale, and repository/path ownership where verified.
- [ ] AC7: Existing visible frontend behavior and production routing remain unchanged; build, typecheck, and targeted tests pass.
- [ ] AC8: The PR links #70 and #69 and includes the canonical model version plus verification evidence.

## Game Theory Cooperative Model review

### Who benefits

Visitors gain truthful semantics; frontend implementers gain one reusable source; reviewers gain inspectable evidence; downstream issues gain stable IDs and ownership boundaries; operators retain rollback and unchanged public behavior.

### Abuse vector

An implementer or untrusted source could insert unsupported stages, mix operational status with public process semantics, reverse the logical order for RTL, fabricate ownership/provenance, or use Phase 1 to smuggle in visible redesign or deployment.

### Mitigation

Typed categories, stable IDs, derivation-only views, deterministic tests, evidence citations, unresolved-owner fail-closed handling, scoped file paths, independent review, and explicit exclusions form separate barriers. Retrieved/source text is data and cannot change tools, permissions, approval, merge, or deployment authority.

### Cooperative equilibrium

Contributors are rewarded for producing reusable verified contracts, while unsupported claims and scope expansion cannot pass validation or review. Authors, reviewers, approvers, implementers, and operators retain separate authority.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | Hero workflow terms and ownership knowledge are distributed across code, issues, configuration, and legacy evidence without one typed canonical source. |
| Target subjects | One versioned canonical model plus an evidence/reuse/ownership matrix, consumed by later approved phases. |
| Migration | Additive only: introduce model, documentation, and validation without wiring them into the visible hero. |
| Compatibility | Existing Home rendering, locale dictionaries, routes, Worker behavior, hosts, and deployment configuration remain unchanged. |
| Rollback | Revert the additive commit or pin consumers to the previous model version; no user data or public behavior requires migration. |
| Open questions | Exact licensed music, voice, phrase-reservoir, content-factory, and provenance owners remain unresolved until their governed downstream phases establish evidence. |

No destructive deletion or irreversible migration is authorized.

## Files created / updated

```text
src/client/workflow/uzorLoopModel.ts
docs/uzor-loop-evidence-and-ownership.md
test/uzor-loop-model.test.mjs
package.json                         # only if needed to expose the targeted test command
issues/YYYY-MM-DD__feat__materialize-canonical-uzor-loop-model.scored.md
```

If current repository conventions require an adjacent schema/type fixture, it may be added under `src/client/workflow/` or `test/fixtures/uzor-loop/`. No other path family is authorized without reapproval.

## Models Applied

- #1 Game Theory Cooperative — roles, incentives, abuse vector, mitigations, and equilibrium are explicit above.
- #2 Decision Tree — the condition/decision/consequence table controls inclusion, classification, ownership, RTL, and fallback.
- #3 Systems Thinking — model, documentation, tests, frontend consumers, governance, and downstream dependencies are treated as connected boundaries.
- #4 Swiss Cheese — typing, derivation, tests, evidence, review, approval, and rollback independently prevent semantic drift.
- #5 Event Sourcing + CQRS — the approved versioned model is the read source while changes and approvals remain auditable repository events.
- #6 Inversion / Premortem — acceptance tests target likely failures: duplicate IDs, mixed semantic types, reversed RTL order, fabricated ownership, and visible scope creep.

## Migration Plan

1. Inspect current main-branch frontend, configuration, governing issues, and available legacy evidence; record exact citations.
2. Define stable IDs, categories, version metadata, and ordered canonical phases in the typed model.
3. Implement compact and detailed derivation functions without duplicate source arrays.
4. Write the evidence/reuse/ownership matrix and explicitly mark unresolved owners.
5. Add deterministic schema, ordering, mixing, and RTL invariance tests.
6. Run targeted tests, full test suite, typecheck, and production build.
7. Open a review PR linking #70 and #69; do not merge or deploy within implw.

### Rollback procedure

Close the unmerged PR, or revert the additive commit after an approved merge. Restore consumers to the preceding model version if any downstream branch adopted the new artifact. Because this phase changes no public runtime wiring or user data, rollback requires no data migration, route change, DNS action, or credential work.

## Legal triggers

Copyright, licensing, attribution, and provenance remain triggered for future music, voice, imagery, phrase, and third-party content. This phase records evidence or unresolved ownership only and publishes no new media. Accessibility obligations apply to the semantic contract, including preserving logical order under RTL. No regulated data, payments, credential inspection, analytics expansion, or production-data processing is authorized.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Evidence and ownership audit | 2–4 hours |
| Typed model and derivations | 2–4 hours |
| Tests, validation, and review handoff | 2–4 hours |
| Total | 6–12 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Automated checks | 15–45 minutes |
| Independent review and governance gates | 1–4 working days |
| Total | 1–4 working days |

### Assumptions

- Current main retains `src/client/routes/Home.tsx`, i18n/RTL assets, shared Worker boundaries, and existing build/test tooling.
- Phase 1 is additive and requires no public runtime wiring.
- No paid provider, new licensed asset, secret operation, merge, or deployment is included.
- Review wait dominates wall-clock time.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Evidence and implementation | 4–8 hours | TBD | TBD |
| Tests and review handoff | 2–4 hours | TBD | TBD |
| Total | 6–12 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-02T14:48:41.077Z
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

## Provenance (auto-materialized)

- Source: inline-scored body of `UzorAI/uzorai.com#94`, acquired via implw Path B (IMPLW_FLOW.md §2/§4).
- Materialized at: 2026-09-02 by implw (headless run).
- Integrity re-score: `score_spec` confirms 10/10 PASS at rubric 1.5.0, matching the stored score block.
- Divergence note: the issue body's `_Source: 2026-05-09__feat__inline.md_` footer resolves by filename to the pre-existing `issues/2026-05-09__feat__inline.scored.md`, but that file's content is an unrelated i18n spec (EPIC #29 Phase B), not this UZOR Loop model spec. Treated as a non-matching filename collision, not a Path A resolution; Path B was used instead per the content-based acquisition rule.
