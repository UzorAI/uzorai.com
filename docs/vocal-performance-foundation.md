# Vocal Performance Foundation

Phase 6 of 10 (EPIC UzorAI/uzorai.com#69). Adds the code-only, deterministic foundation for Builder/Governor vocal roles.

## What this phase ships

- `src/client/performance/vocal/schema.ts` — versioned serializable types, validation, and compatibility pins.
- `src/client/performance/vocal/resolve.ts` — pure offline resolver returning a vocal plan or caption-only fallback.
- `src/client/performance/vocal/catalog.ts` — empty production catalog (no voice assets in this phase).
- `test/vocal-performance-foundation.test.mjs` — focused tests covering all eight acceptance criteria.

## What this phase does NOT ship

No generated voice, binary audio, third-party media, provider SDK, live voice API, runtime network call, browser secret, or rendered UI behavior. The foundation is unconsumed by any route or transport in this phase.

## Roles

Builder and Governor are semantic roles in the performance workflow. They are never gender identities. No gender field exists on any type in this foundation. Optional `characteristics.description` is a human-readable descriptor only and must not drive authorization, semantic selection, workflow ordering, or validation.

## Compatibility pins

The foundation pins four existing contracts. Any change to these versions requires a separately scored issue:

| Contract | Pinned version |
|---|---|
| Performance clock (`PERFORMANCE_VERSION`) | `1.0.0` |
| Locale-pack schema (`MANIFEST_SCHEMA_VERSION`) | `1.0.0` |
| Workflow model (`UZOR_LOOP_MODEL_VERSION`) | `1.0.0` |
| Voice cadence | `uzor-phrase-slots-1.0.0` |

If any pinned contract version changes, `validateCompatibility` will return `incompatible-version` and resolution falls back to caption-only.

## Supported locales

Exactly the eight launch locales: `en`, `es`, `ru`, `zh`, `ar`, `he`, `fr`, `uk`. Every locale always resolves caption metadata, even when no voice profile exists.

## Diagnostic codes

| Code | Meaning |
|---|---|
| `invalid-schema` | Unexpected keys, missing required fields, or unsafe content in a profile or cue. |
| `incompatible-version` | A compatibility pin does not match the pinned contract version. |
| `unapproved-profile` | Profile approval status is not `approved`, or the profile is not found. |
| `missing-provenance` | Profile provenance metadata is absent or structurally invalid. |
| `missing-rights` | Profile rights metadata is absent or structurally invalid. |
| `unsupported-locale` | A requested locale or caption locale is not in the eight launch locales. |
| `invalid-phrase-ref` | The phrase ID does not match the closed syntax `/^uzor-phrase-[a-z0-9]+(?:-[a-z0-9]+)*$/` or the slot is invalid. |
| `duplicate-cue` | Two cues share the same ID, or a cue has duplicate locale captions. |
| `timing-overflow` | A cue bar is outside 1–32, or beat is outside 1–4, or cues are out of bar order. |
| `caption-only-fallback` | Added to every caption-only result; signals audio is unavailable and captions are active. |

## Failure and fallback contract

- Invalid or unavailable audio never blocks a bar, changes workflow causality, or suppresses captions.
- Fallback is deterministic caption-only output using the requested locale's caption when valid, otherwise the English caption.
- Diagnostics are bounded and structured; they never include secrets or arbitrary source payloads.
- If `caption-only-fallback` is in the diagnostics list, the `kind` will always be `caption-only`.

## Accessibility

Each `VocalCaption` carries one authoritative `text` field (the visual caption) and an `srPolicy` that governs screen-reader announcement:

- `once-on-enter` — announce once when the cue becomes active.
- `suppress-if-audio-present` — suppress the screen-reader announcement when synchronized audio is playing, preventing duplicate simultaneous speech and ticker announcements.

Duplicate locale captions within a single cue are rejected by `validateCue` to enforce the single-announcement invariant.

## Extension rules

To add a new profile to the production catalog:
1. Obtain and document rights: consent or license, permitted territories and uses, retention policy, attribution/disclosure.
2. Add provenance: list all source files, confirm `generatedMedia` and `recordingConsent` accurately.
3. Obtain approval: set `status: 'approved'`, link to a filed and scored issue as `evidence`.
4. Add the profile to `catalog.ts` — only after all of the above are in place.
5. Add the profile's locales to `locales`; it must cover all locales it claims to support.

## Phase 7 integration

Phase 7 will publish a phrase manifest contract. When available:
- Replace test-only fixture phrase IDs with the Phase 7 phrase reservoir.
- Wire the resolver into a runtime transport (requires a separately scored issue).
- The catalog will populate with approved profiles.

The contracts in this foundation are designed to be consumed unchanged by Phase 7.

## Rollback

Rollback is deletion of `src/client/performance/vocal/`, `test/vocal-performance-foundation.test.mjs`, and this document, plus reverting the `package.json` test script change. No rendered output or stored user data is affected. No data migration is required.
