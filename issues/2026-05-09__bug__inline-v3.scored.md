# BUG: implw exits success with no PR, no no-change manifest, and no comment on ambiguous specs

## Intent

`implw` on UzorAI/uzorai.com can complete with `exit_code 0` ("success") while leaving zero evidence of work: no pushed branch, no PR referencing `Closes #<issue>`, no JSON no-change manifest, and no comment on the issue. The post-run completion-evidence gate (`scripts/require-implw-completion-evidence.mjs`) correctly fails the job — it exists precisely so the workflow never trusts the subprocess's own exit code (see its header, referencing prior incident run `30344067030`) — but the agent behavior it guards against recurs, and operators currently cannot diagnose it after the fact: the raw transcript is deleted on the runner, and the uploaded telemetry artifact carries only redacted event-type metadata, no text.

Reproduced twice back-to-back on UzorAI/uzorai.com#78 (Phase 9 of EPIC #69), with different turn counts each time — not a flake.

## Repro

1. Issue #78 on UzorAI/uzorai.com carries a valid inline `## ZAI Spec Score` block (feat, 10/10, PASSED YES) and no `needs-approval` label — Gate 1 passes cleanly.
2. Dispatch `trigger_implw(target_repo=UzorAI/uzorai.com, issue_number=78, provider=claude)`.
3. Run `34049724359` (2026-09-06 17:48 UTC): claude subprocess `exit_code 0`, 7 turns, 6 tool calls, 120s, $0.28. No branch, no PR, no comment, `NO_CHANGE_MANIFEST_PATH` empty. "Validate completion evidence" fails with `missing_completion_evidence: no PR was found for this run and no no-change manifest was supplied`.
4. Re-dispatch identically. Run `34050188806` (17:57 UTC): same outcome — `exit_code 0`, 9 turns, 8 tool calls, 239s, $0.41 — again no branch/PR/manifest/comment.
5. Attempt to diagnose: `RAW_LOG` is deleted by `cleanup_runtime()` in `implw.yml` on the self-hosted runner before job end, and the uploaded `claude-usage-<run_id>-first.diagnostic.jsonl` artifact contains only redacted event-type entries (e.g. `{"type":"assistant","subtype":null,...}` with every content field null) — no way to see what the agent attempted or why it stopped.

Expected: some governed completion path (PR, no-change manifest, or at minimum an issue comment) on every exit-0 run.
Actual: silent non-completion, twice, with no forensic trace.

## Fix

Two independent, additive changes to `UzorAI/uzorai.com`'s implw path (the completion-evidence gate itself is already correct and should keep failing closed):

1. **`.claude/commands/implw.md`**: add an explicit "always-finalize" instruction — if the procedure reaches its end without having opened a PR, the last action before finishing must be writing the no-change manifest (`{"reason": ..., "evidence": ...}` to `$NO_CHANGE_MANIFEST_PATH`) with whatever reason is true at that point (including "agent could not resolve this spec into an implementation plan"), rather than letting the turn loop end with neither artifact written.
2. **`implw.yml`**: on `Validate completion evidence` failure specifically, retain and attach a redacted-but-readable tail of the actual claude transcript (last N assistant/user text turns, secrets-redacted the same way `include_failed_log` already redacts elsewhere in this org's tooling) as a workflow artifact, instead of relying solely on the event-type-only diagnostic file.

## Acceptance Criteria

- [ ] AC1: A synthetic spec engineered to be unresolvable (e.g., contradictory acceptance criteria) causes the agent to write a no-change manifest with a non-empty `reason` before its final turn, rather than exiting 0 with no manifest.
- [ ] AC2: On a `Validate completion evidence` failure, the workflow run's artifacts include a redacted transcript tail with actual text content (not only event-type metadata), sufficient to identify what the agent last attempted.
- [ ] AC3: Existing passing paths are unaffected — a run that legitimately opens a PR (e.g. #128) or legitimately writes a no-change manifest (e.g. #77/PR #132) continues to pass the completion-evidence gate exactly as before.

## Subject Migration Summary

| Subject | Before | After |
|---|---|---|
| `.claude/commands/implw.md` completion instructions | No explicit requirement to write *something* if the procedure ends without a PR | Explicit always-finalize instruction: write the no-change manifest as a last resort before ending |
| `implw.yml` failure-path artifacts | Only redacted event-type-only diagnostic JSON on any outcome | Additional redacted-but-textual transcript tail attached specifically on completion-evidence failure |
| Open questions | Root cause of why the agent's turn loop ends without writing either artifact on this spec is unconfirmed (transcript unrecoverable) | Resolved on merge: the transcript-tail artifact from AC2 lets a human diagnose the next occurrence directly, and AC1's always-finalize instruction bounds the blast radius regardless of root cause |

## Files

```
.claude/commands/implw.md      # MODIFIED — add always-finalize / last-resort no-change-manifest instruction
.github/workflows/implw.yml    # MODIFIED — on completion-evidence failure, upload a redacted transcript-tail artifact instead of relying solely on redacted event-type telemetry
```

## Legal triggers

None — internal CI/governance tooling change, no user-facing data, no third-party content.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Author + review the always-finalize instruction and transcript-tail redaction logic | None | 1-2 hours |
| **Total** | — | 1-2 hours |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation, implw self-test on a synthetic unresolvable spec, PR review | CI run | 1 working day |
| **Total** | — | 1 working day |

### Assumptions

- The self-hosted runner's existing secret-redaction approach (already used for `include_failed_log` elsewhere in this org's tooling) is reusable for a transcript-tail redaction without introducing a new redaction implementation.
- Fixing this does not require reproducing the exact original spec's ambiguity — a synthetic unresolvable spec is sufficient for AC1.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Implementation and validation | 1-2 active hours / 1 working day | TBD | TBD |
| **Total** | 1-2 active hours / 1 working day | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** bug
- **Evaluated at:** 2026-09-06T18:27:55.858Z
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

- **Source:** inline-scored issue body (Path B)
- **Issue:** UzorAI/uzorai.com#133
- **Materialized by:** implw at 2026-09-06T18:30:00Z
- **Collision suffix:** -v3 (2026-05-09__bug__inline.scored.md and -v2 already present)
