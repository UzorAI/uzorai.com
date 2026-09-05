# Phrase Reservoir and 32-bar Performance Manifests

Phase 7 of 10 (EPIC UzorAI/uzorai.com#69). Adds the approved-content read model that public UZOR playback consumes: a provenance-backed Phrase Reservoir and deterministic 32-bar Performance Manifests.

## What this phase ships

- `src/client/performance/phrase/schema.ts` — Capability-fact and approved-phrase types, state machines, and all eight validators (semantic, factual, rhythmic, locale, dedupe, safety, rights, freshness).
- `src/client/performance/phrase/reservoir.ts` — Phrase Reservoir with configurable inventory policy, inventory monitoring, and replenishment signalling.
- `src/client/performance/manifest/compiler.ts` — Full 32-bar Performance Manifest types, deterministic compiler, and validator.
- `test/phrase-reservoir-and-performance-manifests.test.mjs` — 43 tests covering all seven acceptance criteria.
- `issues/2026-09-05__feat__verified-phrase-reservoir-and-32-bar-performance-manifests.scored.md` — Materialized scored spec.
- Pre-existing tsc fix in `src/client/performance/vocal/resolve.ts` (diagnostics narrowing).
- `test/locale-experience-packs.test.mjs` boundary fix — adds `performance/` exception alongside `experience-packs/` (foundation layers may cross-import; UI layer may not).

## What this phase does NOT ship

No generated phrases, binary audio, third-party media, provider SDK, live API, runtime network call, browser secret, or rendered UI changes. Production phrase catalog is empty; tests use synthetic fixtures. Low-water thresholds are configurable parameters — not finalized values (observed inventory/consumption analysis deferred to later phases).

## State machines

### Capability fact

| From | Legal next states |
|---|---|
| `draft` | `verified` |
| `verified` | `approved`, `superseded` |
| `approved` | `superseded` |
| `superseded` | (terminal) |

### Phrase

| From | Legal next states |
|---|---|
| `candidate` | `approved`, `quarantined` |
| `approved` | `superseded`, `quarantined` |
| `quarantined` | (terminal) |
| `superseded` | (terminal) |

## Validators

All validators fail closed: return an error code on any ambiguity.

| Validator | Code | Trigger |
|---|---|---|
| Semantic | `semantic-fail` | Text fewer than 3 words |
| Factual | `factual-fail` | `capabilityFactId` not in approved-fact registry |
| Rhythmic | `rhythmic-fail` | `rhythmPattern` not a valid bounded token |
| Locale | `locale-mismatch` | Locale not in the eight launch locales |
| Dedupe | `duplicate` | `phraseId` already seen in collection |
| Safety | `safety-fail` | Injection patterns in text |
| Rights | `rights-fail` | Missing or invalid rights basis |
| Freshness | `stale-phrase` | `freshUntil` in the past |

## Compatibility pins

| Contract | Pinned version |
|---|---|
| Performance clock | `1.0.0` |
| Phrase schema | `1.0.0` |
| Vocal schema | `1.0.0` |
| Locale-pack schema | `1.0.0` |
| Workflow model | `1.0.0` |

## Inventory policy

`lowWatermark` and `maxCapacity` are configurable parameters on `InventoryPolicy`. When `publishable < lowWatermark`, `emitReplenishmentSignal` returns a `ReplenishmentSignal` — no LLM call, no ungoverned publication. Thresholds are not finalized here; Phase 9 determines values from observed consumption data.

## Manifest determinism

Two identical `ManifestCompileInput` values always produce the same `PerformanceManifest32Bar` and the same `integrity.payload` (canonical JSON v1 hash). Variation is introduced only by versioned input changes.
