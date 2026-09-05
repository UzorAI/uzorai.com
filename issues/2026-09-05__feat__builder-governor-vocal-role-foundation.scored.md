# FEAT: Builder/Governor vocal-role foundation

Parent: UzorAI/uzorai.com#69
Phase: 6 of 10
Replaces: UzorAI/uzorai.com#75
Depends on: #100 (performance clock), #108 (eight-locale i18n), #123 (locale-pack foundation)

## Intent

Add the code-only, deterministic foundation for Builder/Governor vocal roles. Define versioned role, profile, cue, caption, approval, provenance, compatibility, and fallback contracts that later reviewed voice assets and Phase 7 phrase manifests can consume. Builder and Governor are semantic roles, never gender identities. This phase ships no generated voice, third-party media, live voice API, new browser request, or rendered UI behavior.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| A cue references two approved, compatible profiles and a valid clock slot | Resolve the declared Builder/Governor assignment. | Return a frozen playable plan with localized caption metadata. |
| A profile, phrase, locale, approval, provenance, rights, schema, clock, or locale-pack pin is missing/invalid/incompatible | Fail closed for audio. | Resolve the same canonical slot in caption-only mode with a stable diagnostic code. |
| A role assignment attempts to encode gender semantics or restrict either role by gender | Reject it. | Neither role has a gender field or gender-based validation branch. |
| A future voice asset or transport is unavailable or autoplay is blocked | Preserve clock and caption output. | Audio is optional and cannot block/reorder the canonical cycle. |
| Phase 7 phrase manifests are not yet available | Use repository-owned fixture phrase IDs only in tests. | Do not invent a production phrase reservoir in this phase. |

Trigger for change: schema/clock/locale-pack versions change, Phase 7 publishes its phrase contract, or approved voice assets become available. Such integration requires a separately scored issue.

## Final Spec

- Add `src/client/performance/vocal/schema.ts` with versioned serializable types and pure validation for the exact roles `builder` and `governor`, profile capability, locale support, approval/provenance/rights metadata, clock slots, phrase references, caption references, and compatibility pins.
- Do not model gender as role meaning or eligibility. Optional descriptive voice characteristics may not drive authorization, semantic selection, workflow order, or validation.
- Add `src/client/performance/vocal/resolve.ts` with a pure offline resolver. It returns either an approved compatible vocal plan or caption-only fallback. It never fetches, invokes a provider, reads secrets, constructs HTML, or mutates the performance clock.
- Pin the existing performance-manifest/clock and locale-pack schema versions explicitly. Unknown keys, unsafe URLs, arbitrary HTML/script content, duplicate cue IDs, timing overflow, workflow reordering, and unsupported locales fail validation.
- Support exactly the eight launch locales already registered by the application. Every locale must resolve caption metadata even when no voice profile exists.
- Define stable diagnostic codes for invalid schema, incompatible version, unapproved profile, missing provenance/rights, unsupported locale, invalid phrase reference, duplicate cue, timing overflow, and caption-only fallback.
- Keep production catalog empty unless repository-owned, rights-cleared profiles already exist. Tests may use synthetic metadata fixtures but no binary audio.
- Document extension, approval, rights/provenance, accessibility, Phase 7 integration, and rollback rules in `docs/vocal-performance-foundation.md`.
- Do not import the new modules into rendered routes or transports. `dist/client` must remain behaviorally unchanged.

### Failure and fallback contract

- Invalid or unavailable audio never blocks a bar, changes workflow causality, or suppresses captions.
- Fallback is deterministic caption-only output using the requested locale when its caption key is valid, otherwise the trusted English caption key.
- Validation returns bounded structured diagnostics and never includes secrets or arbitrary source payloads.
- Rollback is deletion of the unconsumed modules/docs/tests or pinning the previous schema; no data migration is required.

## Acceptance Criteria

- [ ] AC1: Tests prove either approved compatible fixture profile can serve either Builder or Governor with identical role semantics and no gender-based branch.
- [ ] AC2: Valid call-and-response fixture cues retain declared bar/beat order and cannot reorder canonical workflow causality.
- [ ] AC3: Invalid schema/version, unapproved profile, missing provenance/rights, unsupported locale, unsafe reference, duplicate cue, and timing overflow are rejected with stable diagnostics.
- [ ] AC4: Missing profile, unavailable asset, and blocked-audio inputs deterministically produce caption-only plans without changing clock slots.
- [ ] AC5: All eight launch locales resolve caption metadata with an explicit voice-or-caption-only result.
- [ ] AC6: The production catalog contains no unreviewed voice asset; the change adds no binary media, provider SDK, browser secret, or runtime network call.
- [ ] AC7: Caption metadata exposes one authoritative visual caption and a screen-reader announcement policy that prevents duplicate simultaneous speech/ticker announcements.
- [ ] AC8: Existing repository tests, typecheck/build, browser-secret checks, and new focused tests pass; generated browser output is unchanged because no route imports the foundation.

