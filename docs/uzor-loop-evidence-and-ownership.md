# UZOR Loop — repository evidence and ownership matrix

Phase 1 deliverable for FEAT #94 (Parent #70, EPIC #69). This document
records what the live repository actually contains for every subject the
canonical model (`src/client/workflow/uzorLoopModel.ts`) or a downstream
consumer might need, classifies each audited component, and marks
provenance that is unresolved rather than guessing it. Nothing here changes
runtime behavior; it is an audit, cross-referenced against `main` at the
commit this file was added.

Classifications used below:

- **KEEP AS-IS** — correct and sufficient for downstream consumption unchanged.
- **KEEP + ADAPT** — usable, but a downstream phase will need to extend or reshape it.
- **REPLACE** — present, but the wrong shape/implementation for what's coming.
- **DEPRECATE** — present only for compatibility; do not build on it.

## Current hero (`src/client/routes/Home.tsx`)

- **Evidence**: hero section (headline/subhead via `t()`), a "meaning strip"
  gloss, a three-pillar grid (`orchestrate` / `govern` / `execute`), and an
  MCP-endpoint callout. No workflow/loop visualization, animation, or audio
  exists on the live page today.
- **Ownership**: no `CODEOWNERS` entry covers `src/client/routes/`; owner
  unresolved (default repository review applies).
