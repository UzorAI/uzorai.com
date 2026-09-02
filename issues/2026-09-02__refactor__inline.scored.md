# REFACTOR: Autonomous Workflow, Runner, Governance, and Repository Supply-Chain Hardening

Part of #82.

## Intent

Harden the autonomous implementation path in `UzorAI/uzorai.com` so public issue, pull-request, repository, fork, and dependency content remains untrusted until it is bound to canonical same-repository approval evidence. Reduce the credential and workspace blast radius of self-hosted execution while preserving the approved one-repository, one-Worker topology and the existing governed review path. This child does not authorize credential inspection beyond safe metadata, credential disclosure or rotation, runner rebuilding, direct pushes, merges, deployments, workflow dispatch, DNS or route changes, production-data mutation, paid infrastructure, or governance bypass.

## Decision Tree

| Condition | Decision | Required evidence or response |
|---|---|---|
| Issue is canonical, live, same-repository, approved, scored PASS, fresh, and bound to immutable content | Permit the existing governed implementation path to continue to its next human gate | Repository identity, issue identity, approval identity, score state, immutable body/hash, and freshness all match |
| Any identity, approval, score, freshness, hash, repository, or authorization evidence is missing or mismatched | Reject before autonomous code execution | Deterministic reason; no checkout of attacker-controlled refs and no provider invocation |
| Input originates from a fork, cross-repository reference, edited/stale issue, replay, malformed payload, or injected body/instructions | Reject | Record redacted diagnostic evidence without executing supplied instructions |
| Autonomous work needs an operator PAT, persistent host credential, broad host path, or unrestricted shell capability | Stop at a human authorization boundary | Do not inherit, inspect, copy, disclose, rotate, or consume that authority |
| A workflow/action dependency is mutable or workspace state cannot be deterministically cleaned | Fail closed | Require immutable pinning or a clean isolated workspace before continuing |

### Trigger for change

EPIC #82 confirmed that the current public-repository autonomous path needs explicit canonical-input binding, least-privilege execution, deterministic cleanup, immutable supply-chain references, protected-path controls, and adversarial regression fixtures before governed implementation is safe.

## Final Spec

Refactor the repository's autonomous implementation workflow and Claude configuration around a fail-closed trust boundary:

1. Acquire the complete live issue only from the canonical `UzorAI/uzorai.com` repository and bind the run to immutable repository, issue, approval, score, body, and hash evidence before any provider invocation.
2. Reject edited, stale, replayed, malformed, cross-repository, fork-derived, injected, or mismatched inputs. Treat issue bodies, PR bodies, repository instructions, filenames, symlinks, dependency scripts, and provider prompts as untrusted data rather than authority.
3. Apply least-privilege GitHub permissions; make checkout credential persistence deliberate; prevent the autonomous process from inheriting operator PATs, persistent Claude sessions, npm/Cloudflare/SSH material, or unrelated host credentials and paths.
4. Use a dedicated workspace with deterministic pre/post-run cleanup that refuses traversal and symlink escapes. This is repository workflow hardening only, not authorization to rebuild or destructively clean the self-hosted runner.
5. Pin third-party GitHub Actions to immutable full commit SHAs while retaining human-readable version comments, and use clean-lockfile installation with lifecycle-script exposure constrained to the repository's verified requirements.
6. Remove `bypassPermissions`, broad host-path access, and unnecessary shell capabilities from repository Claude settings. Expand `.gitignore`, CODEOWNERS, and protected-path review coverage for local secrets, runner artifacts, workflow files, Claude settings, and governance commands.
7. Add static assertions and adversarial fixtures for public-content injection, stale/replayed approval, fork and cross-repository payloads, symlink/path traversal, poisoned instruction files, mutable action references, credential isolation, and workspace cleanup.
8. Preserve existing human review and approval gates. No test may require viewing secret values; use synthetic canaries and safe presence/absence metadata only.

