# FEAT: Implement the staged UZOR Engine hero and UZOR GO experience

Parent: UzorAI/uzorai.com#71
EPIC: UzorAI/uzorai.com#69
Depends on: completed Phase 1 issues #70 and #94
Implements: Phase 2 presentation only
Coordinates with: #72, #73, and #79

## Intent

Implement #71 as a deterministic, accessible staging-only hero experience backed by the Phase 1 canonical UZOR Loop model. On the staging/demo hosts, present the UZOR token as an anti-clockwise engine, advance the canonical stages into a bounded upward/rightward construction, let UZOR GO play a cached demonstration cycle that ends in visible value, and keep sound preference independent. Preserve the current hero unchanged on the stable production hosts until separately governed promotion.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Host role from the existing exact allowlist is staging | Render the UZOR Engine hero. | `uzorai.com` and `www.uzorai.com` receive the demo. |
| Host role is production, unknown, or cannot be resolved | Render the existing legacy hero. | `uzor.ai`, `www.uzor.ai`, SSR-like tests, and malformed hosts fail closed to rollback behavior. |
| UZOR GO is activated while idle or complete | Start the local cached manifest from its first stage. | No network request, LLM, paid service, or dynamic generation occurs. |
| UZOR GO is activated while running | Do not start a second timer. | The bounded cycle remains single-instance and deterministic. |
| The final canonical stage completes | Resolve the structure into the cached artifact/value panel and approved payoff. | Bricks stop at the manifest limit and never accumulate indefinitely. |
| Reduced motion is preferred | Disable continuous token rotation and use discrete stage transitions. | Order, state, controls, and final value remain available. |
| Direction is RTL | Apply text/layout direction only. | Canonical stage IDs and causal order remain unchanged. |
| Sound is toggled | Update only the bounded sound preference and accessible label. | It never starts, stops, or aliases UZOR GO; no audio asset is introduced in this phase. |

### Trigger for change

Re-score and reapprove if the canonical model version changes, stable production is to receive the new hero, real audio/media is introduced, cached content becomes remotely generated, a new host or route is required, or accessibility/security tests require behavior outside these paths.

## Final Spec

- Extract the existing hero into a `LegacyHomeHero` component without changing its rendered copy, routes, brand mark, or behavior.
- Add a pure host-role selector that uses the existing `normalizeHost` and `getHostRole` contract; unknown/malformed/unavailable host data selects legacy.
- Add `UzorEngineHero` for staging hosts only. It must import `UZOR_LOOP_STAGES` / derived presentation data from `uzorLoopModel.ts`; no duplicate workflow array is allowed.
- Place the existing canonical cube mark on the left on desktop. CSS rotates it anti-clockwise only as decorative engine energy. The animation must not imply reverse semantic order and must stop under `prefers-reduced-motion`.
- Render at most one structural brick per canonical stage, ordered forward and composed upward/rightward on desktop. Mobile reflows into a bounded ordered stack without reversing IDs.
- Add a checked-in, immutable demo manifest containing only pre-generated local copy and one finite five-stage cycle. UZOR GO advances through that manifest with bounded timers and resolves into an artifact/value panel.
- Display the approved payoff at completion: “BUILD SOMETHING BIG WITH UZOR”, “SOMETHING YOU COULDN'T BUILD BEFORE”, and “BECOME BIG”. Phase #74/#79 owns final localized transcreation; this phase uses the existing English fallback mechanism and adds required keys to current dictionaries without claiming new language coverage.
- Add an independent sound-preference toggle with explicit muted/unmuted accessible text and bounded storage. Because Phase #72 owns music/audio, this phase introduces no audio asset and makes no sound playback claim.
- Separate process bricks from status/evidence/HUD regions in markup and styling.
- Provide keyboard-operable buttons, visible focus, live-region announcements limited to the current stage/value, touch-safe controls, semantic headings/lists, and no duplicated announcements.
- Preserve the existing sections below the hero.
- Do not deploy, merge, alter routes/domains/Worker APIs, add analytics, access secrets, or mutate production data in implw.

### Failure and fallback contract

Any unknown hostname, model validation failure, missing manifest entry, duplicate timer request, storage exception, or unsupported state fails to the legacy hero or a bounded idle/error presentation without network access. The stable-production hosts always select the legacy hero. Cleanup cancels timers on unmount. Diagnostics must not expose storage values, host headers beyond normalized role, credentials, or user data.

