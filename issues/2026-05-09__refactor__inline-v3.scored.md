# REFACTOR: uzorai.com HTU framework port — Phase 3 (preview deploy + verify)

**Repo:** UzorAI/uzorai.com
**Umbrella:** Phase 3 of REFACTOR #15 (`UzorAI/uzorai.com`)
**Depends on:** Phase 2 (content + brand) merged
**Skills:** executes under `htu-ui-framework` + `htu-brand-conformance`
**Execution mode:** step-by-step

## Intent

Execute Phase 3 of REFACTOR #15: deploy the Phase 1–2 Hono Worker to a non-production `workers.dev` route and verify it, with no change to the production site. The live uzorai.com keeps serving the existing Cloudflare Pages static build; this phase stands up the new React 19 + Vite + Hono app at a preview URL (`uzorai.<account>.workers.dev`) so all six routes, assets, cube favicons, and the manifest can be validated end-to-end before any cutover. Add a preview deploy path (`wrangler deploy` / a separate preview workflow) without modifying the production `deploy.yml` or binding any custom domain. Execute under `htu-ui-framework` and `htu-brand-conformance`. No apex / uzor.ai / www binding, no Pages decommission, no removal of the live static site — those are Phase 4. Requires a Cloudflare API token (Workers:Edit) and account id available to the runner (loaded via its `.env`).

## Decision Tree

| Decision | Options | Choice | Why |
|---|---|---|---|
| Preview target | `workers.dev` route / temporary subdomain | `workers.dev` | No DNS change; fully isolated from production |
| Deploy mechanism | manual `wrangler deploy` / separate preview workflow | preview workflow (runner can push `.github/workflows/*`) | Repeatable; doesn't touch prod `deploy.yml` |
| Production `deploy.yml` | switch to Worker now / leave untouched | leave untouched | The deploy switch is Phase 4 |
| Custom domains | bind now / none | none | Domain cutover is Phase 4 |
| Credentials | reuse runner env creds / mint new | reuse runner env | The runner's `.env` already carries the CF token + account id |
| Verify scope | smoke check / full routes + assets + manifest | full | Catch issues at preview, before the disruptive cutover |

### Trigger for change

Re-scope if: (a) the CF token lacks `Workers:Edit` or the account id is missing → HALT with the missing-credential error, don't fake a deploy; (b) the preview reveals broken routes/assets/branding → fix in a Phase 2 follow-up before proceeding to cutover; (c) `workers.dev` subdomains are disabled on the account → deploy to a temporary preview subdomain instead; (d) Phase 2 is not merged → block (this phase deploys Phase 2's output).

## Final Spec

Deploy the Worker built by Phases 1–2 to a preview URL and validate it; production stays on Pages.

- `wrangler.toml` — confirm Worker name `uzorai` and the static-assets binding for the Vite build output; **no** custom-domain routes (preview only).
- Deploy via `wrangler deploy` to `uzorai.<account>.workers.dev` (or an account preview route). Optionally add `.github/workflows/deploy-worker-preview.yml` (manual `workflow_dispatch`) so the preview deploy is repeatable; the production `deploy.yml` (Pages) is NOT modified.
- Verify on the preview URL: all six routes return 200, navigation works, no console errors, cube favicons/app-icons render in the tab and the manifest resolves, hero shows the cube mark.
- Credentials required in the runner environment: `CLOUDFLARE_API_TOKEN` (Workers:Edit) and `CLOUDFLARE_ACCOUNT_ID`, provided via the self-hosted runner's `.env`. `wrangler` reads them from env at deploy time.

Out of scope (Phase 4): binding `uzorai.com` / `uzor.ai` / `www`, switching `deploy.yml` to the Worker, retiring the static `index.html` + weave, decommissioning Pages.

## Acceptance Criteria

- [ ] Worker deploys to `uzorai.<account>.workers.dev` (or an account preview route).
- [ ] All six routes return 200 on the preview; navigation works; no console errors.
- [ ] Cube favicons, app-icons, and manifest resolve correctly on the preview (tab icon + manifest).
- [ ] Production unchanged: uzorai.com still served by Pages; `deploy.yml` not modified; no custom-domain binding.
- [ ] CF API token (Workers:Edit) + account id present in the runner env (or the run HALTs with a clear missing-credential error).
- [ ] Executed under `htu-ui-framework` + `htu-brand-conformance`.
- [ ] PR references #15 (Phase 3 of); depends on Phase 2 merged.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| New app availability | builds locally only (Phase 2) | deployed + verified at a `workers.dev` preview |
| Preview deploy path | none | `wrangler deploy` / optional preview workflow |
| Production deploy | Pages static (`deploy.yml`) | unchanged this phase |
| Custom domains | bound to Pages | unchanged this phase |
| Governing method | hand-written prose in #15 | htu-ui-framework + htu-brand-conformance |
| Open questions | Exact `workers.dev` route naming for the account; keep the preview deploy workflow after cutover or remove it in Phase 4? |

