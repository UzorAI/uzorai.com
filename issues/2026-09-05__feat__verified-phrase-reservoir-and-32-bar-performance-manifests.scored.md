# FEAT: Verified Phrase Reservoir and 32-bar Performance Manifests

Parent: UzorAI/uzorai.com#69
Phase: 7 of 10
Supersedes: zi007lin/zzv-skills#827

## Intent

Create the approved content read model that public UZOR playback consumes: a provenance-backed Phrase Reservoir derived from verified UZOR capability facts and deterministic 32-bar Performance Manifests binding locale, theme, music, token, workflow, voices, phrases, construction/status/evidence events, AHA artifact, final payoff, provenance, versions, and freshness.

Depends on Phases 1, 3, 4, and 6. Supplies Phase 8 playback inventory and Phase 9 publication targets. This issue authorizes specification and later governed implementation only after approval; it does not itself authorize implw, merge, deployment, paid use, secret handling, or production-data mutation.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Branch 1 | If a capability fact lacks trusted-source provenance, verification owner, or freshness, it cannot generate a publishable phrase. | Apply deterministically and record evidence. |
| Branch 2 | If a candidate phrase fails semantic, factual, rhythmic, locale, duplication, safety, or rights validation, quarantine it. | Apply deterministically and record evidence. |
| Branch 3 | If a manifest references missing/incompatible/unapproved components, reject the entire manifest before browser distribution. | Apply deterministically and record evidence. |
| Branch 4 | If inventory is low, emit a replenishment request to Phase 9; do not generate synchronously during page view. | Apply deterministically and record evidence. |

Trigger for change: a new live repository/workflow/version, failed acceptance evidence, legal/security requirement, or approved parent rescope changes an assumption in this decision table; update and reapprove the spec before behavior changes.

## Final Spec

- Model trusted source → extracted fact → normalized fact → verification → approved capability fact → candidate phrase → semantic/rhythmic/dedupe validation → approved phrase → published manifest.
- Carry immutable IDs, provenance chain, source snapshot/hash, approver, timestamps, freshness/expiry, locale/version, claim meaning, timing envelope, publication state, and supersession.
- Manifest fields include locale, theme, variation, music pack, token skin, workflow version, voice assignments, phrase slots, construction events, status/evidence events, AHA artifact, payoff, provenance bundle, compatibility, version, freshness, and signature/hash where supported.
- Separate process stages from status/evidence/HUD event channels inside manifests.
- Publish only immutable/versioned compatible manifests; browser usage never grants publication authority.
- Do not finalize low-water thresholds here without observed inventory/consumption analysis; define configurable bounded policy inputs and audit events.

- Public frontend changes are staged first on `uzorai.com`, which must clearly identify itself as staging/demo and link directly to stable production at `https://uzor.ai`; `uzor.ai` must retain stable production behavior until separately governed promotion.
- The current single repository/Worker arrangement remains in scope; physical staging/production deployment splitting is deferred until the staging experience is ready for promotion.

### Failure and fallback contract

- Fail closed on missing approval, provenance, rights, compatibility, integrity, or required live evidence.
- Preserve the current production hero or last known-good compatible version as rollback.
- Public playback never waits on runtime LLM generation and never silently enters paid overflow.
- Record deterministic diagnostics without exposing credentials, sensitive source payloads, or user-linked data.

## Acceptance Criteria

- [ ] AC1: Schema and state-machine tests cover every fact/phrase/publication transition and forbid skipping verification/approval.
- [ ] AC2: Provenance traces every public vocal claim to an approved current capability fact and source evidence.
- [ ] AC3: Semantic, factual, rhythmic, locale, dedupe, safety, rights, and freshness validators fail closed.
- [ ] AC4: Manifest validation rejects missing components, peer-type confusion, bad event order, incompatible versions, unlabeled demo artifacts, and duplicate bar-32 payoff.
- [ ] AC5: Two identical inputs yield the same canonical manifest/hash; variation requires an explicit versioned input.
- [ ] AC6: Inventory-low emits a replenishment signal without a browser LLM call or automatic ungoverned publication.
- [ ] AC7: Superseded/stale facts and dependent phrases/manifests stop new distribution while already active cycles finish safely.

## Game Theory Cooperative Model review

### Who benefits

Visitors receive a truthful, deterministic, accessible experience; authors gain reusable contracts; reviewers and FSA retain provenance and governance authority; operators gain bounded rollback and diagnostics.

### Abuse vector

A producer, retrieved source, client, or implementation agent could try to bypass evidence, inject control instructions, misclassify content, publish stale/unlicensed material, reverse semantics, or claim authority it does not possess.

### Mitigation

