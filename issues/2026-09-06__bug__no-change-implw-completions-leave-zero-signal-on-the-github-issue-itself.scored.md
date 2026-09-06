# BUG: no-change implw completions leave zero signal on the GitHub issue itself

## Intent

BUG #133 (PR #134) fixed the failure path — a `Validate completion evidence` failure now uploads a redacted transcript-tail artifact. The corresponding success path (`no_change_verified`, i.e. the agent wrote a valid no-change manifest instead of opening a PR) has an equivalent, uncovered gap: the manifest's `reason`/`evidence` text is written only to `$GITHUB_STEP_SUMMARY` in `scripts/require-implw-completion-evidence.mjs`, which renders solely in the Actions run's web-UI Summary tab — no REST API exposes step-summary content, so it isn't retrievable by `gh` CLI, and nothing posts it to the issue. A no-change run leaves the issue open with zero new comments, indistinguishable from "implw was never dispatched."

Confirmed on UzorAI/uzorai.com#78 (Phase 9 of EPIC #69): run 34053266656 completed via the no-change-manifest path with no new comment and an unrecoverable stated reason.

## Repro

1. Dispatch `trigger_implw` on a spec the agent will resolve as no-change (e.g. UzorAI/uzorai.com#78, which has now taken this path once already).
2. Run completes with `conclusion: success`; `Validate completion evidence` step shows `success` (not `failure`).
3. Check the issue: `gh issue view <n> --json comments` — comment count is unchanged from before the run.
4. Check for any artifact or API surface carrying the manifest's `reason`/`evidence`: `gh run view <run_id> --json jobs` and `gh api repos/<owner>/<repo>/actions/runs/<run_id>/artifacts` — neither exposes it; only `claude-usage-<run_id>-first.json/.diagnostic.jsonl` (cost/turn metadata, no manifest text) are present. The content only exists in the Actions web UI's Summary tab for that specific run.
5. A human relying on `gh`/the issue tracker (not manually opening every Actions run's Summary tab) cannot tell a no-change completion happened, let alone why.

Expected: a no-change completion posts a comment on the issue (mirroring the existing `failure()`-gated "Comment failure on issue" step) stating the manifest's `reason`/`evidence` and a link to the run.

Actual: silence on the issue; the only record lives in a GitHub UI surface with no CLI/API access path.

## Fix

Add one more step to `implw.yml`, parallel to the existing "Comment failure on issue" step, gated on `steps.completion_evidence.outputs.completion_classification == 'no_change_verified'`: post a comment on the issue built from `steps.completion_evidence.outputs.completion_reason` plus the manifest's `reason`/`evidence` (available as `NO_CHANGE_MANIFEST_PATH` contents, already read once by `require-implw-completion-evidence.mjs` — re-read the same file rather than re-deriving) and the run URL. No change to `require-implw-completion-evidence.mjs` or the classification contract itself — this is purely an additive visibility step, same permission scope (`issues: write`) the workflow already holds.

## Acceptance Criteria

- [ ] AC1: A no-change-manifest completion posts exactly one comment on the triggering issue containing the manifest's `reason` and `evidence` text and a link to the run.
- [ ] AC2: The failure path (BUG #133) and the change-verified (PR-opening) path are unaffected — no duplicate or new comment is posted on either.
- [ ] AC3: Comment posting failure (e.g. issue closed/locked between dispatch and this step) does not fail the overall job — mirror the existing failure-comment step's fire-and-forget posture.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| No-change completion visibility | Manifest `reason`/`evidence` written only to `$GITHUB_STEP_SUMMARY` (web-UI-only, no API/CLI access) | Also posted as an issue comment, visible wherever the issue is viewed |
| Parity with BUG #133 | Failure path has a diagnostic artifact; success/no-change path has nothing issue-visible | Both terminal non-PR outcomes (failure, no-change) now leave an issue-visible trace |
| Open questions | None — this mirrors the existing "Comment failure on issue" step's structure exactly | Resolved on merge |

## Files

```
.github/workflows/implw.yml    # MODIFIED — add a no-change-completion issue-comment step, gated on completion_classification == 'no_change_verified'
```

## Legal triggers

None — internal CI/governance tooling change, no user-facing data, no third-party content.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Author + review the new comment step | None | 30-60 min |
| **Total** | — | 30-60 min |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation, implw self-test on a synthetic no-change spec, PR review | CI run | 1 working day |
| **Total** | — | 1 working day |

### Assumptions

- The no-change manifest file at `$NO_CHANGE_MANIFEST_PATH` is still present on disk at this point in the job (it is read once already, by `require-implw-completion-evidence.mjs`, and nothing in the job deletes it before this point).
- Reusing the existing `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` scope already granted to the "Comment failure on issue" step is sufficient; no new permission is needed.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Implementation and validation | 30-60 min / 1 working day | TBD | TBD |
| **Total** | 30-60 min / 1 working day | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-09-06T19:07:51.395Z
- **Score:** 8/8
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| repro | PASS |
| fix | PASS |
| acceptance_criteria | PASS |
| migration_summary | PASS |
| files | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__bug__inline.md_

## Provenance (auto-materialized)

- **Auto-materialized from:** issue body (inline-scored, Path B)
- **Issue:** UzorAI/uzorai.com#135
- **Materialized at:** 2026-09-06T19:07:51.395Z
- **Materialized by:** implw on branch htu/no-change-implw-completions-leave-zero-signal-on-the-github-issue-itself-135
