#!/usr/bin/env bash
# Extract usage plus a metadata-only diagnostic trace from Claude stream-json.

set -euo pipefail

RAW_PATH="${1:?stream-json path required}"
OUTPUT_PATH="${2:?telemetry output path required}"
DIAGNOSTIC_PATH="${3:?diagnostic output path required}"
ATTEMPT="${4:?attempt required}"
MODEL="${5:-unknown}"
REPOSITORY="${6:-unknown}"
RUN_ID="${7:-unknown}"
ISSUE_NUMBER="${8:-unknown}"
EXIT_CODE="${9:-1}"

mkdir -p "$(dirname "$OUTPUT_PATH")" "$(dirname "$DIAGNOSTIC_PATH")"

EVENTS="$(jq -Rc 'fromjson? | select(type == "object")' "$RAW_PATH")"
RESULT_EVENT="$(printf '%s\n' "$EVENTS" | jq -cs '[.[] | select(.type == "result")] | last // {}')"
TOOL_CALLS="$(printf '%s\n' "$EVENTS" | jq -s '[.. | objects | select(.type? == "tool_use")] | length')"
COMPACTIONS="$(printf '%s\n' "$EVENTS" | jq -s '[.. | objects | select(.subtype? == "compact_boundary" or .type? == "compact_boundary")] | length')"

if [ "$EXIT_CODE" = 0 ]; then RESULT=success; else RESULT=failure; fi

jq -n \
  --arg schema_version "1" \
  --arg repository "$REPOSITORY" \
  --arg run_id "$RUN_ID" \
  --arg issue_number "$ISSUE_NUMBER" \
  --arg provider "claude" \
  --arg model "$MODEL" \
  --arg attempt "$ATTEMPT" \
  --arg result "$RESULT" \
  --argjson exit_code "$EXIT_CODE" \
  --argjson event "$RESULT_EVENT" \
  --argjson tool_calls "$TOOL_CALLS" \
  --argjson compactions "$COMPACTIONS" \
  '{
    schema_version: $schema_version,
    repository: $repository,
    run_id: $run_id,
    issue_number: $issue_number,
    provider: $provider,
    model: $model,
    attempt: $attempt,
    result: $result,
    exit_code: $exit_code,
    subtype: ($event.subtype // null),
    is_error: ($event.is_error // null),
    duration_ms: ($event.duration_ms // null),
    duration_api_ms: ($event.duration_api_ms // null),
    num_turns: ($event.num_turns // null),
    total_cost_usd: ($event.total_cost_usd // null),
    input_tokens: ($event.usage.input_tokens // null),
    cache_creation_input_tokens: ($event.usage.cache_creation_input_tokens // null),
    cache_read_input_tokens: ($event.usage.cache_read_input_tokens // null),
    output_tokens: ($event.usage.output_tokens // null),
    tool_call_count: $tool_calls,
    compaction_count: $compactions
  }' > "$OUTPUT_PATH"

# Deliberately omit messages, tool inputs/results, paths, prompts, and responses.
printf '%s\n' "$EVENTS" | jq -c '{type:(.type // null),subtype:(.subtype // null),is_error:(.is_error // null),duration_ms:(.duration_ms // null),num_turns:(.num_turns // null),usage:(.usage // null),total_cost_usd:(.total_cost_usd // null)}' > "$DIAGNOSTIC_PATH"