The implementation remains PR-scoped and stops before merge, deployment, workflow dispatch, credential operations, runner rebuild, DNS/routes, or production changes.

## Acceptance Criteria

- [ ] `implw` accepts only a complete live canonical `UzorAI/uzorai.com` issue whose same-repository identity, live approval, ZAI PASS state, immutable body/hash, and freshness all match the captured run authority.
- [ ] Missing, edited, stale, replayed, malformed, injected, cross-repository, and fork-derived inputs fail closed before provider execution or attacker-controlled checkout.
- [ ] Workflow permissions are least privilege, checkout credential persistence is explicit, and autonomous processes cannot inherit operator PATs or persistent Claude, npm, Cloudflare, SSH, or unrelated host credentials.
- [ ] Workspace setup and cleanup are deterministic, bounded to the job workspace, and regression-tested against symlink and path traversal without rebuilding or destructively cleaning the runner.
- [ ] Third-party Actions are pinned to immutable full SHAs with readable version comments, and clean-lockfile installation does not expand dependency lifecycle-script authority.
- [ ] Repository Claude settings contain no `bypassPermissions`, broad host-path access, or unnecessary shell capability.
- [ ] `.gitignore`, CODEOWNERS, and protected-path controls cover secrets, runner artifacts, workflows, governance commands, and Claude configuration.
- [ ] Tests cover malicious issue/PR/input text, prompt injection, poisoned instructions, forks, replay/TOCTOU, symlink/path traversal, mutable dependency references, credential isolation, and cleanup.
- [ ] Existing typecheck, build, unit tests, and workflow static assertions pass without reading or printing credential values.
- [ ] The change remains a reviewable PR and performs no merge, deployment, workflow dispatch, DNS/route change, production-data mutation, credential operation, runner rebuild, paid-service action, or governance bypass.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| Implementation authority | Workflow inputs and repository content can reach autonomous execution without one explicit immutable evidence binding | Canonical same-repository live approval and PASS evidence is bound to immutable issue content before execution |
| Failure behavior | Invalid or stale trust evidence may be handled inconsistently | Missing or mismatched identity, approval, freshness, hash, host, or authorization fails closed with deterministic reasons |
| Credentials | Checkout/provider/host credential inheritance has an unnecessarily broad potential blast radius | Least-privilege permissions, explicit checkout auth handling, and synthetic isolation tests prevent inheritance |
| Workspace | Persistent runner state can cross job boundaries | Job workspace setup and cleanup are deterministic, path-bounded, and traversal-tested |
| Supply chain | Mutable action references and dependency execution expand trust | Actions use immutable SHAs and clean-lockfile/static checks enforce the intended dependency boundary |
| Repository controls | Claude settings and sensitive paths need stronger controls | Broad permissions are removed and sensitive configuration paths receive ignore/ownership/review coverage |
| Open questions | Exact runner-level rebuild/isolation policy and credential remediation | Reserved for separate explicit human inspection and authorization; not changed by this child |

## Files created / updated

```text
.github/workflows/implw.yml
.github/workflows/pr-validation.yml
.github/CODEOWNERS
.gitignore
.claude/commands/implw.md
.claude/settings.json
package.json
package-lock.json
scripts/security/
test/ or tests/ (targeted workflow, governance, traversal, replay, and credential-isolation fixtures)
```

Exact test filenames may follow existing repository conventions, but implementation must remain within these workflow, governance, repository-control, security-script, dependency-manifest, and test surfaces. Application presentation, DNS, Worker routes, and production data are excluded.

## Models Applied

- **#1 Game Theory Cooperative:** Separate public contributors, the autonomous provider, runner operators, reviewers, and deploy authority so no untrusted or autonomous actor holds the complete execution-and-release chain.
- **#2 Decision Tree:** The table above makes every missing identity, approval, freshness, hash, repository, or authorization signal select deterministic rejection.
- **#15 Inversion / Premortem:** Fixtures assume an issue changes after approval, a fork supplies an injected payload, a symlink escapes the workspace, and a dependency attempts credential exfiltration.
- **#6 Reversibility:** All changes are PR-scoped repository configuration and tests; the prior behavior can be restored by reverting the eventual PR, while credentials, runner rebuilds, deployment, and DNS remain untouched.

