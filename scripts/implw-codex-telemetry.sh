#!/usr/bin/env bash
# Project raw Codex JSONL into one fixed-shape, secret-safe telemetry record.
# Raw prompts and model output remain in a temporary file and are never emitted.
set -euo pipefail

RAW_PATH="${1:?raw Codex JSONL path required}"
OUTPUT_PATH="${2:?telemetry output path required}"
REPOSITORY="${3:?repository required}"
RUN_ID="${4:?run id required}"
ISSUE_NUMBER="${5:?issue number required}"
PROVIDER_EXIT="${6:?provider exit required}"
MODEL="${7:-}"
STARTED_AT="${8:-}"
COMPLETED_AT="${9:-}"
DURATION_MS="${10:-}"

mkdir -p "$(dirname "$OUTPUT_PATH")"
USAGE="$(jq -s '[.[] | .usage? | select(type == "object")] | last // {}' "$RAW_PATH" 2>/dev/null || printf '{}')"

number_or_null() {
  if [[ "$1" =~ ^[0-9]+$ ]]; then printf '%s' "$1"; else printf null; fi
}

jq -n \
  --arg repository "$REPOSITORY" \
  --arg model "$MODEL" \
  --arg started_at "$STARTED_AT" \
  --arg completed_at "$COMPLETED_AT" \
  --argjson run_id "$(number_or_null "$RUN_ID")" \
  --argjson issue_number "$(number_or_null "$ISSUE_NUMBER")" \
  --argjson provider_exit "$(number_or_null "$PROVIDER_EXIT")" \
  --argjson duration_ms "$(number_or_null "$DURATION_MS")" \
  --argjson usage "$USAGE" '
    def metric($name):
      ($usage[$name] // null) as $value |
      if ($value | type) == "number" and $value >= 0 and ($value | floor) == $value
      then $value else null end;
    {
      schema_version: "1",
      repository: $repository,
      run_id: $run_id,
      issue_number: $issue_number,
      provider: "codex",
      attempt: "first",
      model: (if $model == "" then null else $model end),
      result: (if $provider_exit == 0 then "success" else "failure" end),
      exit_code: $provider_exit,
      started_at: (if $started_at == "" then null else $started_at end),
      completed_at: (if $completed_at == "" then null else $completed_at end),
      duration_ms: $duration_ms,
      input_tokens: metric("input_tokens"),
      cached_input_tokens: metric("cached_input_tokens"),
      output_tokens: metric("output_tokens"),
      total_tokens: metric("total_tokens")
    }
  ' > "$OUTPUT_PATH"
