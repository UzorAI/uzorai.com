#!/usr/bin/env node
/**
 * scripts/security/assert-workflow-hardening.mjs
 *
 * Build-time guard for REFACTOR #83 (Harden implw runner and repository
 * trust boundaries): fails the build if the workflow/agent/config surface
 * regresses on any of the trust-boundary properties that PR established.
 *
 * Checks the real repo files, then re-runs each checker against the
 * fixtures in test/fixtures/security/ to prove the checker itself still
 * distinguishes a known-bad pattern from a known-good one (a checker that
 * always passes would make the first half of this file a no-op).
 *
 * Pure Node built-ins — no devDependency, matching scripts/assert-no-translate.mjs.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (relPath) => readFileSync(join(root, relPath), "utf8");

// ---------------------------------------------------------------------------
// Checkers (pure functions — each returns a list of violation strings)
// ---------------------------------------------------------------------------

const ISSUE_NUMBER_RE = /^[1-9][0-9]*$/;

function isValidIssueNumber(value) {
  return typeof value === "string" && ISSUE_NUMBER_RE.test(value);
}

// GitHub Actions script injection: a `${{ }}` expression referencing
// attacker-reachable content (workflow_dispatch inputs, event payload
// fields, or a prior step's outputs) spliced directly into a `run:` shell
// body, rather than passed through `env:`. See
// https://docs.github.com/actions/security-guides/security-hardening-for-github-actions#understanding-the-risk-of-script-injection
const UNSAFE_INTERPOLATION_RE = /\$\{\{\s*(github\.event\.|inputs\.|steps\.[A-Za-z0-9_-]+\.outputs\.)/;

// Matches a YAML step's `run:` key (never `run-name:` — that key has a `-`
// immediately after "run", so it never matches `run:` followed by
// whitespace/end-of-match).
const RUN_KEY_RE = /^(\s*)run:[ \t]*([|>][0-9+-]*)?[ \t]*(.*)$/;

function scanForUnsafeInterpolation(yamlText) {
  const violations = [];
  const lines = yamlText.split("\n");
  let blockIndent = null; // indentation of the `run:` key while inside its block scalar

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    if (blockIndent !== null) {
      if (line.trim() === "") continue; // blank lines stay inside the block scalar
      const indent = line.match(/^ */)[0].length;
      if (indent > blockIndent) {
        if (UNSAFE_INTERPOLATION_RE.test(line)) {
          violations.push(`line ${lineNo}: unsafe expression interpolation in run: body — ${line.trim()}`);
        }
        continue;
      }
      blockIndent = null; // block ended; fall through and re-evaluate this line below
    }

    const m = line.match(RUN_KEY_RE);
    if (!m) continue;
    const [, indentStr, blockIndicator, rest] = m;
    if (blockIndicator) {
      blockIndent = indentStr.length;
    } else if (rest && UNSAFE_INTERPOLATION_RE.test(rest)) {
      violations.push(`line ${lineNo}: unsafe expression interpolation in run: body — ${line.trim()}`);
    }
  }

  return violations;
}

const PIN_ALLOWLIST = new Set([
  // Human-managed version-bump contract, not a floating branch — see the
  // documented-exception comment in .github/workflows/pr-validation.yml.
  "zi007lin/htu-pr-validation/.github/workflows/pr-validation.yml@pr-validation-contract-v0.4.0",
]);

const SHA_RE = /^[0-9a-f]{40}$/i;

function checkActionPinning(yamlText) {
  const violations = [];
  const lines = yamlText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/);
    if (!m) continue;
    const ref = m[1];
    if (ref.startsWith("./") || ref.startsWith("docker://")) continue; // local/docker refs have nothing to pin
    const at = ref.lastIndexOf("@");
    if (at === -1) {
      violations.push(`line ${i + 1}: unpinned action reference — ${ref}`);
      continue;
    }
    const version = ref.slice(at + 1);
    if (SHA_RE.test(version)) continue;
    if (PIN_ALLOWLIST.has(ref)) continue;
    violations.push(`line ${i + 1}: action pinned to a mutable ref (not a commit SHA, not a documented exception) — ${ref}`);
  }
  return violations;
}

const BROAD_PATH_RE = /^(Read|Write|Edit)\(\/{1,2}home\/[^/]+\/(dev|actions-runner[^/)]*)\//;

function checkClaudeSettings(settings) {
  const violations = [];
  const perms = settings.permissions || {};
  if (perms.defaultMode === "bypassPermissions") {
    violations.push("permissions.defaultMode is bypassPermissions");
  }
  for (const entry of perms.allow || []) {
    if (BROAD_PATH_RE.test(entry)) {
      violations.push(`broad developer/runner path grant — ${entry}`);
    }
  }
  return violations;
}

