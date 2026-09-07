#!/usr/bin/env node
/**
 * scripts/assert-security-hygiene.mjs
 *
 * Build-time guard for CHORE #81 (Establish public-repository security hygiene
 * and dependency remediation). Verifies that:
 *  - .gitignore covers .dev.vars*, OS metadata, and additional cert/key patterns
 *  - .gitleaks.toml exists and enables the default rule set
 *  - SECURITY.md exists with a working private reporting path
 *  - CODEOWNERS covers all protected paths added in this PR
 *  - .claude/settings.json has no broad rm:/curl: shell grants
 *  - Gitleaks regression fixture is in place (scanner validation without secret exposure)
 *
 * Runs the real repo files first, then regression fixtures to prove each
 * checker distinguishes bad from good.
 *
 * Pure Node built-ins — no devDependency.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relPath) => readFileSync(join(root, relPath), "utf8");
const exists = (relPath) => existsSync(join(root, relPath));

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

// ---------------------------------------------------------------------------
// Checkers
// ---------------------------------------------------------------------------

const GITIGNORE_HYGIENE_LINES = [
  ".dev.vars*",
  ".DS_Store",
  "*.crt",
  "*.pfx",
];

function checkGitignoreHygiene(text) {
  const lines = new Set(text.split("\n").map((l) => l.trim()));
  return GITIGNORE_HYGIENE_LINES.filter((p) => !lines.has(p)).map(
    (p) => `.gitignore is missing required pattern: ${p}`,
  );
}

function checkGitleaksConfig(text) {
  const violations = [];
  if (!text.includes("useDefault = true")) {
    violations.push(".gitleaks.toml does not enable the default rule set (useDefault = true)");
  }
  if (!text.includes("[[allowlists]]")) {
    violations.push(".gitleaks.toml has no [[allowlists]] block for regression fixtures");
  }
  if (!text.includes("test/fixtures/security/gitleaks/")) {
    violations.push(".gitleaks.toml does not allowlist the regression fixture directory");
  }
  return violations;
}

const CODEOWNERS_HYGIENE_PATHS = [
  "/.gitleaks.toml",
  "/SECURITY.md",
  "/wrangler.toml",
  "/package.json",
  "/package-lock.json",
];

function checkCodeownersHygiene(text) {
  return CODEOWNERS_HYGIENE_PATHS.filter((p) => !text.includes(p)).map(
    (p) => `CODEOWNERS does not cover protected path: ${p}`,
  );
}

const BROAD_SHELL_GRANTS = ["Bash(rm:*)", "Bash(curl:*)"];

function checkClaudeBroadGrants(settings) {
  const allow = (settings.permissions || {}).allow || [];
  return BROAD_SHELL_GRANTS.filter((grant) => allow.includes(grant)).map(
    (grant) => `broad shell grant present in .claude/settings.json: ${grant}`,
  );
}

// ---------------------------------------------------------------------------
// Run against real repo files
// ---------------------------------------------------------------------------

report(".gitignore: covers .dev.vars*, OS metadata, additional cert/key patterns", checkGitignoreHygiene(read(".gitignore")));

if (!exists(".gitleaks.toml")) {
  report(".gitleaks.toml: exists and enables default rule set + regression fixture allowlist", [".gitleaks.toml is missing"]);
} else {
  report(".gitleaks.toml: exists and enables default rule set + regression fixture allowlist", checkGitleaksConfig(read(".gitleaks.toml")));
}

if (!exists("SECURITY.md")) {
  report("SECURITY.md: exists with private reporting path", ["SECURITY.md is missing"]);
} else {
  const securityMd = read("SECURITY.md");
  report("SECURITY.md: exists with private reporting path", [
    !securityMd.includes("security/advisories") ? "SECURITY.md does not reference the GitHub Security Advisories URL" : null,
    !securityMd.includes("Report a vulnerability") ? "SECURITY.md does not mention the 'Report a vulnerability' button" : null,
  ].filter(Boolean));
}

if (!exists(".github/CODEOWNERS")) {
  report("CODEOWNERS: covers new protected paths from CHORE #81", [".github/CODEOWNERS is missing"]);
} else {
  report("CODEOWNERS: covers new protected paths from CHORE #81", checkCodeownersHygiene(read(".github/CODEOWNERS")));
}

report(
  ".claude/settings.json: no broad rm:/curl: shell grants",
  checkClaudeBroadGrants(JSON.parse(read(".claude/settings.json"))),
);

report(
  "Gitleaks regression fixture: test/fixtures/security/gitleaks/mock-secrets.txt exists",
  exists("test/fixtures/security/gitleaks/mock-secrets.txt") ? [] : ["mock-secrets.txt regression fixture is missing"],
);

// ---------------------------------------------------------------------------
// Regression fixtures — prove each checker distinguishes bad from good
// ---------------------------------------------------------------------------

const cleanGitignore = [
  ".dev.vars*", ".DS_Store", "*.crt", "*.pfx",
  ".env", ".env.*", "!.env.example",
].join("\n");

const incompleteGitignore = [
  ".env", ".env.*",
].join("\n");

report("fixture: complete gitignore hygiene patterns pass", checkGitignoreHygiene(cleanGitignore));
report(
  "fixture: incomplete gitignore hygiene is flagged",
  checkGitignoreHygiene(incompleteGitignore).length === 0 ? ["expected violations, got none"] : [],
);

const validGitleaksConfig = `title = "test"\n[extend]\nuseDefault = true\n[[allowlists]]\ndescription = "fixtures"\npaths = ["test/fixtures/security/gitleaks/"]\n`;
const missingGitleaksConfig = `title = "test"\n`;

report("fixture: valid .gitleaks.toml passes", checkGitleaksConfig(validGitleaksConfig));
report(
  "fixture: .gitleaks.toml without useDefault is flagged",
  checkGitleaksConfig(missingGitleaksConfig).length === 0 ? ["expected violations, got none"] : [],
);

const fullCodeowners = `/.gitleaks.toml @daniel-silvers\n/SECURITY.md @daniel-silvers\n/wrangler.toml @daniel-silvers\n/package.json @daniel-silvers\n/package-lock.json @daniel-silvers\n`;
const emptyCodeowners = `# empty\n`;

report("fixture: complete CODEOWNERS coverage passes", checkCodeownersHygiene(fullCodeowners));
report(
  "fixture: incomplete CODEOWNERS coverage is flagged",
  checkCodeownersHygiene(emptyCodeowners).length === 0 ? ["expected violations, got none"] : [],
);

const cleanSettings = { permissions: { allow: ["Bash(gh:*)", "Bash(git:*)"], deny: [] } };
const broadSettings = JSON.parse(read("test/fixtures/security/claude-settings/broad-grants.json"));

report("fixture: settings without rm/curl grants pass", checkClaudeBroadGrants(cleanSettings));
report(
  "fixture: settings with Bash(rm:*)/Bash(curl:*) are flagged",
  checkClaudeBroadGrants(broadSettings).length === 0 ? ["expected violations, got none"] : [],
);

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ assert-security-hygiene FAILED (${failures.length} violation(s))\n`);
  process.exit(1);
}

console.log("\n✓ assert-security-hygiene passed\n");
