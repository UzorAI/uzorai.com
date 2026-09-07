# Phase 8 / Phase 9 — live-evidence investigation (EPIC UzorAI/uzorai.com#69)

This is the live-repository investigation Phase 8 (#77/PR #132) and Phase 9
(#78/PR #138) each name as a blocking open question in their own spec text
("depends on Phase 1 ownership/trusted sources", "exact repository paths,
component classification, compatibility window... must be resolved from
Phase 1 live evidence"). Both phases correctly declined to implement and
instead materialized their scored spec — that was the right call given no
document like this existed yet.

`docs/uzor-loop-evidence-and-ownership.md` is the EPIC's actual Phase 1
deliverable (FEAT #94), but it only covers hero/workflow-model ownership. It
never addresses storage or backend infrastructure, which is exactly the
question Phase 8 and Phase 9 need answered. This document fills that gap.
Nothing here changes runtime behavior; it is an audit, cross-referenced
against `main` at the commit this file was added.

Classifications used below match `uzor-loop-evidence-and-ownership.md`:

- **KEEP AS-IS** — correct and sufficient for downstream consumption unchanged.
- **KEEP + ADAPT** — usable, but a downstream phase will need to extend or reshape it.
- **REPLACE** — present, but the wrong shape/implementation for what's coming.
- **DEPRECATE** — present only for compatibility; do not build on it.
- **ABSENT** — no such component exists; a downstream phase must create it.

## Phase 8 — Browser performance inventory and offline resilience

### Existing small-state storage (`src/shared/safeStorage.js`)

- **Evidence**: `readBoundedStorage` / `writeBoundedStorage` wrap
  `window.localStorage` with a bounded key length (64 chars) and value
  length (256 chars), fail closed (return `null`/`false`) on any throw
  (private mode, quota, disabled storage) or out-of-bounds input. Currently
  consumed by `LocaleProvider` and `initTheme` for exactly two keys:
  `uzor-locale`, `uzor-theme`. Covered by
  `scripts/security/assert-browser-boundary.mjs` (CI regression gate).
- **Ownership**: no `CODEOWNERS` entry for `src/shared/`; owner unresolved
  (default repository review applies).
- **Classification**: **KEEP AS-IS**. This is exactly the shape Phase 8's
  Final Spec describes for localStorage ("locale, sound preference, voice
  mode, last sequence, and active manifest/version pointers or equivalent
  small state") — reuse the existing bounded read/write functions and
  bounds constants for any new small-state keys Phase 8 introduces; do not
  write a second localStorage wrapper.

### IndexedDB / substantial-inventory storage

- **Evidence**: no IndexedDB usage, wrapper, or convention exists anywhere
  in the repository (`grep -ri indexeddb src/` and `grep -ri dexie
  src/ package.json` both return nothing). `package.json` dependencies are
  `hono`, `react`, `react-dom`, `react-router-dom` only — no storage
  library of any kind is installed.
- **Ownership**: N/A — nothing to own yet.
- **Classification**: **ABSENT**. Per Phase 8's own Decision Tree Branch 1
  ("If Phase 1 finds an existing IndexedDB abstraction, reuse it; otherwise
  choose the smallest governed IndexedDB wrapper and document why"), this
  branch resolves to the "otherwise" side: there is nothing to reuse. A
  downstream implementer must explicitly choose and document one of:
  - the browser's native `indexedDB` API directly (zero new dependency,
    more boilerplate), or
  - a minimal wrapper library (e.g. `idb`, ~1.2 KB gzipped) added as a new
    `package.json` dependency.

  This repository currently has zero storage dependencies by design
  (`REFACTOR #15` keeps the dependency list to exactly what each shipped
  feature needs) — adding one is a real, visible decision, not an
  implementation detail, which is plausibly why prior implw runs declined
  to pick one unilaterally from the spec text alone.

### Data shape Phase 8 must persist

- **Evidence**: Phase 7 (`src/client/performance/phrase/schema.ts`,
  `src/client/performance/phrase/reservoir.ts`,
  `src/client/performance/manifest/compiler.ts`) defines
  `ApprovedPhrase`, `PhraseReservoir`, and `PerformanceManifest32Bar` as
  plain TypeScript interfaces over `readonly` arrays — pure, in-memory,
  synthetic-fixture-tested functions (`checkInventory`,
  `emitReplenishmentSignal`, the manifest compiler). No persistence,
  serialization, or browser API of any kind is wired to these types today.
- **Ownership**: `src/client/performance/` — no `CODEOWNERS` entry; owner
  unresolved.
- **Classification**: **KEEP + ADAPT**. Phase 8 is the first phase that
  wires these existing, stable (`1.0.0`-pinned per
  `docs/phrase-reservoir-and-performance-manifests.md`) types to actual
  browser storage. The types themselves need no change; Phase 8 adds a
  serialization/schema-migration layer around them for whichever IndexedDB
  wrapper is chosen above.

## Phase 9 — Governed asynchronous Content Factory

### Server/Worker infrastructure

- **Evidence**: `src/server/index.ts` is the entire server — a single
  file. `wrangler.toml` defines three environments (`dev`, `demo`,
  `production`) each with only a `[env.*.assets]` binding
  (`directory = "./dist/client"`, SPA fallback). There is no D1 database,
  no KV namespace, no Durable Object, no Queue, and no Cron Trigger
  configured in any environment.
- **Ownership**: no `CODEOWNERS` entry for `src/server/` or
  `wrangler.toml`; owner unresolved.
- **Classification**: **ABSENT**. Phase 9's DISCOVER → EXTRACT → VERIFY →
  SCORE → APPROVE → GENERATE → VALIDATE → PUBLISH → OBSERVE → LEARN →
  REPLENISH pipeline, and its own requirement to "separate the data plane
  from the control plane," has no infrastructure to run on today. At
  minimum this needs:
  - a durable store for the reservoir/manifest data the pipeline
    produces (D1 or KV), and
  - an asynchronous execution mechanism (Cloudflare Queues, Cron
    Triggers, or a Durable Object) to actually run the pipeline stages
    outside the request/response cycle a static-asset Worker handles
    today.

  Unlike Phase 8's gap (a client-side dependency choice), this is a
  request for new, billable Cloudflare resources and a new network-facing
  surface (whatever ingests DISCOVER/EXTRACT sources). That is a
  materially larger, separately-governed infrastructure decision — it
  should not be bundled into a routine implw dispatch without an explicit
  human sign-off on which primitives to provision.

### Trusted-source / allowlist precedent

- **Evidence**: this repository's implw/deploy tooling (not the public
  Worker) already has a live example of an explicit, versioned trust
  boundary — `scripts/codex-auth-preflight.sh` and the CI-side
  `IMPLW_ALLOWLIST`/`DEPLOY_WORKER_ALLOWLIST` pattern documented in the
  sibling `zzv-skills` repo's `src/config/repo-registry.ts` (cross-repo
  reference, not a file in this repo). No equivalent allowlist exists yet
  for Phase 9's own "trusted-source policy" (Decision Tree Branch 1:
  "If a source is not allowlisted/trusted... do not retrieve/publish").
- **Classification**: **ABSENT** — Phase 9 needs its own source-allowlist
  mechanism; the zzv-skills pattern is architectural precedent to follow,
  not code to import (different repo, different trust boundary).

## Summary for a future implw dispatch

| Phase | Gap size | What's missing | Decision needed before implementation |
|---|---|---|---|
| 8 | Small | IndexedDB wrapper | Pick `idb` vs. raw `indexedDB` API; document choice |
| 9 | Large | D1/KV + Queues/Cron/DO; source allowlist | Provision new Cloudflare resources; define trusted-source list |

Phase 8 is realistically the next unblockable step: once an IndexedDB
wrapper choice is made and recorded (e.g. as an ADR or an update to this
file), a future implw dispatch on a fresh Phase 8 spec has an unambiguous
answer to its own Decision Tree Branch 1 instead of an open question.
Phase 9 needs a human infrastructure-provisioning decision first — that is
out of scope for this document and for implw to decide unilaterally.

## Governing evidence chain

| Evidence | Role |
|---|---|
| `UzorAI/uzorai.com#69` | Governing UZOR Cultural Engine EPIC and phase dependency graph. |
| `UzorAI/uzorai.com#70` / `#94` / `#95` | Phase 1's original research contract and its hero/workflow-ownership deliverable (`docs/uzor-loop-evidence-and-ownership.md`) — does not cover storage/backend. |
| `UzorAI/uzorai.com#77` / PR #132 | Phase 8 spec, materialized without implementation pending this investigation. |
| `UzorAI/uzorai.com#78` / PR #138 | Phase 9 spec, materialized without implementation pending this investigation. |
| `UzorAI/uzorai.com#133` / PR #134, `#135` / PR #136 | implw completion-evidence visibility fixes that made the Phase 8/9 no-change outcomes diagnosable in the first place. |
