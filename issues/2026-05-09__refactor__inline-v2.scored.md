# REFACTOR: uzorai.com HTU framework port — Phase 2 (content port + brand reconcile)

**Repo:** UzorAI/uzorai.com
**Umbrella:** Phase 2 of REFACTOR #15 (`UzorAI/uzorai.com`)
**Depends on:** Phase 1 (scaffold) merged
**Skills:** executes under `htu-ui-framework` + `htu-brand-conformance`
**Execution mode:** step-by-step

## Intent

Execute Phase 2 of REFACTOR #15 on top of the Phase 1 scaffold: make the new React 19 + Vite + Hono app feature- and brand-complete, still without deploying. Port the live Home copy into the scaffold's Home route (the three headline words, "Governed AI orchestration…", "one control plane, three jobs", the узор footer line); give Platform, Governance, Docs, Pricing, Contact real or richly-branded content. Wire the cube favicons, app-icons, manifest, and the canonical head-snippet into the scaffold's entry. Reconcile `branding/BRANDING.md` to UzorAI (retitle, remove leixai.com references, correct the description to the actual mint-on-graphite tile). Execute under `htu-ui-framework` and `htu-brand-conformance`. Production stays untouched — no `deploy.yml` change, no domain binding, and the live static site (including its weave mark) is not removed; the cutover that retires it is Phase 3/4. Build green locally.

## Decision Tree

| Decision | Options | Choice | Why |
|---|---|---|---|
| Content depth | full content all six routes / Home full + others on-brand stubs | Home full + others on-brand | The live site only has real Home copy; richer route content fills in incrementally |
| Live weave removal | strip from production `index.html` now / defer to cutover | defer to cutover | Removing it from the live `index.html` alters production; Phase 2 stays non-disruptive |
| BRANDING.md | leave as-is / reconcile now | reconcile now | htu-brand-conformance: the manual must be canonical before cutover; doc-only, safe |
| Favicon/manifest wiring | wire into live index / wire into scaffold entry only | scaffold entry only | Keep the production static site untouched until cutover |
| Execution method | hand-written port / under the two skills | under the skills | Canonical standard (published this session) |
| Deploy | preview deploy now / none | none | Preview is Phase 3; cutover Phase 4 |

### Trigger for change