// Every `actions/checkout` step must set `persist-credentials:` explicitly
// (true or false) rather than relying on the action's implicit default —
// REFACTOR #87 bullet 3 ("make checkout credential persistence deliberate").
// A future checkout step added without an opinion on this should fail the
// build, not silently inherit whatever the action's current default is.
function checkCheckoutCredentialPersistence(yamlText) {
  const violations = [];
  const lines = yamlText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)-\s*uses:\s*actions\/checkout@/);
    if (!m) continue;
    const stepIndent = m[1].length;
    let sawPersistCredentials = false;
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j];
      if (line.trim() === "") continue;
      const indent = line.match(/^ */)[0].length;
      if (indent <= stepIndent) break; // next sibling step or dedent — block ended
      if (/persist-credentials:\s*(true|false)/.test(line)) {
        sawPersistCredentials = true;
        break;
      }
    }
    if (!sawPersistCredentials) {
      violations.push(`line ${i + 1}: actions/checkout step has no explicit persist-credentials: true|false`);
    }
  }
  return violations;
}

// Regression guard for the trust-boundary checks REFACTOR #83 established in
// implw.yml (fork/cross-repo rejection, stale/replayed-issue rejection, Gate
// 1 label defense-in-depth, edited-body rejection, TOCTOU body-hash
// re-verification, symlink/traversal guard on the spec temp file, and
// cloud-credential-routing isolation) — REFACTOR #87 bullet 7. Each entry is
// a literal marker for one guard; a future edit that silently drops a guard
// (not just weakens the pinning/interpolation checks above) trips this.
const REQUIRED_TRUST_GUARDS = [
  { name: "canonical-repository (reject fork/cross-repo)", pattern: /github\.repository\s*\}\}"\s*!=\s*"UzorAI\/uzorai\.com"/ },
  { name: "issue-state (reject closed/stale/replayed)", pattern: /"\$STATE"\s*!=\s*"OPEN"/ },
  { name: "needs-approval label (Gate 1 defense-in-depth)", pattern: /needs-approval/ },
  { name: "author write-permission (reject non-collaborator/fork author)", pattern: /collaborators\/\$AUTHOR\/permission/ },
  { name: "userContentEdits (reject edited/bait-and-switch body)", pattern: /userContentEdits/ },
  { name: "TOCTOU body-hash re-verification", pattern: /CURRENT_HASH"\s*!=\s*"\$EXPECTED_HASH"/ },
  { name: "spec-path symlink guard", pattern: /-L\s*"\$SPEC_PATH"/ },
  { name: "spec-path traversal guard", pattern: /realpath -m/ },
  { name: "cloud-provider credential-routing isolation", pattern: /CLAUDE_CODE_USE_BEDROCK/ },
];

function checkTrustBoundaryGuards(yamlText) {
  return REQUIRED_TRUST_GUARDS.filter(({ pattern }) => !pattern.test(yamlText)).map(
    ({ name }) => `missing trust-boundary guard: ${name}`,
  );
}

const REQUIRED_GITIGNORE_LINES = [
  ".env",
  ".env.*",
  "!.env.example",
  "*.pem",
  "*.key",
  "*.log",
  "*.sqlite",
  "*.db",
  ".claude/settings.local.json",
];

function checkGitignore(text) {
  const lines = new Set(text.split("\n").map((l) => l.trim()));
  return REQUIRED_GITIGNORE_LINES.filter((required) => !lines.has(required)).map(
    (required) => `.gitignore is missing required pattern: ${required}`,
  );
}

const REQUIRED_CODEOWNERS_PATHS = ["/.github/workflows/", "/.claude/", "/scripts/security/", "/.gitignore"];

function checkCodeowners(text) {
  return REQUIRED_CODEOWNERS_PATHS.filter((p) => !text.includes(p)).map(
    (p) => `CODEOWNERS does not cover protected path: ${p}`,
  );
}

// ---------------------------------------------------------------------------
// Run against the real repo files
// ---------------------------------------------------------------------------

let failures = [];

function report(label, violations) {
  if (violations.length === 0) {
    console.log(`✓ ${label}`);
  } else {
    console.error(`✗ ${label}`);
    for (const v of violations) console.error(`  - ${v}`);
    failures = failures.concat(violations.map((v) => `${label}: ${v}`));
  }
}

const implwYml = read(".github/workflows/implw.yml");
const prValidationYml = read(".github/workflows/pr-validation.yml");
const deployYml = read(".github/workflows/deploy.yml");

