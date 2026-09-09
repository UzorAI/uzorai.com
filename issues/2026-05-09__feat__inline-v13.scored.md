# FEAT: Neutral synthetic narrator — closed multilingual phrase set

Parent: UzorAI/uzorai.com#69
Phase: 6 of 10 content increment (populates the #125 foundation's empty catalog);
takes on a deliberately bounded slice of Phase 7 of 10's job rather than waiting for
or reimplementing the full Verified Phrase Reservoir — see Decision Tree Branch 1.
Depends on: #125 (Builder/Governor vocal-role foundation, merged), #108 (eight-locale
i18n), #123 (locale-pack foundation)

## Intent

Populate the currently-empty production vocal catalog with exactly one
repository-owned, rights-clean, ungendered synthetic narrator profile that can speak
UZOR's existing seven canonical workflow-stage labels in all eight launch locales,
using pre-generated static audio rather than any live text-to-speech engine. This
issue authorizes specification and later governed implementation only after
approval; it does not itself authorize implw, merge, deployment, paid use, secret
handling, or production-data mutation.

## Decision Tree

| Condition | Decision | Consequence |
|---|---|---|
| Full Phase 7/9 governed content pipeline (DISCOVER→...→REPLENISH) does not exist yet | Ship a small, closed, manually authored phrase set — the seven existing `UZOR_LOOP_STAGES` labels, already translated and shipped in all eight locale JSON files — instead of waiting for or reimplementing the full reservoir/factory | Apply deterministically and record evidence; this explicitly does not authorize or substitute for Phase 7/9's own governed automation, which remains separately scoped |
| Voice delivery mechanism: live TTS engine (Web Speech API or a cloud provider) vs. offline pre-synthesized static clips | Offline pre-synthesized static audio clips, generated once as a content-authoring step and shipped as approved assets | No runtime network dependency, no per-request cost, no OS/browser voice-pool inconsistency or incidental gendering; consistent with the existing "never wait on runtime generation" playback contract |
| Voice identity: distinct voice per role vs. one shared voice | Exactly one voice profile, used interchangeably as both `builderProfileId` and `governorProfileId` on every cue | Trivially satisfies the existing Decision Tree Branch 4 from #75/#125 — there is no gender to bind to a role when only one, explicitly ungendered voice exists |
| An existing translated stage label is unsuitable for spoken narration as written (too long, awkward when read aloud, ambiguous pronunciation) | Permit a reviewed "spoken variant" string per locale, pinned 1:1 to the same phrase ID, distinct from the visual caption string | Apply deterministically and record evidence; the visible caption text never silently changes to accommodate audio |
| A given locale's synthesized clip fails intelligibility/quality review | Ship caption-only for that locale via the existing resolver fallback rather than blocking the whole feature | Feature ships incrementally per locale using the caption-only path that already exists — never all-or-nothing |

Trigger for change: schema/clock/locale-pack versions change, Phase 7 publishes its
real phrase contract and supersedes this bounded set, or approved evidence shows a
shipped locale's pronunciation was wrong — any of these requires a separately scored
update to this spec before behavior changes.

## Final Spec

- Reuse the seven canonical stage labels already defined in `UZOR_LOOP_STAGES`
  (`src/client/workflow/uzorLoopModel.ts`) and already translated under
  `home.engine.stage.*` in every `src/client/i18n/{locale}.json` file. Author no new
  capability-claim text in this FEAT — only reuse existing, already-reviewed, already-
  shipped copy.
- Assign each stage label a stable ID matching the closed syntax
  `/^uzor-phrase-[a-z0-9]+(?:-[a-z0-9]+)*$/` already enforced by `schema.ts`.
- Define exactly one `VocalProfile` in `src/client/performance/vocal/catalog.ts`
  (e.g. `id: 'uzor-narrator-neutral-01'`) covering all eight `VOCAL_SUPPORTED_LOCALES`,
  with `rights.basis: 'repository-owned'`, `rights.thirdPartyAssets: false`,
  `provenance.generatedMedia: true`, `provenance.recordingConsent: false` (documented
  explicitly as "not applicable — no human was recorded, nothing to consent to"), and
  a `characteristics.description` limited strictly to acoustic terms (pitch register,
  synthetic timbre) — no age or gender references, per the schema's existing comment
  that this field must never encode identity.
