import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = new URL("../scripts/implw-provider-heartbeat.sh", import.meta.url).pathname;

function logFile() {
  const path = join(mkdtempSync(join(tmpdir(), "implw-heartbeat-")), "provider.log");
  writeFileSync(path, "");
  return path;
}

function capture(child) {
  let stdout = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  return () => stdout;
}

test("heartbeat reports progress without PID, path, environment, or content", async () => {
  const log = logFile();
  const provider = spawn("sleep", ["4"]);
  const heartbeat = spawn("bash", [script, String(provider.pid), "claude", log, "1", "120", "91"], {
    env: { ...process.env, SUPER_SECRET_TOKEN: "do-not-print" },
  });
  const output = capture(heartbeat);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  heartbeat.kill();
  provider.kill();
  assert.match(output(), /provider=claude issue=91 .*status=running/);
  assert.doesNotMatch(output(), /pid=/);
  assert.doesNotMatch(output(), new RegExp(log.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(output(), /do-not-print|SUPER_SECRET_TOKEN/);
});

test("heartbeat classifies a no-growth process as stalled without killing it", async () => {
  const log = logFile();
  const provider = spawn("sleep", ["5"]);
  const heartbeat = spawn("bash", [script, String(provider.pid), "claude", log, "1", "2", "91"]);
  const output = capture(heartbeat);
  await new Promise((resolve) => setTimeout(resolve, 3200));
  assert.equal(provider.exitCode, null);
  heartbeat.kill();
  provider.kill();
  assert.match(output(), /status=stalled/);
  assert.match(output(), /process remains alive/);
});

test("unsafe interval overrides fall back to bounded defaults", () => {
  const source = readFileSync(script, "utf8");
  assert.match(source, /bounded_integer "\$HEARTBEAT_INTERVAL" 60 1 300/);
  assert.match(source, /bounded_integer "\$STALL_WINDOW" 120 2 1800/);
});