## Acceptance Criteria

- [ ] AC1: The implementation imports the Phase 1 canonical model and reuse classifications; no unclassified asset or independent workflow ordering is introduced.
- [ ] AC2: On staging hosts, desktop renders the token left, anti-clockwise decorative motion, canonical bricks forward/upward-right, and a maximum of one brick per canonical stage.
- [ ] AC3: Tests prove LTR and RTL produce identical ordered canonical stage IDs; RTL changes presentation only.
- [ ] AC4: UZOR GO runs one finite cached/local manifest, performs no network request or LLM call, rejects overlapping cycles, and resolves into a visible artifact/value state.
- [ ] AC5: The sound preference is independently keyboard/touch operable, explicitly labeled, bounded-storage backed, and never controls UZOR GO; no audio media is added.
- [ ] AC6: Completion displays the three approved payoff lines and the structure never exceeds the canonical manifest length.
- [ ] AC7: Reduced-motion disables continuous rotation; keyboard, focus, live-region, screen-reader markup, touch targets, and mobile bounded layout have automated assertions and manual verification notes.
- [ ] AC8: Host-role tests prove staging hosts select the engine hero while both production hosts, unknown hosts, and unavailable browser host data select the unchanged legacy hero.
- [ ] AC9: Existing below-hero sections, routes, CSP/security checks, Worker behavior, and stable production rendering remain unchanged.
- [ ] AC10: Full tests, typecheck, and production build pass; the PR links #71/#70/#69 and contains screenshots or DOM evidence for staging desktop, mobile, reduced-motion, and legacy production modes.

## Game Theory Cooperative Model review

### Who benefits

Staging visitors receive a truthful interactive demonstration; production visitors retain stability; frontend authors reuse one canonical model; reviewers get deterministic host and accessibility evidence; operators retain an immediate legacy fallback.

### Abuse vector

An implementer could expose the unfinished hero on production, duplicate or reverse the workflow, disguise status as process, add an unapproved media/network dependency, create an unbounded timer/brick loop, fabricate localized capability, or couple sound state to the primary action.

### Mitigation

Exact host-role selection, canonical imports, immutable local manifest, finite state transitions, bounded storage, timer cleanup, semantic separation, reduced-motion CSS, accessibility tests, stable-host regression tests, independent review, and legacy fallback are separate barriers. Cached content is data and cannot alter permissions, tools, governance, deployment, or network targets.

### Cooperative equilibrium

Visitors can safely explore visible value while production stability and governance remain protected. Contributions that preserve evidence, bounds, and accessibility are reusable; scope expansion cannot reach stable production or pass review.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | One inline legacy hero in `Home.tsx`; a canonical five-stage model; no live loop, audio, or generated-content runtime. |
| Target subjects | Extracted legacy hero plus a staging-only UZOR Engine hero driven by the canonical model and a finite cached demo manifest. |
| Migration | Additive component extraction and host-role selection; staging switches to the engine while production remains pinned to legacy. |
| Compatibility | Existing routes, lower homepage sections, brand assets, locale fallback, security headers, Worker routes, and production hero remain compatible. |
| Rollback | Disable/remove the staging selector or render `LegacyHomeHero` for every role; no data migration or asset deletion is required. |
| Open questions | Real music clock, licensed audio, expanded languages, final transcreation, and stable-production promotion remain owned by #72–#79 and are not answered here. |

No destructive deletion or irreversible migration is authorized.

## Files created / updated

```text
src/client/routes/Home.tsx
src/client/components/home/LegacyHomeHero.tsx
src/client/components/home/UzorEngineHero.tsx
src/client/components/home/UzorEngineHero.css
src/client/config/heroMode.ts
src/client/content/uzorEngineDemo.ts
src/client/i18n/en.json
src/client/i18n/es.json
src/client/i18n/ru.json
src/client/i18n/zh.json
test/uzor-engine-hero.test.mjs
test/hero-host-mode.test.mjs
issues/YYYY-MM-DD__feat__implement-staged-uzor-engine-hero.scored.md
```

Existing adjacent test fixtures may be added only under `test/fixtures/uzor-engine/`. No audio files, new routes, Worker/API files, workflow files, domain configuration, or unrelated page modules are authorized.

