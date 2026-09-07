# Security Assessment — CHORE #81

Scope: `UzorAI/uzorai.com` repository audit as of 2026-09-07.

---

## Advisory inventory

Source: `npm audit` on commit implementing CHORE #81. Advisories are classified by reachability (production runtime / build-time / development-only).

### Fixed in this PR

| Package | Severity | Advisory | Fix |
|---|---|---|---|
| `hono` | Moderate | API gateway adapter header drop; JSX cross-request data disclosure; XSS via `cx()`; ReDoS in CORS; `memo()` SSR cross-user disclosure; proxy `Connection` header leak; language-middleware DoS | Upgraded `4.6.14 → 4.13.7` |
| `react-router-dom` / `react-router` | High | Open redirect via backslash in `<Link>`; XSS via RSCErrorHandler; arbitrary constructor injection via `deserializeErrors()`; inefficient route-matching DoS; RSC CSRF bypass | Upgraded `7.1.1 → 7.18.3` (pulls `react-router 7.18.3`) |

### Residual risk — wrangler 3.x → 4.x migration (separate PR required)

`wrangler` is a **devDependency** used only for local development and Cloudflare deployment; it is never bundled into the production Worker. Its transitive dependencies carry several high/moderate advisories. The root fix is upgrading wrangler from 3.x to 4.x.

**Why deferred:** Wrangler 4.x contains breaking changes in `wrangler.toml` asset-binding syntax (`not_found_handling` field semantics changed, `[assets]` block restructured). The current `wrangler.toml` uses `[env.*.assets]` blocks with `not_found_handling = "single-page-application"` that require compatibility review before a mechanical version bump. A separate CHORE issue should cover the migration with a full changelog review and staging validation.

| Package | Severity | Via | Reachability |
|---|---|---|---|
| `wrangler` | High | `esbuild`, `miniflare`, `sharp` | **Dev/build only** — not present in production Worker bundle |
| `esbuild` | Moderate | `wrangler` | Dev server only (`wrangler dev`); not exposed in CI build artifacts |
| `miniflare` | Moderate | `wrangler` | Local development only (Workers simulator); never runs in CI with secrets |
| `undici` | High | `miniflare → wrangler` | Local development only |
| `ws` | High | `miniflare → wrangler` | Local development only |
| `sharp` | High | `wrangler` | Image processing used during `wrangler build`; runs in CI without secrets or privileged access |

### Residual risk — build toolchain (vite)

These advisories are in packages used only during the Vite build process and are not present in production Worker bundles.

| Package | Severity | Advisory | Reachability |
|---|---|---|---|
| `browserslist` | High | OOM via unbounded cache growth or prototype write via untrusted custom stats JSON | **Build-time only** — requires attacker control of a custom stats file passed to the build |
| `postcss` | High | Path traversal via `sourceMappingURL` when `from` is unset | **Build-time only** — requires attacker-controlled source maps in the build environment |
| `nanoid` | High | Non-secure generator may loop indefinitely | **Build-time only** — nanoid is pulled in by vite or wrangler; not used in application code |

**Accepted risk basis:** These packages only execute in the CI build environment (GitHub Actions runner). The runner does not have access to production secrets or privileged infrastructure during the build phase, limiting blast radius. No exploitable path exists through attacker-controlled input reaching these packages in normal CI operation.

---

## Lifecycle script inventory

`npm audit-scripts ls` (npm 10+ policy) reports the following packages with lifecycle scripts. All are blocked by npm's default `allowScripts` policy in this repository's CI environment:

| Package | Script | Type | Assessment |
|---|---|---|---|
| `esbuild@0.25.12` | `postinstall: node install.js` | Binary download | Dev toolchain only; downloads platform native binary; allowed in developer environments |
| `esbuild@0.28.2` | `postinstall: node install.js` | Binary download | Same as above |
| `esbuild@0.17.19` | `postinstall: node install.js` | Binary download | Same as above |
| `workerd@1.20250718.0` | `postinstall: node install.js` | Binary download | Cloudflare Workers runtime for `wrangler dev`; dev-only |
| `sharp@0.33.5` | `install: node install/check` | Binary check | Image processing for wrangler; dev/build-only |

**CI behaviour:** npm's `allowScripts` policy blocks these postinstall scripts in the CI environment by default. The packages remain installed; scripts that download native binaries are blocked but the packages still provide their JavaScript module interface. This is the expected secure behaviour for a CI environment that does not need these specific native binaries during the npm-install phase of CI.

**No package from this list:**
- Exfiltrates secrets (lifecycle scripts do not have access to environment variables unless explicitly passed)
- Requires privileged host access
- Performs network requests beyond binary download CDNs (esbuild.github.io, the Cloudflare registry)

---

## Lock integrity

Lockfile format: v3 (`package-lock.json`). Upgraded using `npm install` (no `--force`). The lockfile was regenerated in place without bypass flags. No packages were removed from the lock; version resolution followed standard semver within declared ranges.

---

## Dependency confusion / typosquatting assessment

All direct dependencies (`hono`, `react`, `react-dom`, `react-router-dom`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `tsx`, `typescript`, `vite`, `wrangler`) are published on the public npm registry under well-known maintainer accounts with established publication history. No evidence of name-squatting or unusual ownership changes was found at the time of this assessment.

---

## Wrangler migration action item

A follow-up CHORE issue should:
1. Review the [wrangler 3.x → 4.x migration guide](https://developers.cloudflare.com/workers/wrangler/migration/migrate-from-wrangler-v3/).
2. Verify `wrangler.toml` `[env.*.assets]` blocks are compatible with the new `[assets]` top-level syntax.
3. Validate deployment to `dev` environment before promoting.
4. Confirm `npm audit` clears the remaining wrangler-related advisories after the upgrade.
