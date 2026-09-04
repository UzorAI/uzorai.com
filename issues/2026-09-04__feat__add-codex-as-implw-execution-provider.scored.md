# FEAT: Add Codex as an implw execution provider

## Intent

Allow governed `/implw` runs to use the already-authenticated Codex CLI on the self-hosted runner when Claude is rate-limited, without weakening repository trust checks or the independent completion-evidence gate.

## Action

Add an explicit `provider` workflow input (`claude` default, `codex` optional) and a separate optional Codex model input. Keep Claude behavior unchanged. Add a Codex execution step that validates CLI/auth availability, runs non-interactively with workspace-write access, passes the issue spec and `$NO_CHANGE_MANIFEST_PATH` contract, emits bounded secret-safe telemetry, and exposes a provider-neutral exit result. Run the existing completion-evidence validator after either provider succeeds. Make failure comments and artifact upload provider-aware. Add regression tests for provider selection, isolation, telemetry redaction, and unchanged completion-gate ordering.

## Acceptance Criteria

- [x] Existing dispatches still default to Claude with unchanged behavior.
- [x] `provider=codex` invokes `codex exec` non-interactively on the self-hosted runner.
- [x] Codex receives the spec path, repository/issue context, and governed no-change manifest contract.
- [x] Missing Codex CLI/auth fails early with a clear diagnostic and no credential contents.
- [x] The independent completion-evidence validator runs after either successful provider invocation.
- [x] Failure comments identify the selected provider and exit status.
- [x] Codex telemetry artifacts contain bounded metadata/usage only, never prompts or model output.
- [x] Repository tests and build pass.

## Files

`.github/workflows/implw.yml`, Codex auth/telemetry scripts, and focused tests.

## Legal triggers

None. Internal CI provider routing only; no user data or production deployment. Runner authentication remains human-managed and no credential is committed.

## Work Estimate

Approximately one hour implementation and verification, plus review.

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** feat
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
