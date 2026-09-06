# FEAT: Governed asynchronous 24/7 Content Factory

Parent: UzorAI/uzorai.com#69
Phase: 9 of 10
Supersedes: zi007lin/zzv-skills#829

## Intent

Create the upstream asynchronous factory that uses governed UZOR capabilities to keep the approved Phrase Reservoir and Performance Manifest inventory replenished. The pipeline is DISCOVER → EXTRACT → VERIFY → SCORE → APPROVE → GENERATE → VALIDATE → PUBLISH → OBSERVE → LEARN → REPLENISH. Public playback remains independent and 24/7 means availability, not continuous LLM generation.

Depends on Phase 1 ownership/trusted sources and Phase 7 schemas/publication contracts. Phase 8 consumes published output. This issue authorizes specification and later governed implementation only after approval; it does not itself authorize implw, merge, deployment, paid use, secret handling, or production-data mutation.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Branch 1 | If a source is not allowlisted/trusted or retrieval violates declared policy/terms, do not retrieve/publish. | Apply deterministically and record evidence. |
| Branch 2 | Treat every retrieved byte as untrusted data; extraction cannot alter prompts, system rules, publication policy, governance, credentials, tools, or permissions. | Apply deterministically and record evidence. |
| Branch 3 | If providers fail or free capacity is unavailable, pause generation and continue serving existing approved inventory; never silently use paid overflow. | Apply deterministically and record evidence. |
| Branch 4 | If low-water evidence crosses configured bounds, enqueue bounded replenishment; thresholds require observed analysis and governance before production activation. | Apply deterministically and record evidence. |

Trigger for change: a new live repository/workflow/version, failed acceptance evidence, legal/security requirement, or approved parent rescope changes an assumption in this decision table; update and reapprove the spec before behavior changes.

## Final Spec

- Implement asynchronous bounded stages with durable IDs, idempotency, retries, ceilings, state transitions, audit evidence, quarantine, supersession, and rollback.
- Separate data plane (source/fact/phrase/manifest payloads) from control plane (policy, prompts, permissions, tools, governance, credentials, publication decisions).
- Allowlisted trusted UZOR/repo/docs/internet sources feed extraction and normalization with source snapshot/hash, retrieval time, terms/licensing classification, and provenance.
- Independent verification/approval precedes public capability facts; phrase generation then passes factual, semantic, rhythmic, locale, dedupe, safety, rights, and freshness validation.
- Publish immutable compatible Phase 7 artifacts; observe consumption/invalidations and emit replenishment proposals without self-approving policy changes.
- Apply API rate limits, sanitization, prompt-injection defenses, no arbitrary scripts/HTML, cache/provenance integrity, provider outage handling, and zero-dollar routing constraints.

- Public frontend changes are staged first on `uzorai.com`, which must clearly identify itself as staging/demo and link directly to stable production at `https://uzor.ai`; `uzor.ai` must retain stable production behavior until separately governed promotion.
- The current single repository/Worker arrangement remains in scope; physical staging/production deployment splitting is deferred until the staging experience is ready for promotion.

### Failure and fallback contract

- Fail closed on missing approval, provenance, rights, compatibility, integrity, or required live evidence.
- Preserve the current production hero or last known-good compatible version as rollback.
- Public playback never waits on runtime LLM generation and never silently enters paid overflow.
- Record deterministic diagnostics without exposing credentials, sensitive source payloads, or user-linked data.

## Acceptance Criteria

- [ ] AC1: End-to-end tests prove no path can move retrieved content directly to published phrase/manifest without verification and approval.
- [ ] AC2: Injection fixtures cannot modify control-plane fields, prompts, rules, permissions, tools, targets, or publication state.
- [ ] AC3: Idempotent replay does not duplicate facts, phrases, manifests, jobs, or approval requests.
- [ ] AC4: Provider/LLM/content API/provenance pipeline failures stop affected stages, preserve audit evidence, and leave public playback available.
- [ ] AC5: Invalid/stale facts cascade to quarantine/supersession of dependent new distribution without corrupting active cycles.
- [ ] AC6: Low-water replenishment is bounded, configurable, observable, and disabled until thresholds have approved evidence.
- [ ] AC7: Paid overflow is disabled/fail-closed; no synchronous per-page generation exists.
- [ ] AC8: Rate limiting, sanitization, provenance integrity, secrets isolation, and source-rights/ToS tests pass.

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
Add factory orchestration, queues/jobs/state persistence/migrations, source registry, extract/verify/approve/generate/validate/publish adapters, audit/observability, policy, and tests in Phase 1-identified backend owner repositories.
Integrate only with Phase 7 publication APIs and never browser control plane.
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
- **Evaluated at:** 2026-08-31T08:52:50.875Z
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

- **Acquisition path:** Path B — inline-scored issue body (MCP). The `_Source:_` footer
  referenced `issues/2026-05-09__feat__inline.scored.md`, which exists but belongs to a
  different issue (UzorAI/uzorai.com#31, i18n spec) — filename slot collision. Path A did
  not resolve for this issue; issue body is authoritative. Materialized with next available
  suffix `-v12` (v1–v11 already occupied).
- **Source issue:** UzorAI/uzorai.com#78 — "FEAT: Governed asynchronous 24/7 Content
  Factory" (created 2026-08-31T08:52:51Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=feat) on the acquired body →
  10/10 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** FEAT → HOLD. Headless run (implw runner; spec staged to a temp file and
  passed as an argument). The `needs-approval` label was absent on issue #78, so the
  HOLD cleared as solo-operator approved via the `label-absent` channel (attributed to
  daniel-silvers). PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #78 on branch
  `htu/governed-asynchronous-24-7-content-factory-78`; committed with the implementation PR.
