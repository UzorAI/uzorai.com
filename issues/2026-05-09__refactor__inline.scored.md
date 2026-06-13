# REFACTOR: uzorai.com HTU framework port — Phase 1 (scaffold)

**Repo:** UzorAI/uzorai.com
**Umbrella:** Phase 1 of REFACTOR #15 (`UzorAI/uzorai.com`)
**Template:** zi007lin/htu.io (React 19 + Vite + Hono on Cloudflare Workers) — reference pattern only
**Skills:** executes under `htu-ui-framework` + `htu-brand-conformance`
**Execution mode:** step-by-step

## Intent

Execute Phase 1 of REFACTOR #15: add the standard HTU application scaffold (React 19 + Vite + Hono on Cloudflare Workers) to UzorAI/uzorai.com, with the canonical cube brand wired in — **without touching the production deploy.** Ship a buildable app shell: a Hono server, a client router over the six routes (Home, Platform, Governance, Docs, Pricing, Contact) as branded stubs, Header/Footer/Nav, design tokens, and the cube mark sourced from the existing in-repo asset kit. Execute under the `htu-ui-framework` and `htu-brand-conformance` skills. No content port, no domain cutover, no Pages decommission, no `deploy.yml` change — those are later phases of #15. This phase is sized to complete inside the implw run cap; the full port is split across phases to avoid the 20-minute timeout that the all-in-one scope would hit.

## Decision Tree

| Decision | Options | Choice | Why |
|---|---|---|---|
| Phase scope | full #15 in one run / scaffold-only Phase 1 | scaffold-only | #15 is ~7h / ~30 files; implw caps at 20 min — a single run times out (cf. zzv-skills#146 timing out twice at far smaller scope) |
| Execution method | hand-written port steps / under htu-ui-framework + htu-brand-conformance | under the skills | The skills are now the canonical standard (published this session); they govern stack + brand by construction |
| Route content | port copy now / branded stubs now | branded stubs | Content port is Phase 2; stubs keep Phase 1 bounded and buildable |
| Production deploy | cut over to Worker now / leave Pages deploy untouched | leave untouched | Phase 1 must be non-disruptive; deploy cutover is Phase 4 |
| Brand mark | weave inline / cube master | cube master (`branding/uzor-logo.svg`) | htu-brand-conformance: the manual is the source of truth; weave was an unsanctioned swap |
| Custom domains | bind to Worker now / none | none | Domain cutover is Phase 4 |
| Scaffold placement | replace production `index.html` / isolate so prod build is untouched | isolate | Avoid changing the live Pages build auto-detection; consolidation happens at the Phase 4 cutover |
| Build verification | deploy a preview / local build green only | local build green | Phase 1 success = compiles + renders; no deploy this phase |

### Trigger for change

Re-scope if: (a) Phase 1 itself approaches the implw cap → split into 1a (config + Hono server) and 1b (app shell + routes); (b) a chosen dep version conflicts on install → pin to the nearest working React 19 / Vite / Hono release; (c) adding `package.json` changes Cloudflare Pages' auto-detected production build → isolate the scaffold (subdirectory or pinned build command) so the live site is unaffected; (d) the in-repo cube SVGs are stale vs the deployed raster kit → regenerate via `generate-assets.py` first.

## Final Spec

