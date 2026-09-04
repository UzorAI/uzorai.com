#!/usr/bin/env node
// Fail-closed post-run completion-evidence gate for implw (BUG htu-foundation#333).
// Runs after the implementation subprocess reports a zero exit code and
// independently verifies, against GitHub and the local git state — never
// trusting the subprocess's own exit code alone — that exactly one of a
// verified pushed-commit-plus-PR result or an explicit governed no-change
// manifest exists. Exits non-zero (job fails) on any other outcome, which
// is the truthful conclusion run `30344067030` should have produced instead
// of `success`.
//
// Usage: node scripts/require-implw-completion-evidence.mjs
// Required env: GITHUB_REPOSITORY (owner/name), ISSUE_NUMBER
// Optional env: NO_CHANGE_MANIFEST_PATH, REQUESTED_PROVIDER, RESOLVED_PROVIDER
// Ambient (set by GitHub Actions): GITHUB_OUTPUT, GITHUB_STEP_SUMMARY
//
// The workflow itself never learns the branch name the agent chooses (the
// `htu/<slug>` slug is derived from the issue title inside the skill, not
// the workflow) — so a PR is matched by whether its body references
// `Closes #<issue>`, the same convention every implw-opened PR already
// follows, rather than by branch name. This also keeps the check correct
// if a previous run for the same issue left a stale open PR behind: the
// most recently created matching PR wins.

import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { classifyCompletionEvidence } from './lib/implwCompletionEvidence.mjs';

function setOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`missing required env var: ${name}`);
  return value;
}

function findPr(repo, issueNumber) {
  const result = spawnSync(
    'gh',
    ['pr', 'list', '--repo', repo, '--state', 'open', '--json', 'number,url,headRefOid,body,createdAt'],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) return null;
  let prs;
  try {
    prs = JSON.parse(result.stdout || '[]');
  } catch {
    return null;
  }
  if (!Array.isArray(prs)) return null;

  const closesRe = new RegExp(`\\bcloses?\\s+#${issueNumber}\\b`, 'i');
  const matches = prs.filter((pr) => closesRe.test(pr.body ?? ''));
  if (matches.length === 0) return null;

  matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [pr] = matches;
  return { number: pr.number, url: pr.url, headSha: pr.headRefOid };
}

function readNoChangeManifest(path) {
  if (!path || !existsSync(path)) return null;
  const raw = readFileSync(path, 'utf8').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { reason: null, evidence: null }; // present but unparsable — fails closed as invalid
  }
}

function localBranchHeadSha() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function main() {
  const repo = requireEnv('GITHUB_REPOSITORY');
  const issueNumber = requireEnv('ISSUE_NUMBER');
  const requestedProvider = process.env.REQUESTED_PROVIDER ?? '';
  const resolvedProvider = process.env.RESOLVED_PROVIDER ?? '';

  const pr = findPr(repo, issueNumber);
  const pushedHeadSha = localBranchHeadSha();
  const noChangeManifest = pr ? null : readNoChangeManifest(process.env.NO_CHANGE_MANIFEST_PATH);

  const result = classifyCompletionEvidence({
    pr,
    pushedHeadSha,
    noChangeManifest,
    requestedProvider,
    resolvedProvider,
  });

  setOutput('completion_ok', result.ok);
  setOutput('completion_classification', result.classification);
  setOutput('completion_reason', result.reason);
  if (pr) {
    setOutput('pr_number', pr.number);
    setOutput('pr_url', pr.url);
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = [
      '## implw completion evidence',
      '',
      `**Result:** ${result.ok ? 'verified' : 'FAILED'}`,
      `**Classification:** ${result.classification}`,
      `**Reason:** ${result.reason}`,
      `**Requested provider:** ${requestedProvider || '(unset)'}`,
      `**Resolved provider:** ${resolvedProvider || '(unset)'}`,
      '',
      '```json',
      JSON.stringify(result.manifest, null, 2),
      '```',
      '',
    ].join('\n');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }

  if (!result.ok) {
    console.error(`[require-implw-completion-evidence] ${result.classification}: ${result.reason}`);
    process.exit(3);
  }

  console.log(`[require-implw-completion-evidence] ${result.classification}: ${result.reason}`);
}

main();