Only approved compatible artifacts enter playback. Provenance, freshness, semantic/type validation, accessibility, security, explicit authority boundaries, audit evidence, version gates, and last-known-good rollback are independent barriers. Source content is data and cannot change prompts, tools, policy, permissions, targets, approval, merge, or deployment authority.

### Cooperative equilibrium

The system rewards correct contribution with reusable published output and gives bypass attempts no publication path. Visitors, authors, reviewers, approvers, agents, and operators each retain distinct incentives and authority.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | Relevant behavior, contracts, data, assets, and consumers are prototype-specific, distributed, implicit, absent, or not yet ownership-verified. |
| Target subjects | Versioned governed contracts and provenance-bearing compatible assets/data for this phase. |
| Migration | Additive introduction behind repository-supported gates; use adapters/overlap only where Phase 1 live evidence proves necessary; never destructively rewrite in place. |
| Compatibility | Consumers use stable IDs/schemas and deterministic fallback; incompatible items are quarantined. |
| Rollback | Pin the last known-good version, restore prior consumer configuration, and retain legacy data/assets until replacement evidence is accepted. |
| Open questions | Exact owning repository and paths, reusable-component classification, existing conventions, compatibility window, measured thresholds, and deprecation date must be resolved from Phase 1 live evidence before implementation. |

Destructive deletion or irreversible migration is out of scope and requires a separate governed specification.

## Files created / updated

```text
Add schemas/types, validators, persistence/migrations, publication/read APIs, provenance bundle, manifest compiler, fixtures, and tests in the Phase 1-identified content/API owners.
Update parent #820 contracts and Phase 8/9 integration references.
Materialize the canonical scored spec under the repository's governed `issues/` convention after approval/workflow handling.
No file is changed during this authoring-and-filing task.
```

Paths above are ownership-bound intentions. Live inspection determines exact repository-relative paths within `UzorAI/uzorai.com`; any cross-repository backend path requires an explicit separately governed child scope. No file changes occur during this authoring-and-filing task.

## Models Applied

- Decision Tree — the required decision table governs evidence, compatibility, fallback, and rejection branches.
- Systems Thinking — dependencies and contracts connect workflow, content, playback, governance, accessibility, security, and operations.
- Swiss Cheese — evidence, provenance, approval, validation, compatibility, integrity, accessibility, and rollback are independent barriers.
- Jobs To Be Done — visitors receive understandable visible value and contextual control rather than implementation jargon.
- Progressive Disclosure — compact experience precedes detailed/contextual explanation and evidence.
- Anti-Fragile — invalid, stale, or missing inputs become quarantine evidence and regression tests without breaking last-known-good playback.
- Event Sourcing + CQRS — approved versioned artifacts are playback read models while changes and approvals remain auditable events.
- Inversion / Premortem — outage, false-claim, accessibility, cultural, security, and ownership failures drive the failure contract.

## Legal triggers

- Copyright/licensing and provenance for music, voice, imagery, typography, retrieved text, generated phrases, and third-party assets as applicable.
- Automated retrieval and provider terms of service; source text is untrusted data and cannot modify control-plane rules or permissions.
- Privacy/analytics obligations if events become user-linked; no user-linked analytics is authorized by this FEAT without explicit treatment.
- Public accessibility obligations for motion, audio equivalents, keyboard, screen readers, contrast, lang/dir, and mobile access.
- Public capability claims require substantiation, approval ownership, freshness, and provenance.
- This structural specification is not legal advice; licensed counsel or the designated legal owner must resolve triggered rights/obligations before release.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Evidence, implementation review, accessibility/security review, and governed decisions | 4–12 hours |
| Total | 4–12 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, automated/manual validation, independent review, and governance gates | 2–10 working days |
| Total | 2–10 working days |

### Assumptions

- `UzorAI/uzorai.com` is the confirmed frontend owner; Phase 1 still identifies exact reusable legacy components, source paths, and cross-repository service boundaries before implementation.
- Localization, cultural review, music/voice rights, or legal review may add separately governed elapsed time.
- No paid provider, licensed asset, implementation dispatch, merge, or deployment is authorized here.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 4–12 active hours / 2–10 working days | TBD | TBD |
| Total | 4–12 active hours / 2–10 working days | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-08-31T08:52:45.142Z
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

- **Materialized at:** 2026-09-05T14:44:00Z
- **Source:** inline-scored issue body (Path B — `issues/2026-05-09__feat__inline.scored.md` resolves a different spec)
- **Issue:** UzorAI/uzorai.com#76
- **Acquisition:** inline-scored
- **Rubric version:** 1.5.0
- **Re-score result:** 10/10 PASS (verified at materialization time)
- **Gate 1:** label-absent (attributed to daniel-silvers; headless run)