Re-scope if: (a) Phase 2 approaches the implw cap → split into 2a (route content port) and 2b (favicon/manifest wiring + BRANDING.md reconcile); (b) Phase 1 is not yet merged → block until it is (this phase edits Phase 1's files); (c) reconciling BRANDING.md reveals the in-repo cube rasters drifted from the SVG master → regenerate via `branding/generate-assets.py` as its own step; (d) a route needs real content with no existing source → ship an on-brand stub and track the content source as an open question.

## Final Spec

Build on the Phase 1 scaffold; apply `htu-ui-framework` (conventions) and `htu-brand-conformance` (mark + manual). All changes stay inside the new scaffold and `branding/` — production `index.html`, `deploy.yml`, and domain bindings are NOT modified.

- `src/client/routes/Home.tsx` — port the live copy verbatim: "Orchestrate. Govern. Execute.", "Governed AI orchestration for enterprise agents, tools, and workflows — one woven control plane, auditable end to end.", the "ONE CONTROL PLANE, THREE JOBS" section (Orchestrate / Govern / Execute), and the узор footer gloss. Visual parity with the live hero (graphite bg, mint/teal accents).
- `src/client/routes/{Platform,Governance,Docs,Pricing,Contact}.tsx` — on-brand content where a source exists; otherwise a branded stub with heading + cube + short placeholder. Docs may link the existing MCP docs if present.
- Scaffold entry (`src/client/index.html` — the Vite HTML entry created in Phase 1) — port `branding/head-snippet.html` verbatim; reference the cube `favicon-*`, `apple-touch-icon`, `icon-192/512`, `site.webmanifest`, and the `public/favicon` + `public/app-icon` kits. Verify no weave artifact exists in the scaffold.
- `branding/BRANDING.md` — retitle to UzorAI; remove/replace leixai.com references; correct the gradient/transparent description to the actual mint-on-graphite tile; keep the cube as the single canonical mark.

Out of scope (Phase 3/4 of #15): preview Worker deploy, Pages→Worker cutover, custom-domain binding, removal of the live static `index.html`'s weave, Pages decommission.

## Acceptance Criteria

- [ ] Home route renders the live copy verbatim (headline, subhead, three-jobs section, узор line) with visual parity to the current hero.
- [ ] Platform/Governance/Docs/Pricing/Contact render on-brand content or branded stubs; navigation works; no console errors.
- [ ] Cube favicons, app-icons, and manifest are wired into the scaffold entry via the ported head-snippet; a grep of the scaffold finds no weave mark.
- [ ] `branding/BRANDING.md` is retitled UzorAI, leixai.com references removed, and the tile description matches the actual mint-on-graphite asset.
- [ ] `npm run build` is green; the app renders all routes.
- [ ] Production untouched: `deploy.yml` unchanged, the live static site (including its weave) is still served, no domain/Worker binding added.
- [ ] Executed under `htu-ui-framework` + `htu-brand-conformance`.
- [ ] PR references #15 (Phase 2 of) and depends on Phase 1 merged.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Route content | Empty branded stubs (Phase 1) | Home ported verbatim; other routes on-brand |
| Favicons / manifest in scaffold | Unwired | Cube kit wired via the ported head-snippet |
| BRANDING.md | LeixAI-titled; gradient/transparent description | UzorAI-titled; mint-on-graphite tile reconciled |
| Production site | Static + weave (unchanged) | Static + weave (still unchanged this phase) |
| Governing method | Hand-written prose in #15 | htu-ui-framework + htu-brand-conformance |
| Open questions | Content source for the Docs route (MCP docs? README?); how rich should non-Home routes be before cutover? |

## Files created / updated

```
UzorAI/uzorai.com/src/client/routes/Home.tsx           (UPDATED — live copy ported)
UzorAI/uzorai.com/src/client/routes/Platform.tsx       (UPDATED — content / on-brand stub)
UzorAI/uzorai.com/src/client/routes/Governance.tsx     (UPDATED — content / on-brand stub)
UzorAI/uzorai.com/src/client/routes/Docs.tsx           (UPDATED — content / on-brand stub)
UzorAI/uzorai.com/src/client/routes/Pricing.tsx        (UPDATED — content / on-brand stub)
UzorAI/uzorai.com/src/client/routes/Contact.tsx        (UPDATED — content / on-brand stub)
UzorAI/uzorai.com/src/client/index.html                (UPDATED — head-snippet + cube favicon/manifest links)
UzorAI/uzorai.com/branding/BRANDING.md                 (UPDATED — UzorAI title; leixai refs removed; tile reconciled)
# UNCHANGED this phase (do NOT modify): production index.html (weave stays until cutover),
# .github/workflows/deploy.yml, custom-domain bindings, branding/* SVG sources, public/* raster kits
```

## Models Applied

- **#2 Decision Tree** — content-depth, weave-deferral, branding, and wiring decisions mapped with rationale and triggers.
- **#11 Progressive Disclosure** — Home ships full content now; other routes fill in incrementally; the disruptive cutover is deferred to a later phase.
- **#15 Inversion / Premortem** — failure modes (production disruption from editing the live index, cap overflow, asset drift, missing content source) enumerated with mitigations in Trigger-for-change and Open questions.
- **#8 Swiss Cheese** — branch isolation → green build → PR review → no deploy this phase, so no single failure ships a broken or off-brand site.

(Governing skills: `htu-ui-framework` for conventions; `htu-brand-conformance` for the cube mark + the BRANDING.md reconcile.)

## Migration Plan

1. **Branch** off `main` (after Phase 1 is merged). No production impact.
2. **Port** the Home copy; add on-brand content/stubs to the other five routes; wire the head-snippet + cube favicon/manifest into the scaffold entry; reconcile `branding/BRANDING.md`. Keep all edits inside the scaffold + `branding/`.
3. **Build** — `npm run build` green; all routes render; grep confirms no weave in the scaffold.
4. **PR** against `main`, referencing #15 (Phase 2 of). `deploy.yml` untouched → merge does not alter the live site.

### Rollback

- Additive on an isolated branch; `main` unaffected until merge.
- `deploy.yml` and the production build path are not modified, so even post-merge the live static site is unchanged.
- `BRANDING.md` is a documentation file; reverting the commit restores the prior text. If any regression ships, `git revert` the merge commit. No domain/DNS action this phase.

## Legal triggers

None. Phase 2 ports existing marketing copy and reconciles HTU-owned brand documentation, using the in-repo cube asset kit. No production deploy, no new third-party data processing, PII, contracts, or royalties. The standing UzorAI trademark-clearance item is tracked separately and unaffected by a content/branding-consistency change.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Port Home copy + visual parity | Phase 1 merged | 1 hour |
| On-brand content/stubs for five routes | Phase 1 merged | 1 hour |
| Wire head-snippet + cube favicon/manifest | None | 0.5 hours |
| Reconcile BRANDING.md | None | 0.25 hours |
| Build verify | None | 0.25 hours |
| Total | | 3 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Port Home copy + visual parity | Phase 1 merged | 1.25 hours |
| On-brand content/stubs for five routes | Phase 1 merged | 1.25 hours |
| Wire head-snippet + cube favicon/manifest | None | 0.5 hours |
| Reconcile BRANDING.md | None | 0.25 hours |
| Build verify | None | 0.25 hours |
| Total | | ~3.5 hours |

### Assumptions

- Phase 1 (scaffold) is merged; this phase edits the files it created.
- The live Home copy is the canonical content to port; non-Home routes have no required content source yet (stub if none).
- The cube asset kit and `head-snippet.html` are in-repo and current; no raster regen unless drift is found.
- No deploy and no domain binding in Phase 2; the live static site (with its weave) remains the production path until cutover.
- implw run cap is 20 minutes — if this phase approaches it, split into 2a (route content) and 2b (favicon/manifest wiring + BRANDING.md reconcile).

### Actuals (filled post-execution)

| Phase | Wait dependency | Estimate | Actual | Delta |
|---|---|---|---|---|
| Port Home copy + visual parity | Phase 1 merged | 1 hour | TBD | TBD |
| On-brand content/stubs for five routes | Phase 1 merged | 1 hour | TBD | TBD |
| Wire head-snippet + cube favicon/manifest | None | 0.5 hours | TBD | TBD |
| Reconcile BRANDING.md | None | 0.25 hours | TBD | TBD |
| Build verify | None | 0.25 hours | TBD | TBD |
| Total | | 3 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** refactor
- **Evaluated at:** 2026-06-13T04:32:02.085Z
- **Score:** 10/10
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| decision_tree | PASS |
| final_spec | PASS |
| acceptance_criteria | PASS |
| migration_summary | PASS |
| files_list | PASS |
| models_applied | PASS |
| migration_plan | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__refactor__inline.md_

---

## Provenance (auto-materialized)

- **Acquisition path:** B (inline-scored issue body) — IMPLW_FLOW.md §2/§4.
- **Source issue:** UzorAI/uzorai.com#19, created 2026-06-13T04:32:02Z (title: `REFACTOR: uzorai.com HTU framework port — Phase 2 (content port + brand reconcile)`).
- **Why materialized:** the `_Source: 2026-05-09__refactor__inline.md_` footer derives `issues/2026-05-09__refactor__inline.scored.md`, but that path is already occupied by the **Phase 1** materialized spec (auto-materialized from issue #17). Path A therefore does NOT resolve to *this* spec — the existing file is a different issue's content. The issue #19 body carried all three inline-scored signals (`## ZAI Spec Score` heading, `**Score:** 10/10`, `**Passed:** YES`), so the body is authoritative and is written to disk per §4.
- **Filename derivation (§4.1) + collision (§4.2):** derived name `issues/2026-05-09__refactor__inline.scored.md` collides with the Phase 1 file → `-v2` suffix applied → `issues/2026-05-09__refactor__inline-v2.scored.md`. (Root cause: issues #17 and #19 share the same `_Source:` footer name.)
- **Integrity re-score (§3):** re-scored via UZOR Skills `score_spec` (`spec_type=refactor`, rubric 1.5.0) → **10/10 PASS**, matching the stored score block. No content/score divergence.
- **Gate 1 (§4 classifier):** `refactor` ⇒ HOLD; run is headless (stdin not a TTY) and issue #19 carries no `needs-approval` label ⇒ cleared as **solo-operator approved (channel: `label-absent`, attributed to daniel-silvers)**. PR review by daniel-silvers is still required to merge.
- **Path-name note:** the spec's Final Spec/Files list names `branding/BRANDING.md`, but the actual LeixAI-titled brand manual lives at the repo root (`./BRANDING.md`) and matches the spec's description exactly (mint→teal gradient hexagonal cube, leixai.com references). The reconcile was applied to the real file per intent; surfaced in the PR body.
- The working copy used for implementation has the score block stripped; the score block is retained in this materialized file.
