import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const script = new URL("../scripts/codex-auth-preflight.sh", import.meta.url).pathname;

function runFakeCodex(exitCode) {
  const bin = mkdtempSync(join(tmpdir(), "implw-codex-bin-"));
  const codex = join(bin, "codex");
  writeFileSync(codex, `#!/usr/bin/env bash\n[ "$1 $2" = "login status" ] || exit 2\nexit ${exitCode}\n`);
  chmodSync(codex, 0o755);
  return new Promise((resolve) => {
    execFile("bash", [script], { env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

test("accepts a valid Codex login without emitting credential material", async () => {
  const result = await runFakeCodex(0);
  assert.equal(result.error, null);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
});

test("rejects a missing or expired Codex login with a bounded diagnostic", async () => {
  const result = await runFakeCodex(1);
  assert.equal(result.error?.code, 1);
  assert.match(result.stdout, /^provider_not_supported: codex auth session is missing or expired/);
  assert.doesNotMatch(result.stdout, /access_token|refresh_token|sk-/);
});
