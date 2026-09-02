import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const workflow = readFileSync(new URL("../.github/workflows/implw.yml", import.meta.url), "utf8");

test("workflow captures stream-json and wires bounded heartbeat lifecycle", () => {
  assert.match(workflow, /--debug --verbose --output-format stream-json/);
  assert.match(workflow, /implw-provider-heartbeat\.sh/);
  assert.match(workflow, /wait "\$PROVIDER_PID"[\s\S]*CLAUDE_EXIT=\$\?/);
  assert.match(workflow, /kill "\$HEARTBEAT_PID"[\s\S]*wait "\$HEARTBEAT_PID"/);
  assert.match(workflow, /trap cleanup_runtime EXIT INT TERM/);
  assert.match(workflow, /rm -f "\$RAW_LOG"/);
  assert.match(workflow, /provider_started/);
  assert.match(workflow, /provider_completed/);
});

test("workflow emits telemetry without changing provider outcome", () => {
  assert.match(workflow, /implw-claude-telemetry\.sh/);
  assert.match(workflow, /implw_claude_telemetry=/);
  assert.match(workflow, /usage extraction failed; provider outcome is unchanged/);
  assert.match(workflow, /exit "\$CLAUDE_EXIT"/);
});

test("artifacts are best effort, metadata-only, and immutably pinned", () => {
  assert.match(workflow, /name: Upload Claude usage telemetry/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.doesNotMatch(workflow, /path:\s*\$\{\{[^\n]*raw/i);
});