## Migration Plan

1. Capture current workflow permissions, action references, checkout behavior, Claude settings, protected paths, and existing test contracts using safe repository metadata only.
2. Add failing static and adversarial fixtures for canonical binding, stale/replayed/injected inputs, fork/cross-repository rejection, path/symlink escape, mutable actions, credential canaries, and deterministic cleanup.
3. Introduce canonical live issue acquisition and immutable approval/PASS/body-hash verification before provider execution.
4. Reduce workflow and checkout permissions, isolate provider environment/workspace access, and implement bounded deterministic cleanup.
5. Pin Actions, constrain dependency installation, remove broad Claude permissions, and strengthen ignore/ownership/review controls.
6. Run typecheck, build, unit tests, security assertions, and workflow static validation locally or in the normal non-dispatched review process.
7. Open the governed implementation PR for independent review and stop at approval/merge/deployment gates.

### Rollback procedure

Revert the eventual hardening PR as a single reviewable rollback if legitimate governed runs cannot proceed. Do not restore behavior by bypassing approval checks, broadening credentials, rebuilding the runner, dispatching workflows, or changing deployment/DNS. Preserve failing evidence and require human approval for any follow-up affecting credentials or runner policy.

## Legal triggers

None. This refactor does not introduce regulated-data processing, payments, licensing changes, credential disclosure, or production-data mutation.

## Work Estimate

### Active operator time

| Phase | Estimate |
|---|---:|
| Trust-boundary fixtures and canonical binding | 4 hours |
| Permission, workspace, and supply-chain hardening | 4 hours |
| Repository controls, validation, and review preparation | 3 hours |
| Total | 11 hours |

### Wall-clock time

| Wait dependency | Estimate |
|---|---:|
| Local dependency install and complete validation | 1-2 hours |
| Independent security review and governance gates | 1-3 working days |
| CI feedback after an authorized PR is opened | 1-4 hours |
| Total | 2-4 working days |

### Assumptions

- Current repository workflows and tests remain the authoritative compatibility baseline.
- Synthetic canaries can prove credential isolation without inspecting any real secret value.
- Existing runner infrastructure remains in place; runner rebuild/isolation policy is separately authorized work.
- No workflow dispatch, deployment, merge, credential operation, DNS/route change, or paid infrastructure is needed to implement this PR-scoped refactor.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---:|---:|---:|
| Trust-boundary fixtures and canonical binding | 4 hours | TBD | TBD |
| Permission, workspace, and supply-chain hardening | 4 hours | TBD | TBD |
| Repository controls, validation, and review preparation | 3 hours | TBD | TBD |
| Total | 11 hours | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** refactor
- **Evaluated at:** 2026-09-02T05:28:23.863Z
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

## Provenance (auto-materialized)

- **Acquired from:** GitHub issue [`UzorAI/uzorai.com#87`](https://github.com/UzorAI/uzorai.com/issues/87) (inline-scored body, Path B).
- **Materialized:** 2026-09-02 by the `implw` autonomous run for issue #87.
- **Note on `_Source:` footer:** the issue body's own `_Source: 2026-05-09__refactor__inline.md_` footer does not resolve to this content — `issues/2026-05-09__refactor__inline.md` is an unrelated, already-merged spec (HTU framework scaffold Phase 1, REFACTOR #15/#17). That footer is treated as stale/non-authoritative per the content-based acquisition principle (§2); this file is filed under today's date instead so the filename reflects its actual content.
- **Integrity re-score:** confirmed via `score_spec` (refactor, rubric 1.5.0) — 10/10 PASS, matching the score block above.
