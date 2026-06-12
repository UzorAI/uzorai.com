# Versioning policy

_Canonical reference for the deterministic version-bump policy
(FEAT zzv-skills#130). This file is repo-agnostic and is seeded into every
newly onboarded repo by `scripts/onboard-repo.sh`._

## Single source of truth

`package.json::version` is the **one** canonical version for the Worker.

- `src/constants.ts` does **not** hardcode the version. It derives
  `SERVER_VERSION` from `package.json` (named import under
  `resolveJsonModule`, tree-shaken to the `version` string by the bundler).
- `src/tools/get_server_version.ts` returns that derived `SERVER_VERSION`,
  so the `get_server_version` MCP tool, the `deployment_history` ledger, and
  `package.json` all report the same number. There is no second version to
  drift from.
- `scripts/post-deploy.sh` reads the version from `package.json` when it
  writes the `deployment_history` row, so the recorded version always
  matches the live bundle.

The MCP `serverInfo.version` advertised on the protocol handshake
(`src/index.ts`) is a separate, protocol-relevant value and is **not**
governed by this policy.

## Bump tiers — derived from the scored spec type

The version bump is **not a free choice**. It is derived from the
implementing issue's spec type / label, applied **inside the implementing
PR** (never auto-committed to `main`), so it stays under dual-control review:

| Spec type / label            | Bump   | Example          |
|------------------------------|--------|------------------|
| `feat`                       | minor  | 1.12.0 → 1.13.0  |
| `bug` / `chore` / `refactor` / `spec` / `ux` / `brand` | patch  | 1.13.0 → 1.13.1  |
| issue carrying `breaking`    | major  | 1.13.1 → 2.0.0   |
| `epic`                       | none   | (umbrella issue; no shippable change of its own) |

`implw` reads the issue's spec type / label and applies the tier in the
same PR: it edits `package.json::version` and prepends a `CHANGELOG.md`
entry. The version delta therefore appears in the reviewed diff, where the
approver can check the tier against the actual change.

A `breaking` label takes precedence over the spec-type tier (a `feat`
carrying `breaking` is a major bump).

## Enforcement — deploy-time guard

`.github/workflows/deploy-worker.yml` carries a **version-advance guard**
that runs before the deploy. It reads the most recent version recorded in
the target env's `deployment_history` ledger and **fails the deploy unless
`package.json::version` is strictly greater (semver)**.

- A forgotten in-PR bump cannot ship a stale version stamp — the guard
  refuses it.
- Two PRs that bump to the same version collide at deploy: the second is
  refused until it is rebased and re-bumped past the first.
- An empty ledger (a fresh env, or a table not yet migrated) is the
  **baseline** and passes — the first deploy establishes the floor.

The guard is enforcement only; it never bumps. The bump always lives inside
the reviewed PR, so no version change escapes dual control.

## When the policy changes

- ZAI introduces a spec type absent from the tier table above → extend the
  table and `docs/VERSIONING.md` in the same PR.
- A repo needs per-package versions (multi-worker monorepo) → revisit the
  single-source assumption.
- Migration to GitHub Releases / tag-driven versioning → reconcile this
  policy with the tags.
