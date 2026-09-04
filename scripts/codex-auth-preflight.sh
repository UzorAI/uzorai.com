#!/usr/bin/env bash
# Fail fast without reading or printing credential material. The Codex CLI's
# own status command validates the human-managed runner session.
set -euo pipefail

if ! command -v codex >/dev/null 2>&1; then
  echo "provider_not_supported: codex CLI is not installed on the runner"
  exit 1
fi

if ! codex login status >/dev/null 2>&1; then
  echo "provider_not_supported: codex auth session is missing or expired — authenticate on the runner with codex login"
  exit 1
fi