## Models Applied

- #1 Game Theory Cooperative — explicit beneficiaries, abuse paths, barriers, and equilibrium protect staging experimentation and production stability.
- #2 Decision Tree — host role, run state, completion, reduced motion, RTL, and sound branches determine behavior.
- #3 Systems Thinking — canonical data, host routing, React state, timers, localization, accessibility, storage, build, and deployment boundaries are treated together.
- #4 Swiss Cheese — host gating, canonical imports, finite manifest, tests, accessibility constraints, review, and rollback independently prevent harm.
- #5 Jobs To Be Done — UZOR GO demonstrates a useful visible outcome instead of presenting internal implementation jargon alone.
- #6 Progressive Disclosure — the public five-stage construction is primary while detailed operational semantics remain outside the hero.
- #7 Anti-Fragile — invalid model/manifest/host states become deterministic fallback evidence without breaking the stable hero.
- #8 Inversion / Premortem — production leakage, reversed order, timer duplication, inaccessible motion, unbounded bricks, and false audio/localization claims drive tests.

## Migration Plan

1. Extract the current hero markup verbatim into `LegacyHomeHero` and snapshot/assert its key copy and links.
2. Implement fail-closed host-role selection using the shared allowlist contract.
3. Add the immutable finite cached demo manifest mapped one-to-one to canonical IDs.
4. Implement the staging engine hero, finite state machine, UZOR GO, independent sound preference, value resolution, and cleanup.
5. Add scoped responsive, focus, RTL, and reduced-motion CSS.
6. Add current-locale dictionary keys with English fallback-safe wording; do not claim Phase #74 completion.
7. Add host, ordering, state, bounds, storage, accessibility, and no-network regression tests.
8. Run targeted tests, the complete suite, typecheck, and production build.
9. Open a review PR with staging/production/reduced-motion/mobile evidence; do not merge or deploy during implw.

### Rollback procedure

Before merge, close the PR. After an approved merge, change the host selector to return legacy for all roles or revert the additive commit. Confirm both stable-production hosts render `LegacyHomeHero`. Retain the canonical model and legacy component; delete no accepted asset or user data. Re-run host, security, accessibility, typecheck, and build verification before any redeploy.

## Legal triggers

No new licensed music, voice, imagery, font, or third-party content is introduced. The existing brand mark and repository copy remain governed by current ownership. Accessibility obligations apply to motion, controls, focus, announcements, contrast, and mobile use. Cached demo copy must not claim completed capabilities beyond the deterministic local demonstration. No regulated data, payments, credential access, analytics expansion, or production-data processing is authorized.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Legacy extraction and host gate | 2–4 hours |
| Engine hero, manifest, state, and styles | 5–10 hours |
| Accessibility, localization keys, and tests | 4–8 hours |
| Verification and review handoff | 2–4 hours |
| Total | 13–26 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Automated validation and visual evidence | 1–3 hours |
| Independent review and governance gates | 1–5 working days |
| Total | 1–5 working days |

### Assumptions

- Canonical model version 1.0.0 and the current four-host staging/production roles remain unchanged.
- Existing brand mark, locale provider, bounded storage, React/Vite tooling, and security contract remain available.
- No audio asset, live generation, paid API, route change, Worker change, or production promotion is included.
- Phase #72 may later connect sound preference to approved audio without changing UZOR GO semantics.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 13–26 hours | TBD | TBD |
| Total | 13–26 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-02T15:30:57.773Z
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

- **Acquired via:** Path B (inline-scored issue body, MCP)
- **Source issue:** UzorAI/uzorai.com#98
- **Path A checked:** yes — the `_Source:` footer on issue #98 pointed at `issues/2026-05-09__feat__inline.scored.md`, which exists but contains an unrelated spec (the i18n port, EPIC #29 Phase B). Treated as non-matching; Path A did not resolve, so Path B (the issue body itself) is authoritative for this run.
- **Integrity re-score:** matches the stored score block exactly (10/10, rubric 1.5.0, PASS) — see `score_spec` output for issue #98's body.
- **Materialized by:** implw run against issue #98, branch `htu/implement-staged-uzor-engine-hero-98`.
- **Materialized at:** 2026-09-02T00:00:00Z (implw run date; issue evaluated_at is 2026-09-02T15:30:57.773Z).
