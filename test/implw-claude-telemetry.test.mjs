import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = new URL("../scripts/implw-claude-telemetry.sh", import.meta.url).pathname;

async function run(lines, exitCode = 0) {
  const dir = mkdtempSync(join(tmpdir(), "implw-telemetry-"));
  const raw = join(dir, "raw.jsonl");
  const telemetry = join(dir, "usage.json");
  const diagnostic = join(dir, "diagnostic.jsonl");
  writeFileSync(raw, lines.join("\n"));
  await new Promise((resolve, reject) => {
    execFile("bash", [script, raw, telemetry, diagnostic, "first", "claude-sonnet", "UzorAI/uzorai.com", "123", "91", String(exitCode)], (error) => error ? reject(error) : resolve());
  });
  return { usage: JSON.parse(readFileSync(telemetry)), diagnostic: readFileSync(diagnostic, "utf8") };
}

test("extracts final usage, correlations, tool calls, compactions, and cost", async () => {
  const { usage } = await run([
    "diagnostic text",
    JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", name: "Read", input: { secret: "hidden" } }] } }),
    JSON.stringify({ type: "system", subtype: "compact_boundary" }),
    JSON.stringify({ type: "result", subtype: "success", duration_ms: 100, duration_api_ms: 80, num_turns: 2, total_cost_usd: 0.25, usage: { input_tokens: 10, cache_creation_input_tokens: 2, cache_read_input_tokens: 3, output_tokens: 4 } }),
  ]);
  assert.deepEqual({ repository: usage.repository, run_id: usage.run_id, issue_number: usage.issue_number }, { repository: "UzorAI/uzorai.com", run_id: "123", issue_number: "91" });
  assert.equal(usage.result, "success");
  assert.equal(usage.exit_code, 0);
  assert.equal(usage.total_cost_usd, 0.25);
  assert.equal(usage.input_tokens, 10);
  assert.equal(usage.tool_call_count, 1);
  assert.equal(usage.compaction_count, 1);
});

test("keeps missing optional usage fields null and records provider failure", async () => {
  const { usage } = await run(["not json", JSON.stringify({ type: "result", is_error: true })], 1);
  assert.equal(usage.result, "failure");
  assert.equal(usage.exit_code, 1);
  assert.equal(usage.total_cost_usd, null);
  assert.equal(usage.input_tokens, null);
});

test("diagnostic artifact omits messages, tool inputs, prompts, paths, and secrets", async () => {
  const { diagnostic } = await run([
    JSON.stringify({ type: "assistant", message: { content: "SECRET_RESPONSE" }, tool_input: "SECRET_TOOL_INPUT", path: "/home/private" }),
    JSON.stringify({ type: "result", usage: { input_tokens: 1 } }),
  ]);
  assert.doesNotMatch(diagnostic, /SECRET_RESPONSE|SECRET_TOOL_INPUT|\/home\/private|message|tool_input|path/);
  assert.match(diagnostic, /"type":"result"/);
});
