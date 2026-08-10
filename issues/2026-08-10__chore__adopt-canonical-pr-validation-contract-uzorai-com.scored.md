# CHORE: Adopt the canonical PR-validation contract (thin caller + PR template) for uzorai.com

## Intent

`UzorAI/uzorai.com` (the live public site repo) has neither a PR template nor any PR-validation CI check. Adopt the canonical contract established in htu-foundation (CHORE htu-foundation#351, PR #352) — a thin caller referencing htu-foundation's reusable `workflow_call` workflow, plus a PR template using the canonical 4-status (`automated`/`manual`/`none`/`blocked`) `## Deployment` format — starting in observe-only mode. This re-files a CHORE mistakenly filed against `zi007lin/uzorai.com` (a stale, private smoke-test seed repo already dropped from the implw/deploy allowlists) instead of this, the real repo; the mis-filed issue (`zi007lin/uzorai.com#3`) is closed with a pointer to this one.

## Action

1. Add `.github/pull_request_template.md` using the canonical 4-status format, mirroring htu-foundation's template structure exactly.
2. Add `.github/workflows/pr-validation.yml` as a thin caller: `uses: zi007lin/htu-foundation/.github/workflows/pr-validation.yml@<pinned-ref>`, with `test_command: "npm test"` (this repo's actual `node scripts/assert-no-translate.mjs` script — an i18n no-untranslated-text assertion, not a conventional test runner, but is what `npm test` runs here), `typecheck_command: "npx tsc --noEmit"` (this repo's `build` script already runs `tsc --noEmit`, so a dedicated typecheck command is available here, unlike htu.io#330), `blocking: false`.
3. Open a test PR against uzorai.com and confirm it receives the canonical "PR Validation (canonical, htu-foundation)" comment, running in observe-only mode (does not block merge).
4. Confirm htu-foundation's conformance check (`src/validation/conformanceCheck.js`) reports uzorai.com as `conformant` after this merges — not `not_adopted`.
5. After an observe-only bake period with real PR traffic, a separate later decision (not this CHORE) records approval and flips `blocking: true`.

## Acceptance Criteria

- [ ] `.github/pull_request_template.md` exists with exactly one canonical `## Deployment` heading.
- [ ] `.github/workflows/pr-validation.yml` exists, containing only a `workflow_call` reference to the canonical htu-foundation workflow at a pinned (non-`main`) ref — zero copied validator logic.
- [ ] A test PR against uzorai.com receives the canonical validation comment, running in observe-only mode.
- [ ] htu-foundation's conformance check reports uzorai.com as `conformant`, confirmed by re-running it after this merges.

## Files

```
.github/pull_request_template.md   # NEW — currently missing entirely
.github/workflows/pr-validation.yml # NEW — thin caller; no PR-validation workflow exists today (deploy.yml and implw.yml are the only existing workflows)
```

## Legal triggers

None.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Add PR template | None | 20 min |
| Add thin-caller workflow | None | 20 min |
| Open + verify test PR | CI run on the test PR | 20 min |
| **Total** | — | ~1 hr |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation + verification | CI run | Same day |
| Observe-only bake before considering blocking flip | Real PR traffic | 1-2 weeks (separate, later decision) |
| **Total** | — | Same day for this CHORE; blocking flip is separate |

### Assumptions

- htu-foundation's canonical workflow has a pinned release tag available (`pr-validation-contract-v0.1.0`, confirmed to already exist).
- `UzorAI/uzorai.com` is owned by the `UzorAI` organization, not the `zi007lin` user account. `htu-foundation`'s Actions cross-repo access is currently set to `user` (accessible from repos owned by `zi007lin`), which does **not** cover org-owned repos — so this CHORE's test-PR verification step (Action item 3) may surface a distinct, more fundamental access-denial failure than the `startup_failure` already documented on zzv-skills#675/PR #676 and htu.io#330/PR #331 (both `zi007lin`-owned). If confirmed, resolving org-level access is a separate follow-up beyond this CHORE's scope — not blocking, since the caller runs observe-only regardless.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Add PR template | 20 min | 5 min | -15 min — verbatim copy of htu-foundation's canonical template. |
| Add thin-caller workflow | 20 min | 5 min | -15 min — release tag already existed; `test_command`/`typecheck_command` confirmed from `package.json` (`"test": "node scripts/assert-no-translate.mjs"`, `"build"` includes `tsc --noEmit`). |
| Open + verify test PR | 20 min | TBD | This PR itself serves as the test PR — self-trigger evidence pending review. Per the Assumptions note above, this org-owned repo is expected to hit a distinct access-denial mode from `htu-foundation`'s `user`-level (not org-level) Actions access grant, on top of the `startup_failure` already seen on the two `zi007lin`-owned sibling adoptions (zzv-skills#675/PR #676, htu.io#330/PR #331). Not re-diagnosed here. |
| **Total** | ~1 hr | ~10 min (implementation) | Known, documented platform-access gap applies here (likely more severely, being org-owned) — see Assumptions. |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-08-10T05:00:25.743Z
- **Score:** 6/6
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| action | PASS |
| acceptance_criteria | PASS |
| files | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

## Provenance (auto-materialized)

- **Source:** inline-scored issue body — UzorAI/uzorai.com#62 (re-filed from the mis-filed zi007lin/uzorai.com#3)
- **Materialized at:** 2026-08-10
- **Filename derivation:** derived from issue (§4.1 rule 2) — no `_Source:` footer pointed to a resolvable local file; filename built from the issue's creation UTC date (2026-08-10), the `CHORE:` title-prefix type, and a kebab-case slug truncated to ~60 characters.
- **Acquisition path:** MCP → GitHub Issue → implw acquisition (Path B, inline-scored).

**Note on known platform gap:** the thin caller's own self-trigger check is expected to fail — either with the same `startup_failure` documented on zzv-skills#675/PR #676 and htu.io#330/PR #331, or a distinct access-denied failure specific to this repo being `UzorAI`-org-owned rather than `zi007lin`-user-owned (htu-foundation's current Actions access grant is `user`-level only). Not re-diagnosed here. Non-blocking (`blocking: false`).