Build the standard React 19 + Vite + Hono scaffold specified below; apply `htu-ui-framework` for stack/conventions and `htu-brand-conformance` for the mark. `zi007lin/htu.io` is the reference pattern, but the runner must NOT block on reading it (it may be cross-org-inaccessible from this repo's runner) — scaffold from the conventions and file list in this spec. The scaffold is **additive and isolated** — the production static `index.html`, `deploy.yml`, and custom-domain bindings are NOT modified in this phase.

- `package.json` — React 19, Vite, Hono, wrangler; `dev` / `build` scripts. Adding deps must not change the live Pages production build (keep the existing prod build command/path intact; if Pages auto-detects the new framework, isolate the scaffold per the Trigger-for-change).
- `vite.config.ts`, `tsconfig.json` — standard React 19 + TypeScript Vite setup.
- `wrangler.toml` — Worker name `uzorai`; **no** custom-domain routes this phase (workers.dev only / unbound).
- `src/server/index.ts` — Hono entry serving the built client; SPA fallback.
- `src/client/main.tsx`, `src/client/App.tsx` — router over `/`, `/platform`, `/governance`, `/docs`, `/pricing`, `/contact`.
- `src/client/routes/*.tsx` — six components rendering **branded stubs** (heading + cube + placeholder). No content port yet.
- `src/client/components/{Header,Footer,Nav}.tsx` — Header uses the cube mark; Nav links the six routes; Footer carries the узор line as text.
- `src/client/brand/tokens.css` — graphite `#0F172A` background, mint/teal accents; `uzor-mark.svg` sourced from the existing `branding/uzor-logo.svg` master (no redraw).
- The cube is the only mark in the new scaffold; no weave `#mark`. Existing `branding/` and `public/` asset kits are reused, not recreated.

Out of scope (later phases of #15): porting Home/route copy, removing the live inline weave `#mark`, `BRANDING.md` reconciliation, Pages→Worker deploy cutover, domain binding, Pages decommission.

## Acceptance Criteria

- [ ] React 19 + Vite + Hono scaffold added; `package.json` declares React 19, Vite, Hono, wrangler with `dev`/`build` scripts.
- [ ] `npm run build` succeeds locally (green build, no type errors).
- [ ] All six routes render as branded stubs with working navigation and no console errors.
- [ ] Header/hero uses the cube master (`branding/uzor-logo.svg`); a grep of the new scaffold finds no weave `#mark`.
- [ ] Production path unchanged: `deploy.yml` not modified, the live static site is still served, no Worker/domain binding added.
- [ ] Work executed under `htu-ui-framework` (stack/scaffold) and `htu-brand-conformance` (mark).
- [ ] PR opens against `main` and references #15 as "Phase 1 of."

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Framework | Static HTML only | + React 19 + Vite + Hono scaffold (additive, isolated) |
| Routes | Single static landing | + six branded route stubs in the scaffold |
| Mark in the new scaffold | n/a | Cube master |
| Production deploy | Cloudflare Pages static (`deploy.yml`) | Unchanged this phase |
| Governing method | Hand-written prose in #15 | `htu-ui-framework` + `htu-brand-conformance` skills |
| Open questions | Does adding `package.json` change Cloudflare Pages' production build auto-detection? If so, isolate the scaffold (subdir) or pin the prod build command. |

## Files created / updated

```
UzorAI/uzorai.com/package.json                         (UPDATED — React19 + Vite + Hono + wrangler deps/scripts)
UzorAI/uzorai.com/vite.config.ts                       (NEW)
UzorAI/uzorai.com/tsconfig.json                        (NEW)
UzorAI/uzorai.com/wrangler.toml                        (NEW — Worker name uzorai; NO custom-domain routes this phase)
UzorAI/uzorai.com/src/server/index.ts                  (NEW — Hono entry, SPA fallback)
UzorAI/uzorai.com/src/client/main.tsx                  (NEW)
UzorAI/uzorai.com/src/client/App.tsx                   (NEW — router over six routes)
UzorAI/uzorai.com/src/client/routes/Home.tsx           (NEW — branded stub)
UzorAI/uzorai.com/src/client/routes/Platform.tsx       (NEW — branded stub)
UzorAI/uzorai.com/src/client/routes/Governance.tsx     (NEW — branded stub)
UzorAI/uzorai.com/src/client/routes/Docs.tsx           (NEW — branded stub)
UzorAI/uzorai.com/src/client/routes/Pricing.tsx        (NEW — branded stub)
UzorAI/uzorai.com/src/client/routes/Contact.tsx        (NEW — branded stub)
UzorAI/uzorai.com/src/client/components/Header.tsx     (NEW — cube mark)
UzorAI/uzorai.com/src/client/components/Footer.tsx     (NEW — узор line)
UzorAI/uzorai.com/src/client/components/Nav.tsx        (NEW — six routes)
UzorAI/uzorai.com/src/client/brand/tokens.css          (NEW — graphite/mint)
UzorAI/uzorai.com/src/client/brand/uzor-mark.svg       (NEW — sourced from branding/uzor-logo.svg master)
# UNCHANGED this phase (do NOT modify): production index.html, .github/workflows/deploy.yml,
# custom-domain bindings, branding/* sources, public/* asset kits
```

## Models Applied

- **#2 Decision Tree** — phase-scoping decisions mapped with chosen option, rationale, and triggers for change.
- **#11 Progressive Disclosure** — the full port is staged across phases; Phase 1 ships only the buildable shell, deferring content, cutover, and decommission to keep each run inside the cap.
- **#15 Inversion / Premortem** — failure modes (run timeout, build break, Cloudflare Pages production-build disruption, stale cube vectors) enumerated and each given a mitigation in Trigger-for-change / Open questions / Rollback.
- **#8 Swiss Cheese** — layered safety gates: branch isolation → local green build → PR review → no production deploy this phase, so no single failure can ship a broken site.

(Governing skills, separate from the model taxonomy: `htu-ui-framework` mandates the stack/scaffold/conventions; `htu-brand-conformance` mandates the cube mark by construction.)

## Migration Plan

1. **Branch** off `main`. No production impact.
2. **Scaffold** — set up the React 19 + Vite + Hono project per the Final Spec (`package.json`, `vite.config.ts`, `tsconfig.json`, `wrangler.toml`, `src/`) from this spec's conventions (htu.io reference only, not a hard dependency); add the six route stubs, Header/Footer/Nav, design tokens, and the cube mark from `branding/uzor-logo.svg`. Keep the scaffold isolated from the production `index.html`.
3. **Build** — `npm run build` green locally; all six routes render; no console errors.
4. **PR** against `main`, referencing #15 (Phase 1 of). `deploy.yml` is untouched, so the merge does not alter the live site.

### Rollback

- The work is additive on an isolated branch; `main` is unaffected until merge.
- `deploy.yml` and the production build path are not modified, so even post-merge the live static site is unaffected.
- If any regression ships, `git revert` the merge commit. No domain/DNS action is involved in this phase, so there is no cutover to undo.

## Legal triggers

None. Phase 1 adds the standard HTU stack (already licensed and in production on htu.io and streettt.com) and reuses the existing in-repo Uzor cube asset kit. No production deploy, no new third-party data processing, PII, contracts, or royalties. The standing UzorAI trademark-clearance item is tracked separately and is unaffected by an additive scaffold.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Scaffold config + Hono server | None | 0.75 hours |
| App shell: six stubs + components + cube mark + tokens | None | 1 hour |
| Local build verify (`npm run build`, render check) | None | 0.25 hours |
| Total | | 2 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Scaffold config + Hono server | None | 1 hour |
| App shell build | None | 1.25 hours |
| Local build verify | None | 0.25 hours |
| Total | | 2.5 hours |

### Assumptions

- The scaffold is built from this spec's conventions and file list; zi007lin/htu.io is a reference only and is NOT required to be readable by the runner (it may be cross-org-inaccessible).
- The cube asset kit ships in-repo (`branding/uzor-logo.svg` master + avatar/app-icon/favicon SVGs); no vectorization needed.
- The scaffold is isolated so Cloudflare Pages' production build auto-detection is unaffected; `deploy.yml` is not modified this phase.
- No deploy and no domain binding in Phase 1; cutover is Phase 4 of #15.
- implw run cap is 20 minutes — if this scaffold approaches it, split into Phase 1a (config + Hono server) and Phase 1b (app shell + routes).

### Actuals (filled post-execution)

| Phase | Wait dependency | Estimate | Actual | Delta |
|---|---|---|---|---|
| Scaffold config + Hono server | None | 0.75 hours | TBD | TBD |
| App shell: six stubs + components + cube mark + tokens | None | 1 hour | TBD | TBD |
| Local build verify | None | 0.25 hours | TBD | TBD |
| Total | | 2 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** refactor
- **Evaluated at:** 2026-06-13T03:24:21.169Z
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
- **Source issue:** UzorAI/uzorai.com#17, created 2026-06-13T03:24:21Z (title: `REFACTOR: uzorai.com HTU framework port — Phase 1 (scaffold)`).
- **Why materialized:** no `issues/*.scored.md` file resolved from the `_Source:` footer (Path A absent); the issue body carried all three inline-scored signals (`## ZAI Spec Score` heading, `**Score:** 10/10`, `**Passed:** YES`), so the body is authoritative and is written to disk per §4.
- **Filename derivation (§4.1):** from the `_Source: 2026-05-09__refactor__inline.md_` footer → `issues/2026-05-09__refactor__inline.scored.md`. No collision (no prior file), so no `-v2`/`-v3` suffix applied (§4.2).
- **Integrity re-score (§3):** re-scored via HTU Skills `score_spec` (`spec_type=refactor`, rubric 1.5.0) → **10/10 PASS**, matching the stored score block. No divergence.
- **Gate 1 (§4 classifier):** `refactor` ⇒ HOLD; run is headless (stdin not a TTY) and issue #17 carries no `needs-approval` label ⇒ cleared as **solo-operator approved (channel: `label-absent`, attributed to daniel-silvers)**. PR review by daniel-silvers is still required to merge.
- The working copy used for implementation has the score block stripped; the score block is retained in this materialized file.
