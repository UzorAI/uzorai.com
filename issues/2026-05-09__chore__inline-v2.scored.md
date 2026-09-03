# CHORE: Port implw.yml model + sparse_paths inputs (CHORE zzv-skills#196) to UzorAI/uzorai.com

## Intent

`zi007lin/zzv-skills#196` added `model` and `sparse_paths` `workflow_dispatch` inputs to zzv-skills' own `.github/workflows/implw.yml` (merged via PR #197, 2026-06-20). Each repo that runs implw maintains its own physical copy of `implw.yml` — there is no shared `workflow_call` source — so #196 never propagated to `UzorAI/uzorai.com`'s copy. Confirmed live via `gh api`: uzorai.com's `implw.yml` still declares only `issue_number` and `dispatch_id`. Port the same two inputs there so cost-control (Haiku for CHOREs, sparse checkout) is available on uzorai.com implw runs, unblocking the same use case #196 shipped for zzv-skills.

## Action

1. In `UzorAI/uzorai.com`'s `.github/workflows/implw.yml`, add two inputs to `workflow_dispatch.inputs` immediately after `dispatch_id`: `model` (type `string`, required `false`, default `claude-sonnet-4-6`, description "Claude model for this implw run") and `sparse_paths` (type `string`, required `false`, description "Newline-separated repo-relative paths for sparse checkout. Leave empty for full checkout (default).").
2. In the `Checkout` step's `with:` block, change `fetch-depth: 0` to `fetch-depth: ${{ inputs.sparse_paths != '' && 1 || 0 }}` and add `sparse-checkout: ${{ inputs.sparse_paths }}`. Leave `persist-credentials: false` and its existing comment untouched.
3. In the "Run implw via claude (subscription mode)" step's `env:` block, add `CLAUDE_MODEL_INPUT: ${{ inputs.model }}` alongside the existing `SPEC_PATH`/`ISSUE_NUMBER`/`REPOSITORY`/`RUN_ID`/`HEARTBEAT_INTERVAL_RAW`/`HEARTBEAT_STALL_WINDOW_RAW` entries. Per REFACTOR #83's trust-boundary hardening, `${{ inputs.model }}` must not be spliced directly into a `run:` shell body — route it through `env:` like every other input this file already handles.
4. In that step's shell script, change the claude invocation line from `timeout 20m claude --dangerously-skip-permissions --debug --verbose --output-format stream-json -p "/implw $SPEC_PATH" < /dev/null > "$RAW_LOG" 2>&1 &` to `timeout 20m claude --model "$CLAUDE_MODEL_INPUT" --dangerously-skip-permissions --debug --verbose --output-format stream-json -p "/implw $SPEC_PATH" < /dev/null > "$RAW_LOG" 2>&1 &`.
5. Do not modify `src/tools/trigger_implw.ts` in zzv-skills. Its description already documents both inputs generically, added by PR #197: "The dispatched `implw.yml` also accepts two workflow_dispatch inputs not yet exposed on this tool's own schema... (CHORE zzv-skills#196)." That statement becomes true for uzorai.com once this CHORE merges — it needs no repo-specific edit.
6. Verify: dispatch a test CHORE issue on `UzorAI/uzorai.com` with `model=claude-haiku-4-5` via a direct `gh workflow run implw.yml -f issue_number=<N> -f model=claude-haiku-4-5 --repo UzorAI/uzorai.com` call (not `trigger_implw` — its schema still doesn't expose either input) and confirm the run log shows `--model claude-haiku-4-5`. Dispatch a second run with no `model`/`sparse_paths` set and confirm unchanged behavior: full checkout, `claude-sonnet-4-6` default.

## Acceptance Criteria

- [ ] `UzorAI/uzorai.com`'s `implw.yml` `workflow_dispatch` accepts a `model` input; defaults to `claude-sonnet-4-6` when omitted
- [ ] `workflow_dispatch` accepts a `sparse_paths` input; empty (the default) preserves the existing full `fetch-depth: 0` checkout
- [ ] A run dispatched with `sparse_paths` set uses `fetch-depth: 1` and the `sparse-checkout` action config, restricting the working tree to the given paths
- [ ] A run dispatched with `model=claude-haiku-4-5` shows `claude --model claude-haiku-4-5 ...` in the run log (not the previous unconditional invocation)
- [ ] `${{ inputs.model }}` reaches the `claude` invocation only via the step's `env:` block (`CLAUDE_MODEL_INPUT`), never spliced directly into the `run:` script — consistent with every other `${{ inputs.* }}`/`${{ steps.*.outputs.* }}` value in this file per REFACTOR #83
- [ ] A run dispatched with neither `model` nor `sparse_paths` set behaves identically to pre-CHORE runs (full checkout, Sonnet, no other step altered)
- [ ] `src/tools/trigger_implw.ts` is unchanged — its existing description already covers both inputs

## Files

```
.github/workflows/implw.yml   # UzorAI/uzorai.com — MODIFIED: add model + sparse_paths workflow_dispatch inputs; sparse-checkout conditional on Checkout step; model routed through Run step's env: block into `claude --model`
```

## Legal triggers

None. CI workflow configuration only — no data handling, no PII, no external service changes, no new secret or binding.

## Work Estimate

### Active operator time

| Phase | Wait dependency | Estimate |
|---|---|---|
| Review + approve spec | None | 5 min |
| Verify test runs (Haiku + default) | impl | 10 min |
| **Total** | — | **~15 min** |

### Wall-clock time

| Phase | Wait dependency | Estimate |
|---|---|---|
| impl run (dispatched against UzorAI/uzorai.com) | ZiLin-dev CI | ~1 day |
| **Total** | — | **~1 day** |

### Assumptions

- `UzorAI/uzorai.com` is already present in zzv-skills' `IMPLW_ALLOWLIST` (confirmed — FEAT zzv-skills#144), so `trigger_implw` can dispatch the implementation run against it without a separate allowlist CHORE.
- uzorai.com's `implw.yml` structure (verify_issue / re-verify-hash / heartbeat-wrapped claude invocation) matches what was fetched live on 2026-09-03; a diff since then would need re-verification before merge.
- `claude-haiku-4-5` is a valid model string for this CLI version, consistent with #196's original assumption.

### Actuals (filled post-execution)

| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| impl run | ~1 day | TBD | TBD |
| **Total** | TBD | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-09-03T04:30:30.127Z
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

_Source: 2026-05-09__chore__inline.md_

---

## Provenance (auto-materialized)

- **Acquisition path:** Path B — inline-scored issue body (MCP). The `_Source:_`
  footer (`issues/2026-05-09__chore__inline.md`) resolves, by naming convention,
  to `issues/2026-05-09__chore__inline.scored.md` — but that file already exists
  and holds an unrelated spec (UzorAI/uzorai.com#53, "Russian hero tagline to
  informal imperative"). The generic date+type+"inline" name is reused across
  unrelated inline-scored issues sharing the same footer text, so this is a
  filename collision, not a content match — Path A does not apply. The GitHub
  issue body is authoritative and is materialized here under a `-v2` collision
  suffix per §4.2.
- **Source issue:** UzorAI/uzorai.com#104 — "CHORE: Port implw.yml model +
  sparse_paths inputs (CHORE zzv-skills#196) to UzorAI/uzorai.com" (created
  2026-09-03T04:30:30Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=chore) on the acquired
  body → 6/6 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** CHORE → AUTO (full pass, no `gates[]` declared, no
  `needs-approval` label). No HOLD; no approval channel required. PR review by
  daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #104 on branch
  `htu/port-implw-yml-model-sparse-paths-inputs-104`; committed with the
  implementation PR.