## Game Theory Cooperative Model review

### Who benefits

Visitors retain captions and deterministic timing; implementers gain stable contracts; rights and content reviewers retain approval authority; operators gain safe fallback and rollback.

### Abuse vector

An asset producer or future manifest could assign stereotyped semantics, forge approval/provenance, inject unsafe references, or make playback depend on a provider.

### Mitigation

Roles have no gender eligibility, approvals and compatibility are validated, references use closed syntax, audio failure resolves caption-only, and the foundation performs no network/provider operation.

### Cooperative equilibrium

Reviewed compatible contributions become reusable plans; incomplete or manipulative inputs gain no audio path but preserve accessible deterministic captions.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | Performance clock, locale catalogs, and locale-pack contracts exist; no governed vocal-role contract exists. |
| Target subjects | Versioned vocal role/profile/cue/caption contracts plus pure validation and caption-only resolution. |
| Migration | Add unconsumed modules, docs, and tests; later consumers integrate through a separately scored Phase 7/runtime issue. |
| Compatibility | Exact schema, clock, locale-pack, locale, approval, provenance, rights, and timing pins are required. |
| Rollback | Remove the unconsumed foundation or pin its prior schema; rendered output and stored user data are unaffected. |
| Open questions | Actual voices, providers, licenses, phrase inventory, disclosures, and runtime transport remain deferred until evidence and approvals exist. |

No destructive deletion or irreversible migration is authorized.

## Files created / updated

```text
src/client/performance/vocal/schema.ts
src/client/performance/vocal/resolve.ts
src/client/performance/vocal/catalog.ts
test/vocal-performance-foundation.test.mjs
docs/vocal-performance-foundation.md
issues/<materialized scored spec filename>
package.json                         # only if needed to include the focused test in existing validation
```

No other production file, route, component, transport, deployment configuration, binary media, or dependency is in scope.

## Models Applied

- Decision Tree — every validity and fallback outcome is explicit.
- Systems Thinking — compatibility pins connect clock, locale, pack, phrase, rights, captions, and future transport without runtime coupling.
- Swiss Cheese — schema, approval, provenance, rights, locale, timing, safe-reference, and compatibility checks are independent barriers.
- Jobs To Be Done — later playback can alternate meaningful roles while visitors always retain synchronized text.
- Progressive Disclosure — this phase establishes invisible contracts before introducing reviewed audio or controls.
- Anti-Fragile — bad or missing audio metadata becomes a diagnostic and caption-only result rather than a broken cycle.
- Inversion / Premortem — stereotypes, forged rights, provider outages, duplicate announcements, and timing drift are blocked at the contract boundary.

## Legal triggers

- No voice recording, cloned/synthetic identity, music, third-party phrase, or licensed binary is shipped by this foundation.
- Future profiles/assets require documented consent or provider rights, permitted territories/uses, retention, attribution/disclosure, and approval before catalog inclusion.
- Public capability phrases require Phase 7 provenance and substantiation.
- Accessibility requires synchronized captions/text equivalents and prevention of duplicate screen-reader announcements.
- This specification is not legal advice; triggered future assets require the designated rights/legal owner's review.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Contract, validator, resolver, tests, docs, review | 3–7 hours |
| Total | 3–7 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Implementation, CI, review | 1–3 working days |
| Total | 1–3 working days |

### Assumptions

- Existing clock, eight-locale, and locale-pack schemas on `main` are the authoritative compatibility sources.
- No voice asset or runtime UI integration is required for this foundation.
- Implementation creates a reviewable PR; merge and deployment remain separately authorized.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 3–7 active hours / 1–3 working days | TBD | TBD |
| Total | 3–7 active hours / 1–3 working days | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-05T06:14:31.948Z
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

_Source: 2026-09-05__feat__builder-governor-vocal-role-foundation.md_

## Provenance (auto-materialized)

This file was auto-materialized from the inline-scored issue body of UzorAI/uzorai.com#125 during the implw run on 2026-09-05. Acquisition: Path B (inline-scored). The score block above matches the stored score in the issue body.
