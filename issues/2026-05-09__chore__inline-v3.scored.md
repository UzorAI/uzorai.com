# CHORE: Establish public-repository security hygiene and dependency remediation

## Intent
Child of #80. Add durable secret-file exclusions, redacted secret scanning, private vulnerability reporting, protected-path ownership, and reviewed dependency remediation. Preserve a safe `.env.example` convention. Current Gitleaks 8.30.1 scans are clean across the tree and 52 commits; npm audit reports 11 advisories. Do not rotate credentials, use forced audit fixes, deploy, or expose secret values.

## Action
1. Expand `.gitignore` for `.env`, `.env.*`, `.dev.vars*`, keys/certificates, credential files, Wrangler state, agent temporaries, local databases, logs, build output, and OS metadata; explicitly allow only reviewed example templates.
2. Add a pinned, redacted secret scan for current tree and accessible history plus regression fixtures containing mock values only.
3. Add `SECURITY.md` with a private reporting route and safe disclosure expectations; add CODEOWNERS for workflows, agent settings, Wrangler, dependencies, and security policy.
4. Replace public repository Claude settings with least privilege and remove unnecessary absolute developer/runner paths and broad destructive/network shell grants.
5. Upgrade direct Hono and React Router dependencies to patched compatible releases; migrate Wrangler separately to a supported patched major after changelog/compatibility review. Refresh the lockfile without `--force`.
6. Assess each advisory's production/build/dev reachability, lifecycle scripts, lock integrity, dependency confusion/typosquatting, and build-time network behavior; record residual risk.
7. Run clean install, typecheck/build/tests, audit, secret scan, workflow static analysis, and verify logs contain no secrets.

## Acceptance Criteria
- [ ] Ignore tests cover all named secret/key/credential/Wrangler/temp/database/log/build/OS patterns and permit only safe example files.
- [ ] Pinned secret scanning checks current tree and full accessible history, redacts values, and detects mock regression fixtures without logging them.
- [ ] `SECURITY.md` provides a working private reporting path; CODEOWNERS covers all protected paths.
- [ ] Repository Claude settings have no bypass mode, broad `rm`/`curl` grants, or absolute developer/runner paths.
- [ ] Lockfile integrity is preserved; no forced audit fix; direct dependencies are patched or an explicit reachability-based residual-risk exception is documented.
- [ ] Lifecycle scripts are inventoried/allowlisted and CI does not grant them secrets or privileged host access.
- [ ] `npm ci`, typecheck/build, tests, audit review, actionlint, and redacted scan pass as specified.

## Files
```
.gitignore
.gitleaks.toml
.github/workflows/security.yml
.github/CODEOWNERS
SECURITY.md
.claude/settings.json
package.json
package-lock.json
scripts/assert-security-hygiene.mjs
docs/SECURITY_ASSESSMENT.md
```

## Legal triggers
Dependency licenses must be reviewed; no PHI, PCI, personal-data migration, or credential-value processing is authorized.

## Work Estimate
### Active operator time
| Phase | Wait dependency | Estimate |
|---|---|---|
| Hygiene/policy/tests | None | 5 hours |
| Dependency review/upgrades | registry/advisories | 6 hours |
| Review | maintainer | 2 hours |
| **Total** | — | 13 hours |
### Wall-clock time
| Phase | Wait dependency | Estimate |
|---|---|---|
| Implementation/checks | CI | 2 days |
| Review | human | 1–2 days |
| **Total** | — | 3–4 days |
### Assumptions
- Private vulnerability reporting can be enabled without paid cost.
- Compatible patched dependency releases exist or residual risk can be explicitly accepted by a human.
### Actuals (filled post-execution)
| Phase | Estimate | Actual | Delta |
|---|---|---|---|
| Implementation | 13h | TBD | TBD |
| **Total** | 13h | TBD | TBD |

---

## ZAI Spec Score

- **Rubric version:** 1.5.0
- **Spec type:** chore
- **Evaluated at:** 2026-08-31T09:16:17.895Z
- **Score:** 6/6
- **Passed:** YES

| Section | Status |
|---|---|
| intent | PASS |
| action | PASS |
| acceptance_criteria | PASS |
| files | PASS |
| legal_triggers | PASS |
| work_estimate | PASS |

_Source: 2026-05-09__chore__inline.md_

---

## Provenance (auto-materialized)

- **Acquisition path:** Path B — inline-scored issue body (MCP). Path A resolved
  (`issues/2026-05-09__chore__inline.scored.md` exists) but its content is for a
  different issue (#53, Russian hero tagline), not issue #81. Path A precedence
  applies only when the file's content matches the current spec; in this case Path B
  is authoritative. Materialized as `-v3` (`.scored.md` and `-v2.scored.md` are both
  taken by prior materializations for unrelated chore specs).
- **Source issue:** UzorAI/uzorai.com#81 — "CHORE: Establish public-repository
  security hygiene and dependency remediation" (created 2026-08-31T09:16:18Z).
- **Integrity re-score:** re-ran `score_spec` (spec_type=chore) on the acquired body →
  6/6 PASS, rubric 1.5.0 — matches the stored score block. No mismatch.
- **Gate 1:** CHORE → AUTO (full pass, no `gates[]` declared, no `needs-approval` label).
  No HOLD; no approval channel required. PR review by daniel-silvers remains required to merge.
- **Materialized by:** `/implw` for issue #81 on branch
  `htu/establish-public-repository-security-hygiene-and-dependency-remediation-81`;
  committed with the implementation PR.
