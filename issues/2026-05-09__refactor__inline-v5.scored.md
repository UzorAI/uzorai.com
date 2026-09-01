# REFACTOR: Harden implw runner and repository trust boundaries

Parent: UzorAI/uzorai.com#82

## Intent

Harden implw, Claude configuration, the self-hosted runner boundary, repository secret controls, and GitHub Actions supply chain for UzorAI/uzorai.com. Reject untrusted or mutable issue/spec inputs and prevent inherited operator credentials or persistent workspace state from widening autonomous authority. Preserve governed ZAI approval semantics and the existing single Worker topology.

## Decision Tree

| Decision | Options | Chosen | Why |
|---|---|---|---|
| D1: How is implementation input trusted? | Trust issue number/body; local file only; canonical live issue plus immutable approval/hash checks | Canonical live issue plus immutable checks | Public issue content is untrusted and may be edited or replayed |
| D2: How are autonomous credentials provided? | Inherit runner auth; pass broad PAT; short-lived scoped token with deliberate checkout persistence | Short-lived scoped token and no inherited host auth | Limits cross-repository and host blast radius |
| D3: How are agent permissions handled? | bypassPermissions and broad host paths; interactive-only; least privilege with explicit bounded commands | Least privilege | CI must fail closed without granting arbitrary filesystem/network authority |
| D4: How is workspace state handled? | Reuse persistent workspace; clean deterministic isolated workspace; destructive host cleanup | Isolated workspace with deterministic cleanup | Prevents poisoned checkout and cross-run persistence |
| D5: How are actions trusted? | Mutable tags; immutable commit SHAs; no third-party actions | Immutable commit SHAs where compatible | Prevents tag retargeting |

### Trigger for change

Revisit only if GitHub changes workflow token semantics, the runner is rebuilt/isolated, or the governed ZAI contract changes.

## Final Spec

Modify only repository workflow/agent/configuration/test files to validate issue input as a strict decimal identifier; verify same-repository live issue state, labels, author/approval, freshness, and content hash before execution; reject forks, edits, stale/replayed artifacts, symlinks, and path traversal; scope job permissions and checkout credentials; prevent inherited gh auth, Claude, npm, SSH, and unrelated host-path access; clean the workspace deterministically; pin actions; and add regression fixtures/static assertions. Do not rotate credentials, rebuild the runner, deploy, merge, or change DNS/routes.

## Acceptance Criteria

- [ ] Malformed, cross-repository, edited, stale, unapproved, replayed, or prompt-injection fixture inputs are rejected before agent execution.
- [ ] Workflow and job permissions are least privilege; checkout credential persistence and cleanup are explicit; no autonomous step inherits persistent operator PAT or unrelated host paths.
- [ ] .claude/settings.json contains no bypassPermissions or broad developer/runner path grants, and .gitignore covers environment, key, credential, state, database, log, and agent temporary files while preserving .env.example.
- [ ] Third-party actions are immutable or documented exceptions; static tests verify no unsafe expression interpolation.
- [ ] Existing npm test/build pass plus new workflow/input/credential-isolation fixtures pass.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| implw input | Issue body fetched by number and passed to Claude | Canonical, approved, fresh, hash-bound issue accepted only after fail-closed validation |
| runner auth | Persistent operator gh auth and broad agent permissions | Explicit scoped auth, isolated workspace, no inherited host credentials |
| agent config | bypassPermissions and broad paths | Least-privilege repository-scoped settings |
| Open questions | Exact runner credential inventory requires human inspection | resolved on merge |

## Files created / updated

```
.github/workflows/implw.yml
.github/workflows/pr-validation.yml
.claude/settings.json
.gitignore
.github/CODEOWNERS
scripts/security/assert-workflow-hardening.mjs
test/fixtures/security/*
```

## Models Applied

- #2 Decision Tree — fail closed on missing trust evidence.
- #1 Game Theory Cooperative Model — separate author, approver, runner operator, reviewer, and deployer powers.
- #15 Inversion / Premortem — edited specs, poisoned dependencies, and symlinks must not persist or gain authority.
- #16 Mechanism Design — make safe rejection the automatic path.

## Migration Plan

1. Add static validators and malicious fixtures.
2. Change workflow input and artifact validation.
3. Reduce permissions and remove inherited credentials/path grants.
4. Pin actions and add protected-path ownership.
5. Run all verification on a branch and open a PR; no direct main push.

### Rollback

Revert the PR. Do not delete runner files or credentials; any runner rebuild or rotation is human-operated.

## Legal triggers

None.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Validator and fixtures | None | 4 hours |
| Workflow/configuration hardening | Review | 6 hours |
| **Total** | — | 10 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation and CI | CI runs | 1–2 days |
| **Total** | — | 1–2 days |

### Assumptions

- Existing ZAI/implw contract remains available and runner credentials are not changed by this spec.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| All phases | 1–2 days | TBD | TBD |
| **Total** | 1–2 days | TBD | TBD

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** refactor
- **Evaluated at:** 2026-08-31T09:33:34.499Z
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
- **Source issue:** UzorAI/uzorai.com#83, created 2026-09-01T17:47:44Z (title: `REFACTOR: Harden implw runner and repository trust boundaries (EPIC #82)`).
- **Why materialized:** the `_Source: 2026-05-09__refactor__inline.md_` footer derives `issues/2026-05-09__refactor__inline.scored.md`, but that path and its `-v2`/`-v3`/`-v4` collision slots are already occupied by unrelated specs (issues #17, #19, #21, #23 — the four phases of the HTU framework port under REFACTOR #15). Path A therefore does NOT resolve to this spec despite the identical footer string — verified by reading each occupied file's own provenance/content and confirming none references issue #83 or this spec's subject matter. The issue #83 body carried all three inline-scored signals (`## ZAI Spec Score` heading, `**Score:** 10/10`, `**Passed:** YES`), so the body is authoritative and is written to disk per §4.
- **Filename derivation (§4.1) + collision (§4.2):** derived name `issues/2026-05-09__refactor__inline.scored.md` collides with Phase 1/2/3/4 (`-v2`, `-v3`, `-v4` all taken) → next available `-v5` suffix applied → `issues/2026-05-09__refactor__inline-v5.scored.md`. (Root cause: this spec's `_Source:` footer is unrelated boilerplate text shared with four prior, unrelated specs.)
- **Integrity re-score (§3):** re-scored via HTU Skills `score_spec` (`spec_type=refactor`, rubric 1.5.0) → **10/10 PASS**, matching the stored score block. No content/score divergence.
- **Gate 1 (§4 classifier):** `refactor` ⇒ HOLD; run is headless (self-hosted runner, stdin not a TTY) and issue #83 carries no `needs-approval` label (only `refactor`) ⇒ cleared as **solo-operator approved (channel: `label-absent`, attributed to daniel-silvers)**. PR review by daniel-silvers is still required to merge.
- The working copy used for implementation has the score block stripped; the score block is retained in this materialized file.