- Generate one short audio clip per phrase per locale, once, offline, as a
  content-authoring step outside the runtime path. Tooling choice for that one-time
  generation (manual synthesis, an offline TTS pass, etc.) is an implementation
  detail and explicitly out of scope for this spec to prescribe — the only hard
  requirement is that nothing about producing these clips happens at request time in
  production.
- Run every clip through the same robotic/synthetic effect chain so the timbre reads
  as consistently synthetic and identical in character across all eight locales.
- Store clips as static, version-controlled assets (not embedded as inline
  base64, not fetched from a third party at runtime), referenced by phrase ID.
- Every `VocalCue` uses the same single profile ID for both `builderProfileId` and
  `governorProfileId`.
- Wire playback through the existing `resolveVocalCue`/`resolveAllLocales` resolver
  in `resolve.ts` unchanged. This spec adds catalog content and static assets, not new
  resolution logic — if implementation finds a schema or resolver change necessary,
  that is a Decision Tree trigger-for-change event requiring spec reapproval, not a
  silent addition.
- First runtime consumer is `UzorEngineHero`'s existing performance loop
  (`useUzorPerformance`), gated exactly the way audio is already gated today: opt-in
  via the existing muted-by-default sound-preference toggle. No change to that
  default.

### Failure and fallback contract

- Any locale missing a clip, or failing intelligibility/quality review, resolves to
  caption-only for that locale through the resolver's existing, already-tested
  behavior — no new code path is needed for this.
- A failed or blocked audio load never blocks the bar clock, matching the existing
  performance contract.
- No live network call is ever made to produce narration in production.

## Acceptance Criteria

- [ ] AC1: Exactly one profile exists in `catalog.ts`; its `characteristics.description`
      is reviewed against an explicit denylist of gender/age terms before merge, not
      just self-attested.
- [ ] AC2: The profile declares working audio for all eight launch locales, or
      explicitly documents which locales fall back to caption-only and why, per
      Decision Tree Branch 5.
- [ ] AC3: Every phrase ID used maps 1:1 to an existing `UZOR_LOOP_STAGES` entry; no
      newly invented capability-claim text ships in this FEAT.
- [ ] AC4: `resolveVocalCue`/`resolveAllLocales` require zero code changes — only
      catalog and static-asset additions — demonstrating the #125 foundation's
      contracts were sufficient as designed.
- [ ] AC5: Removing or blocking any single locale's audio file leaves only that
      locale in caption-only mode, without affecting other locales or the clock.
- [ ] AC6: No new runtime network request, provider SDK, or browser secret is
      introduced; existing hardening scripts (`assert-no-browser-secrets.mjs` and
      related) pass unmodified.
- [ ] AC7: Total added static-asset weight (8 locales × 7 phrases) is measured and
      reported in the PR, so it can be weighed against the project's existing
      dependency-minimal, bundle-conscious posture before merge.
- [ ] AC8: A locale-competent human reviewer — not the tool used to generate the
      clip — confirms each locale's audio is intelligible and correctly pronounced,
      or the PR documents that verification wasn't available for that locale and it
      therefore ships caption-only instead.

## Game Theory Cooperative Model review

### Who benefits

Visitors hear an actual narrator in their own language with no gendered voice-role
coding anywhere in it; the repository gets its first real, rights-clean catalog
entry to build on; reviewers and FSA retain the same approval authority as every
other phase, since this is an ordinary scored PR, not a governance bypass.

### Abuse vector

Someone could ship a locale with low-quality or outright incorrect pronunciation
while claiming full coverage — invisible to an English-only reviewer, but a real
degradation for that locale's actual visitors. Separately, descriptive language
could quietly smuggle age or gender framing into `characteristics.description`
under the guise of harmless flavor text.

### Mitigation

Automated schema validation only guarantees structural well-formedness — it cannot
verify that a clip is actually intelligible or correctly pronounced in a language
the reviewer doesn't speak. AC8 closes that specific gap by requiring a
locale-competent human check, not just a passing validator. AC1's explicit denylist
review closes the second gap before merge rather than relying on the author's intent.

### Cooperative equilibrium

Reviewed, correct, genuinely neutral content becomes reusable across every locale's
visitors. Incorrect or non-neutral content is caught at review, before any visitor
ever hears it — not discovered afterward as a complaint.

## Subject Migration Summary

