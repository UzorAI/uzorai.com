import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = new URL("../scripts/implw-codex-telemetry.sh", import.meta.url).pathname;

async function run(lines, exitCode = 0) {
  const dir = mkdtempSync(join(tmpdir(), "implw-codex-telemetry-"));
  const raw = join(dir, "raw.jsonl");
  const telemetry = join(dir, "usage.json");
  writeFileSync(raw, lines.join("\n"));
  await new Promise((resolve, reject) => {
    execFile("bash", [script, raw, telemetry, "UzorAI/uzorai.com", "123", "116", String(exitCode), "gpt-test", "start", "end", "900"], (error) => error ? reject(error) : resolve());
  });
  return readFileSync(telemetry, "utf8");
}

test("projects Codex usage and correlation into a fixed-shape record", async () => {
  const text = await run([
    JSON.stringify({ type: "item.completed", item: { text: "SECRET_MODEL_OUTPUT" } }),
    JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10, cached_input_tokens: 3, output_tokens: 4, total_tokens: 17 } }),
  ]);
  const usage = JSON.parse(text);
  assert.deepEqual(
    { repository: usage.repository, run_id: usage.run_id, issue_number: usage.issue_number, provider: usage.provider },
    { repository: "UzorAI/uzorai.com", run_id: 123, issue_number: 116, provider: "codex" },
  );
  assert.deepEqual(
    { input: usage.input_tokens, cached: usage.cached_input_tokens, output: usage.output_tokens, total: usage.total_tokens },
    { input: 10, cached: 3, output: 4, total: 17 },
  );
  assert.doesNotMatch(text, /SECRET_MODEL_OUTPUT|item\.completed|turn\.completed/);
});

test("keeps unavailable or invalid metrics null and records failure", async () => {
  const usage = JSON.parse(await run([
    "not json",
    JSON.stringify({ usage: { input_tokens: -1, output_tokens: "secret" } }),
  ], 1));
  assert.equal(usage.result, "failure");
  assert.equal(usage.exit_code, 1);
  assert.equal(usage.input_tokens, null);
  assert.equal(usage.output_tokens, null);
});
