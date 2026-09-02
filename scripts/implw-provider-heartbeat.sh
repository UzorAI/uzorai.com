#!/usr/bin/env bash
# Observe one implw provider process without reading or printing its content.

set -uo pipefail

PID="${1:?pid required}"
PROVIDER="${2:?provider required}"
LOG_PATH="${3:?log path required}"
HEARTBEAT_INTERVAL="${4:-60}"
STALL_WINDOW="${5:-120}"
ISSUE_NUMBER="${6:-0}"

bounded_integer() {
  local value="$1" default="$2" minimum="$3" maximum="$4"
  if [[ "$value" =~ ^[0-9]+$ ]] && [ "$value" -ge "$minimum" ] && [ "$value" -le "$maximum" ]; then
    printf '%s' "$value"
  else
    printf '%s' "$default"
  fi
}

HEARTBEAT_INTERVAL="$(bounded_integer "$HEARTBEAT_INTERVAL" 60 1 300)"
STALL_WINDOW="$(bounded_integer "$STALL_WINDOW" 120 2 1800)"

log_size_bytes() {
  wc -c < "$LOG_PATH" 2>/dev/null | tr -d ' '
}

START_TS=$(date +%s)
LAST_SIZE="$(log_size_bytes)"
LAST_SIZE="${LAST_SIZE:-0}"
LAST_GROWTH_TS="$START_TS"
STALL_WARNED=false

while kill -0 "$PID" 2>/dev/null; do
  sleep "$HEARTBEAT_INTERVAL"
  kill -0 "$PID" 2>/dev/null || break

  NOW=$(date +%s)
  ELAPSED=$((NOW - START_TS))
  SIZE="$(log_size_bytes)"
  SIZE="${SIZE:-0}"
  if [ "$SIZE" -gt "$LAST_SIZE" ]; then
    LAST_SIZE="$SIZE"
    LAST_GROWTH_TS="$NOW"
    STALL_WARNED=false
  fi
  NO_GROWTH_SECONDS=$((NOW - LAST_GROWTH_TS))
  STATUS=running
  if [ "$NO_GROWTH_SECONDS" -ge "$STALL_WINDOW" ]; then
    STATUS=stalled
  fi

  echo "implw_provider_heartbeat provider=$PROVIDER issue=$ISSUE_NUMBER elapsed_seconds=$ELAPSED output_bytes=$SIZE no_growth_seconds=$NO_GROWTH_SECONDS status=$STATUS"
  echo "::notice title=implw timeline::event=provider_heartbeat issue=$ISSUE_NUMBER provider=$PROVIDER phase=implementation status=$STATUS elapsed_seconds=$ELAPSED detail=output_bytes_$SIZE"

  if [ "$STATUS" = stalled ] && [ "$STALL_WARNED" = false ]; then
    echo "::warning title=implw provider heartbeat::provider=$PROVIDER produced no new output for ${NO_GROWTH_SECONDS} seconds; process remains alive"
    STALL_WARNED=true
  fi
done

exit 0