## Files created / updated

```
UzorAI/uzorai.com/wrangler.toml                              (UPDATED — confirm assets binding; NO custom-domain routes)
UzorAI/uzorai.com/.github/workflows/deploy-worker-preview.yml (NEW — optional, manual workflow_dispatch; runner-side push)
# UNCHANGED this phase (do NOT modify): .github/workflows/deploy.yml (prod Pages),
# production index.html, custom-domain bindings, branding/* + public/* asset sources
```

## Models Applied

- **#2 Decision Tree** — preview-target, deploy-mechanism, and credential decisions mapped with rationale and triggers.
- **#11 Progressive Disclosure** — the app is exposed at a preview URL first; the disruptive apex cutover is deferred to Phase 4.
- **#15 Inversion / Premortem** — failure modes (missing CF creds, broken preview, disabled `workers.dev`) enumerated with HALT/fix paths.
- **#8 Swiss Cheese** — layered gates: preview deploy → full verify → PR review → still no production cutover, so a bad build can't reach users.

(Governing skills: `htu-ui-framework` for the Worker deploy convention; `htu-brand-conformance` for verifying the cube mark on the preview.)

## Migration Plan

1. **Branch** off `main` (after Phase 2 merged). No production impact.
2. **Configure** the preview deploy (`wrangler.toml` assets binding; optional `deploy-worker-preview.yml`). Don't touch `deploy.yml`.
3. **Deploy** the Worker to `workers.dev`.
4. **Verify** all six routes, assets, favicons, and manifest on the preview URL.
5. **PR** against `main`, referencing #15 (Phase 3 of). Production Pages deploy untouched.

### Rollback

- The preview Worker is throwaway: `wrangler delete` the preview Worker to remove it; production is never involved.
- No `deploy.yml`, domain, or DNS change in this phase, so there is nothing in production to roll back.
- Git: additive on a branch; `git revert` the merge if the preview workflow needs removing.

## Legal triggers

None. Phase 3 deploys to a private preview URL using the existing Cloudflare account credentials and the in-repo asset kit. No production change, no new third-party data processing, PII, contracts, or royalties.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Configure preview deploy | Phase 2 merged | 0.5 hours |
| Deploy Worker to workers.dev | CF API token (Workers:Edit) | 0.25 hours |
| Verify routes + assets + manifest | None | 0.5 hours |
| Total | | 1.25 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Configure preview deploy | Phase 2 merged | 0.5 hours |
| Deploy Worker to workers.dev | CF API token | 0.5 hours |
| Verify routes + assets + manifest | None | 0.5 hours |
| Total | | 1.5 hours |

### Assumptions

- Phase 2 is merged; the app builds green.
- A Cloudflare API token with `Workers:Edit` and the account id are available in the runner environment (loaded via the self-hosted runner's `.env`); `wrangler` reads them at deploy time.
- `workers.dev` subdomains are enabled on the account.
- No custom-domain binding and no `deploy.yml` change in Phase 3.
- implw run cap is 20 minutes — a deploy + verify fits comfortably; if credential setup balloons, HALT rather than improvise.

### Actuals (filled post-execution)

| Phase | Wait dependency | Estimate | Actual | Delta |
|---|---|---|---|---|
| Configure preview deploy | Phase 2 merged | 0.5 hours | TBD | TBD |
| Deploy Worker to workers.dev | CF API token | 0.25 hours | TBD | TBD |
| Verify routes + assets + manifest | None | 0.5 hours | TBD | TBD |
| Total | | 1.25 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** refactor
- **Evaluated at:** 2026-06-13T05:52:38.301Z
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


## Provenance (auto-materialized)

- **Materialized by:** `implw` (Path B — inline-scored issue body)
- **Source issue:** UzorAI/uzorai.com#21
- **Source footer:** `2026-05-09__refactor__inline.md` (footer collides across phase issues; base + `-v2` already hold Phase 1 / Phase 2, so this Phase 3 spec materializes under the `-v3` collision suffix)
- **Integrity re-score:** 10/10 PASS · rubric 1.5.0 · matches the inline score block
- **Gate 1:** refactor → HOLD; headless run, `needs-approval` label absent → solo-operator approved (`label-absent`, attributed to daniel-silvers)