| Field | Summary |
|---|---|
| Current subjects | Empty production vocal catalog; stage-label text already translated and shipped in all 8 locales; zero audio assets exist anywhere in the repository. |
| Target subjects | One repository-owned, rights-cleared, ungendered narrator profile covering 8 locales; up to 56 static audio clips (7 phrases × 8 locales); a populated catalog for the first time. |
| Migration | Purely additive: one new catalog entry, new static assets, no schema change, no route wired any differently beyond the sound-preference gate that already exists. |
| Compatibility | Consumers use the existing `VocalProfile`/`VocalCue` contracts unchanged; any locale without a verified clip falls back through the existing caption-only path. |
| Rollback | Remove the catalog entry and the static assets; the resolver's behavior for an empty/partial catalog is already the tested starting condition from #125. |
| Open questions | Exact offline synthesis tooling is left to the implementer; whether a locale needs a "spoken variant" distinct from its visual caption (Decision Tree Branch 4) must be resolved during content authoring per locale, not assumed here; whether this bounded phrase set is later absorbed into or superseded by the full Phase 7 reservoir is a decision for whoever scopes Phase 7. |

Destructive deletion or irreversible migration is out of scope and requires a
separate governed specification.

## Files created / updated

```text
src/client/performance/vocal/catalog.ts        # add the single narrator profile
public/audio/narrator/<locale>/<phraseId>.*    # up to 56 static clips; exact path/format left to implementer
docs/vocal-performance-foundation.md           # record this bounded Phase-7 exception in "Phase 7 integration"
test/vocal-performance-foundation.test.mjs     # extend to cover the populated catalog and all-locale resolution
issues/<materialized scored spec filename>
```

No change to `schema.ts` or `resolve.ts` is anticipated. If implementation finds one
necessary, that is itself a Decision Tree trigger-for-change event requiring spec
reapproval before proceeding — not a silent addition alongside content work.

## Models Applied

- Decision Tree — the five branches above govern scope-bounding, delivery mechanism,
  voice identity, spoken-variant handling, and per-locale fallback.
- Progressive Disclosure — a small, closed, immediately shippable phrase set now;
  the full governed Phase 7 reservoir remains separately scoped for later.
- Swiss Cheese — schema validation, human locale review, the existing caption-only
  fallback, and the existing approval gate are independent barriers, not one check
  standing in for all of them.
- Jobs To Be Done — a visitor hears their own language with no jargon, without
  needing to understand any of the governance behind it.
- Anti-Fragile — any single locale's clip failing review degrades that locale to
  captions without breaking anything else.
- Inversion / Premortem — the abuse vector above (plausible-but-wrong pronunciation,
  smuggled gender/age language) is the failure this spec is written to prevent.

## Legal triggers

- Provenance and rights for the synthesized audio itself: even fully synthetic,
  non-human-derived audio needs documented basis (`repository-owned`) and
  `clearanceEvidence`, per the schema's existing required fields.
- If any offline synthesis tool or service is used to produce the clips, that tool's
  terms of service and output-rights/licensing must be checked before the result can
  honestly be marked `repository-owned`.
- Public accessibility: captions are already required by the existing schema; this
  FEAT does not relax or bypass that requirement.
- This structural specification is not legal advice; the designated rights/legal
  owner must confirm before the profile's `approval.status` is set to `'approved'`.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Content authoring, per-locale human pronunciation review (8 locales), schema/catalog PR review | 6–14 hours |
| Total | 6–14 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Locale-competent reviewer availability across multiple languages/time zones, implementation, CI, governance review | 3–7 working days |
| Total | 3–7 working days |

### Assumptions

- Reuses #125's schema and resolver contracts entirely unchanged.
- Offline audio-generation tooling is available to whoever implements this; no
  specific tool is prescribed or authorized by this spec.
- No paid provider is authorized by this FEAT without separate evidence per the
  Legal triggers section above.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Implementation and validation | 6–14 active hours / 3–7 working days | TBD | TBD |
| Total | 6–14 active hours / 3–7 working days | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
- **Evaluated at:** 2026-09-09T05:55:35.675Z
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

- Materialized from: `https://github.com/UzorAI/uzorai.com/issues/161`
- Acquisition path: Path B (inline-scored issue body)
- Re-scored at materialization time: 10/10, rubric 1.5.0, PASS — matches the score
  block carried in the issue body (no divergence)
- Materialized by: `implw` on 2026-09-09
- Collision handling: `2026-05-09__feat__inline.md` is a shared generic source name
  reused by many unrelated prior FEAT specs (`inline` .. `inline-v12` already taken
  on `main` at materialization time); this file is the `-v13` slot, specific to
  issue #161
