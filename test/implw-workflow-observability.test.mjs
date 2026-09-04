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
  const parser = workflow.indexOf("./scripts/implw-claude-telemetry.sh");
  const rawCleanup = workflow.indexOf('rm -f "$RAW_LOG"', parser);
  assert.ok(parser > -1, "telemetry parser must be present");
  assert.ok(rawCleanup > parser, "raw stream must be removed only after telemetry parsing");
});

test("artifacts are best effort, metadata-only, and immutably pinned", () => {
  assert.match(workflow, /name: Upload Claude usage telemetry/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.doesNotMatch(workflow, /path:\s*\$\{\{[^\n]*raw/i);
});

test("workflow offers an isolated Codex provider with the same completion gate", () => {
  assert.match(workflow, /provider:[\s\S]*options:[\s\S]*- claude[\s\S]*- codex[\s\S]*default: claude/);
  assert.match(workflow, /if: inputs\.provider == 'claude'/);
  assert.match(workflow, /if: inputs\.provider == 'codex'/);
  assert.match(workflow, /codex "\$\{CODEX_ARGS\[@\]\}" "\$CODEX_PROMPT"/);
  assert.match(workflow, /--sandbox workspace-write/);
  assert.match(workflow, /sandbox_workspace_write\.network_access=true/);
  assert.match(workflow, /NO_CHANGE_MANIFEST_PATH: \$\{\{ steps\.prepare_manifest\.outputs\.no_change_manifest_path \}\}/);
  assert.match(workflow, /REQUESTED_PROVIDER: \$\{\{ inputs\.provider \}\}/);
  assert.match(workflow, /implw-codex-telemetry\.sh/);
  assert.match(workflow, /name: Upload Codex usage telemetry/);
  const codexRun = workflow.indexOf("name: Run implw via Codex");
  const completionGate = workflow.indexOf("name: Validate completion evidence");
  assert.ok(codexRun > -1 && completionGate > codexRun, "completion gate must run after Codex");
});