report("implw.yml: no unsafe expression interpolation in run: bodies", scanForUnsafeInterpolation(implwYml));
report("pr-validation.yml: no unsafe expression interpolation in run: bodies", scanForUnsafeInterpolation(prValidationYml));
report("deploy.yml: no unsafe expression interpolation in run: bodies", scanForUnsafeInterpolation(deployYml));
report("implw.yml: actions pinned to immutable SHA or documented exception", checkActionPinning(implwYml));
report("pr-validation.yml: actions pinned to immutable SHA or documented exception", checkActionPinning(prValidationYml));
report("deploy.yml: actions pinned to immutable SHA or documented exception", checkActionPinning(deployYml));
report("implw.yml: checkout steps set persist-credentials explicitly", checkCheckoutCredentialPersistence(implwYml));
report("deploy.yml: checkout steps set persist-credentials explicitly", checkCheckoutCredentialPersistence(deployYml));
report("deploy.yml: production promotion requires explicit PROD confirmation", [
  !deployYml.includes('if [ "$PRODUCTION_CONFIRMATION" != "PROD" ]')
    ? "missing exact production confirmation guard"
    : null,
  !deployYml.includes('npx wrangler deploy --env "$DEPLOY_TARGET"')
    ? "deployment does not use the validated named environment"
    : null,
  !deployYml.includes("dev|demo)") || !deployYml.includes("production)")
    ? "release target allowlist is incomplete"
    : null,
].filter(Boolean));
report("implw.yml: trust-boundary guards present", checkTrustBoundaryGuards(implwYml));

report("`.claude/settings.json`: no bypassPermissions or broad path grants", checkClaudeSettings(JSON.parse(read(".claude/settings.json"))));
report(".gitignore: covers env/key/credential/state/db/log/agent-temp files", checkGitignore(read(".gitignore")));

if (!existsSync(join(root, ".github/CODEOWNERS"))) {
  report("CODEOWNERS exists and covers protected paths", [".github/CODEOWNERS is missing"]);
} else {
  report("CODEOWNERS exists and covers protected paths", checkCodeowners(read(".github/CODEOWNERS")));
}

// ---------------------------------------------------------------------------
// Regression fixtures — prove the checkers themselves reject bad input and
// accept good input, not just that today's repo files happen to pass.
// ---------------------------------------------------------------------------

const validIssueNumbers = JSON.parse(read("test/fixtures/security/issue-number/valid.json"));
const invalidIssueNumbers = JSON.parse(read("test/fixtures/security/issue-number/invalid.json"));

report(
  "fixture: valid issue numbers accepted",
  validIssueNumbers.filter((v) => !isValidIssueNumber(v)).map((v) => `expected valid, rejected: ${JSON.stringify(v)}`),
);
report(
  "fixture: malformed/injection issue numbers rejected",
  invalidIssueNumbers.filter((v) => isValidIssueNumber(v)).map((v) => `expected rejected, accepted: ${JSON.stringify(v)}`),
);

const vulnerableSnippet = read("test/fixtures/security/workflow-injection/vulnerable-snippet.yml");
const safeSnippet = read("test/fixtures/security/workflow-injection/safe-snippet.yml");

report(
  "fixture: vulnerable-snippet.yml is flagged",
  scanForUnsafeInterpolation(vulnerableSnippet).length === 0 ? ["expected a violation, got none"] : [],
);
report("fixture: safe-snippet.yml is not flagged", scanForUnsafeInterpolation(safeSnippet));

const hardenedSettings = JSON.parse(read("test/fixtures/security/claude-settings/hardened.json"));
const insecureSettings = JSON.parse(read("test/fixtures/security/claude-settings/insecure.json"));

report("fixture: hardened.json settings pass", checkClaudeSettings(hardenedSettings));
report(
  "fixture: insecure.json settings are flagged",
  checkClaudeSettings(insecureSettings).length === 0 ? ["expected violations, got none"] : [],
);

const pinnedActionsSnippet = read("test/fixtures/security/action-pinning/pinned.yml");
const unpinnedActionsSnippet = read("test/fixtures/security/action-pinning/unpinned.yml");

report("fixture: pinned.yml actions pass", checkActionPinning(pinnedActionsSnippet));
report(
  "fixture: unpinned.yml actions are flagged",
  checkActionPinning(unpinnedActionsSnippet).length === 0 ? ["expected violations, got none"] : [],
);

const explicitPersistCredentials = read("test/fixtures/security/checkout-credentials/explicit.yml");
const implicitPersistCredentials = read("test/fixtures/security/checkout-credentials/implicit.yml");

report("fixture: explicit.yml persist-credentials passes", checkCheckoutCredentialPersistence(explicitPersistCredentials));
report(
  "fixture: implicit.yml persist-credentials is flagged",
  checkCheckoutCredentialPersistence(implicitPersistCredentials).length === 0 ? ["expected violations, got none"] : [],
);

const hardenedTrustGuards = read("test/fixtures/security/trust-guards/hardened.yml");
const regressedTrustGuards = read("test/fixtures/security/trust-guards/regressed.yml");

report("fixture: hardened.yml trust guards pass", checkTrustBoundaryGuards(hardenedTrustGuards));
report(
  "fixture: regressed.yml trust guards are flagged",
  checkTrustBoundaryGuards(regressedTrustGuards).length === 0 ? ["expected violations, got none"] : [],
);

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-workflow-hardening FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-workflow-hardening passed\n");
