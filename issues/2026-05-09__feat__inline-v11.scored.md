# FEAT: Browser performance inventory and offline-resilient playback

Parent: UzorAI/uzorai.com#69
Phase: 8 of 10
Supersedes: zi007lin/zzv-skills#828

## Intent

Create resilient browser-side inventory so UZOR GO begins from approved pre-generated content, maintains several complete future cycles where practical, and never depends on a live LLM. Keep only small preferences/state in localStorage and use the owning repository's established IndexedDB/Dexie convention—if present—for phrases, manifests, metadata, usage, expiry, versions, and provenance references.

Depends on Phase 7 published manifests; integrates Phases 2–6 playback and Phase 10 accessibility/observability. This issue authorizes specification and later governed implementation only after approval; it does not itself authorize implw, merge, deployment, paid use, secret handling, or production-data mutation.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Branch 1 | If Phase 1 finds an existing IndexedDB abstraction, reuse it; otherwise choose the smallest governed IndexedDB wrapper and document why. | Apply deterministically and record evidence. |
| Branch 2 | If a cached manifest is valid, approved, fresh, compatible, and complete, it may play; otherwise quarantine/evict and select another. | Apply deterministically and record evidence. |
| Branch 3 | If network fails mid-cycle, finish from the active immutable snapshot; if cache is empty and API is down, show a deterministic accessible fallback rather than partial performance. | Apply deterministically and record evidence. |
| Branch 4 | If storage quota is constrained, retain active/current and complete compatible cycles before optional variants; never store secrets. | Apply deterministically and record evidence. |

Trigger for change: a new live repository/workflow/version, failed acceptance evidence, legal/security requirement, or approved parent rescope changes an assumption in this decision table; update and reapprove the spec before behavior changes.

## Final Spec

- localStorage is limited to locale, sound preference, voice mode, last sequence, and active manifest/version pointers or equivalent small state.
- IndexedDB/Dexie stores substantial approved phrase/manifest inventory, metadata, usage, expiry/version data, and provenance references with schema migration/versioning.
- UZOR GO selects a complete compatible manifest atomically and snapshots the active cycle so network/cache mutation cannot break it.
- Implement validation, integrity/hash checks where supported, cache poisoning defenses, safe version migration, TTL/freshness, quota handling, replenishment hints, and deterministic eviction.
- Support offline current-cycle completion, several future cycles where practical, content API down, empty cache + API down, and stale/incompatible inventory.
- Browser holds no provider, signing, repository, or publication secrets and cannot promote cached content to approved status.

- Public frontend changes are staged first on `uzorai.com`, which must clearly identify itself as staging/demo and link directly to stable production at `https://uzor.ai`; `uzor.ai` must retain stable production behavior until separately governed promotion.
- The current single repository/Worker arrangement remains in scope; physical staging/production deployment splitting is deferred until the staging experience is ready for promotion.

### Failure and fallback contract

- Fail closed on missing approval, provenance, rights, compatibility, integrity, or required live evidence.
- Preserve the current production hero or last known-good compatible version as rollback.
- Public playback never waits on runtime LLM generation and never silently enters paid overflow.
- Record deterministic diagnostics without exposing credentials, sensitive source payloads, or user-linked data.

## Acceptance Criteria

- [ ] AC1: A storage audit proves only approved small state is in localStorage and no substantial reservoir or secret is stored there.
- [ ] AC2: IndexedDB schema/version migrations preserve or safely invalidate compatible inventory.
- [ ] AC3: UZOR GO reaches a playable cached cycle without any live LLM request.
- [ ] AC4: Network loss at every bar boundary leaves the active cycle complete, ordered, and accessible.
- [ ] AC5: Malformed, tampered, stale, incompatible, partial, or poisoned manifests never enter playback.
- [ ] AC6: Quota/eviction tests retain active and complete cycles according to deterministic priority.
- [ ] AC7: Empty cache + content API down produces localized accessible fallback and recovery diagnostics without broken UI.
- [ ] AC8: Clearing cache/preferences is user-operable and does not affect server publication authority.

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
Update identified frontend storage/service-worker/data modules; add localStorage preference adapter, IndexedDB/Dexie schema, validation/integrity layer, atomic selector, eviction/migration logic, offline fixtures, and tests.
Exact paths follow Phase 1 repository conventions.
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
- **Evaluated at:** 2026-08-31T08:52:47.831Z
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

- **Source:** inline-scored issue body
- **Issue:** UzorAI/uzorai.com#77
- **Materialized:** 2026-09-06T00:00:00Z (implw run)
- **Collision suffix:** -v11