- **Classification**: **KEEP + ADAPT**. The three pillars already name the
  `orchestrate`/`govern`/`execute` grouping this model's stages elaborate;
  a downstream phase (#71) can adapt the hero to consume a derived sequence
  without redesigning the surrounding page.

## Brand / token assets (`src/client/brand/`, `branding/`)

- **Evidence**: `src/client/brand/tokens.css` defines the role-bound
  palette (Graphite/Slate/Soft White/Teal/Aqua) sourced from
  `branding/README.md`, which states the palette is canonical and "do not
  improvise." `branding/generate-assets.py` is the single source of truth
  for the mark; `src/client/brand/uzor-mark.svg` is the shipped cube mark.
- **Ownership**: no `CODEOWNERS` entry for `src/client/brand/` or
  `branding/`; owner unresolved.
- **Classification**: **KEEP AS-IS**. Any UZOR Loop presentation must reuse
  these tokens (`var(--accent)`, `var(--teal)`, etc.) rather than
  introducing new color values.

## Localization and RTL (`src/client/i18n/`, `src/client/config/languages.ts`, `src/client/styles/rtl.css`)

- **Evidence**: `LocaleProvider` persists a validated locale via
  `readBoundedStorage`/`writeBoundedStorage` and sets `<html lang/dir>`.
  `config/languages.ts` currently ships **en, es, ru, zh — all `dir: 'ltr'`**;
  Arabic (`ar`, `dir: 'rtl'`) is explicitly gated behind a future RTL
  review and is not in `LANGUAGES` today. `styles/rtl.css` already scopes
  flip rules under `[dir="rtl"]`, so it is inert but present.
- **Ownership**: no `CODEOWNERS` entry for `src/client/i18n/` or
  `src/client/config/`; owner unresolved.
- **Classification**: **KEEP + ADAPT**. The `dir` mechanism the canonical
  model's `PresentationDirection` metadata rides on already exists
  end-to-end; adapting means adding an `ar` dictionary + `LANGUAGES` entry
  in a separately governed phase, not building new RTL plumbing.
- **Correction of a prior assumption**: the spec's own file list uses "RTL"
  as a live concern; live evidence shows RTL is architected but **no RTL
  locale ships today**. Recorded here rather than silently assumed live.

## Browser storage (`src/shared/safeStorage.js`)

- **Evidence**: bounded `readBoundedStorage`/`writeBoundedStorage` (key
  ≤ 64 chars, value ≤ 256 chars, try/catch around all storage access).
  Used by `LocaleProvider` (`uzor-locale`) and `initTheme`
  (`uzor-theme`, by inspection of the theme provider's `persistTheme`
  call). No other persisted keys exist in the repository today.
- **Ownership**: no `CODEOWNERS` entry for `src/shared/`; owner unresolved.
  (Contrast: `scripts/security/` — which regression-tests this file
  directly — **is** owned, `@daniel-silvers`.)
- **Classification**: **KEEP AS-IS**. Any future HUD/status persistence
  (e.g. "last completed stage") must go through this bounded helper, not
  raw `localStorage` calls.

## Help routes

- **Evidence**: `src/client/config/routes.ts` lists exactly six routes:
  `/`, `/platform`, `/governance`, `/docs`, `/pricing`, `/contact`. There
  is **no `/help` route**. `Docs.tsx` is the closest existing surface (one
  link out to the MCP endpoint); it is not a help center.
- **Ownership**: no `CODEOWNERS` entry for `src/client/config/routes.ts`;
  owner unresolved.
- **Classification**: not applicable — the subject does not exist in the
  repository. Recorded as an absence per the fail-closed contract rather
  than inventing a help surface.

## Worker / API boundary (`src/shared/workerApp.js`, `src/server/index.ts`)

- **Evidence**: `createApp()` is a Hono factory: security headers applied
  to every response (including error paths) via a `finally` block; a host
  allowlist (`normalizeHost`) fails closed to a bounded 404 for any
  non-approved host; `GET`/`HEAD` reach the `ASSETS` binding (SPA
  fallback), everything else gets `405`; `onError` never leaks a stack
  trace. `src/server/index.ts` re-exports this app verbatim as the Worker
  entrypoint. `scripts/security/assert-worker-boundary.mjs` exercises the
  real object in-process.
- **Ownership**: `scripts/security/` is owned (`@daniel-silvers` per
  `.github/CODEOWNERS`); `src/shared/workerApp.js` and
  `src/server/index.ts` themselves have no `CODEOWNERS` entry — owner
  unresolved for the implementation, resolved for its regression guard.
- **Classification**: **KEEP AS-IS**. No API surface exists beyond
  `/healthz` and static asset serving; nothing here needs to change for
  Phase 1 or is authorized to (this spec adds no endpoints).

## Domains / deployment configuration (`wrangler.toml`)

- **Evidence**: `name = "uzorai"`, Worker entry `src/server/index.ts`,
  four bound custom-domain routes (`uzorai.com`, `uzor.ai`,
  `www.uzorai.com`, `www.uzor.ai`), `[assets]` binding serving
  `./dist/client` with SPA fallback. The file's own header states
  "Production cutover complete (2026-06-13)."
- **Ownership**: no `CODEOWNERS` entry for `wrangler.toml`; owner
  unresolved. (`.github/workflows/` — which deploys via
  `deploy.yml` — **is** owned, `@daniel-silvers`.)
- **Classification**: **KEEP AS-IS**. This phase makes no deployment,
  domain, or routing change, per the spec's explicit exclusions.

## Governance / CI contract references (`.github/CODEOWNERS`, `.claude/commands/implw.md`)

- **Evidence**: `.github/CODEOWNERS` cites `docs/IMPLW_FLOW.md` as the
  Gate 1 source of truth ("this complements... the /implw flow (see
  docs/IMPLW_FLOW.md)"). `.claude/commands/implw.md` itself states
  "Spec acquisition is the contract defined in `docs/IMPLW_FLOW.md` — that
  document is the source of truth... if the two ever diverge,
  IMPLW_FLOW.md wins." **`docs/IMPLW_FLOW.md` does not exist in this
  repository at the commit this document was added.**
- **Ownership**: `.github/CODEOWNERS` and `.claude/` are owned
  (`@daniel-silvers`); the missing referenced document has no owner to
  resolve, because it doesn't exist to own.
- **Classification**: **REPLACE** (the reference, not code) — flagged as a
  gap rather than silently worked around. This implementation followed
  `.claude/commands/implw.md`'s inline instructions as the best available
  operative contract, since no divergent `IMPLW_FLOW.md` exists to defer
  to. Not remediated in this phase: doing so is outside Phase 1's
  authorized file list.

## Unresolved: music / audio / content / provenance owners

- **Evidence**: no audio, music, voice, or generated-content asset exists
  anywhere in the repository (`branding/`, `src/client/brand/`, and
  `public/` contain only static image/icon/manifest files). No
  `LICENSE`-style attribution file for third-party media exists because
  no such media exists yet.
- **Ownership**: **unresolved** — there is nothing in the repository to
  attribute, and no named owner for a category that has no asset yet.
- **Classification**: not applicable — recorded as an open question per
  the spec's Subject Migration Summary, not guessed. Downstream phases
  that introduce licensed music, voice, or generated content must
  establish evidence and ownership before this document can classify
  them.

## Summary table

| Subject | Classification | Owner (CODEOWNERS) |
|---|---|---|
| Hero (`Home.tsx`) | KEEP + ADAPT | unresolved |
| Brand/token assets | KEEP AS-IS | unresolved |
| i18n / RTL | KEEP + ADAPT | unresolved |
| Browser storage (`safeStorage.js`) | KEEP AS-IS | unresolved |
| Help routes | n/a — does not exist | unresolved |
| Worker/API boundary | KEEP AS-IS | unresolved (regression guard is owned) |
| Domains/deployment (`wrangler.toml`) | KEEP AS-IS | unresolved |
| `docs/IMPLW_FLOW.md` reference | REPLACE (gap) | n/a — file absent |
| Music/audio/content/provenance | n/a — no asset exists | unresolved |
