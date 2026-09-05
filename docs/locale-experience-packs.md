# Locale Experience Pack foundation

Issue #123 introduces a code-only, offline catalog. Nothing in the rendered app
imports it. Dictionaries, the locale provider, workflow, clock, mark, styling,
audio behavior and public output remain unchanged. Runtime integration belongs
to a separately scored child issue.

The English Robo Tech Rap baseline is a descriptive arrangement plus references
to five existing semantic CSS tokens. The name makes no claim about a culture,
artist, musical recording or voice. It adds no media, font, composition, generated
content, provider, credential or runtime generation. Existing font families are
not pack assets; the catalog references only color-role tokens.

## Contract and compatibility matrix

| Contract | Exact pin | Authoritative repository source |
|---|---|---|
| Pack manifest | `1.0.0` | `src/client/experience-packs/schema.ts` |
| Workflow model | `1.0.0` | `src/client/workflow/uzorLoopModel.ts` |
| Performance clock | `1.0.0`; 32 bars, 4 beats/bar, 90/120/140 BPM | `src/client/performance/uzorPerformanceManifest.ts` |
| Voice/cadence snapshot | `uzor-phrase-slots-1.0.0` | Existing localized copy and `PERFORMANCE_EVENTS` phrase slots; no voice asset |
| Construction and interaction snapshot | Bounded ordered workflow bricks; explicit GO; independent, muted-default sound | `src/client/content/uzorEngineDemo.ts`, `src/client/components/home/UzorEngineHero.tsx` |
| Token silhouette | Existing `uzor-mark.svg` | `src/client/brand/uzor-mark.svg` |
| Color roles | `--bg`, `--surface`, `--fg`, `--muted`, `--accent` | `src/client/brand/tokens.css` |

The voice/cadence identifier versions this foundation's snapshot of existing
behavior; it does not assert that an independently versioned voice module already
exists. Tests pin the complete bar/phase/phrase-slot schedule. Bars 1–8 orient,
9–16 construct, 17–31 show detail, and 32 resolves once. Canonical workflow order
is authoring → governance → implementation-verification → deployment →
learning-continuation. RTL is presentation metadata and never reverses this order.
A source contract change requires a separately scored compatibility update, not
an automatic range upgrade. Tests compare pins with the current source contracts.

## Launch registrations

| Locale | Direction | Stable pack ID | Version | Resolution |
|---|---|---|---|---|
| en | ltr | `uzor-robo-tech-rap-en` | 1.0.0 | baseline |
| es | ltr | `uzor-baseline-text-es` | 1.0.0 | baseline-with-localized-text |
| ru | ltr | `uzor-baseline-text-ru` | 1.0.0 | baseline-with-localized-text |
| zh | ltr | `uzor-baseline-text-zh` | 1.0.0 | baseline-with-localized-text |
| ar | rtl | `uzor-baseline-text-ar` | 1.0.0 | baseline-with-localized-text |
| he | rtl | `uzor-baseline-text-he` | 1.0.0 | baseline-with-localized-text |
| fr | ltr | `uzor-baseline-text-fr` | 1.0.0 | baseline-with-localized-text |
| uk | ltr | `uzor-baseline-text-uk` | 1.0.0 | baseline-with-localized-text |

All seven fallbacks explicitly pin English `uzor-robo-tech-rap-en@1.0.0`.
Their content is null: no purported independent cultural treatment is approved.
Locale registration versions are independent of each other and of dictionary
versions. `LANGUAGES` supplies locale/direction metadata; the launch-set test
requires exactly these eight registrations.

## Validation, integrity and resolution

`validatePack(unknown)` checks plain JSON against the closed schema;
`validateRegistry(unknown)` additionally rejects duplicate locales and missing,
invalid or non-baseline fallback targets. Errors are stable, ordered reason codes:

- `invalid-manifest`, `invalid-version`, `invalid-locale`, `direction-mismatch`
- `missing-compatibility`, `incompatible-contract`, `invariant-change`
- `missing-rights`, `missing-provenance`, `missing-approval`
- `missing-integrity`, `integrity-mismatch`, `unsafe-asset-reference`
- `duplicate-locale`, `invalid-fallback`

Only the exact repository-owned CSS token references are allowed. Remote URLs,
data URLs, absolute paths, traversal, encoded paths, unknown tokens, unowned
references and media kinds fail validation. Extra fields cannot extend the schema.
The `canonical-json-v1` integrity seal records the entire payload (excluding the
seal) using sorted object keys and ordered arrays. It detects modification and
is deterministic without hashing APIs or IO. It is **not a signature** and cannot
prove authorship or grant approval. The seal deliberately duplicates small metadata;
it is not intended for binary payloads.

`resolveExperiencePack(locale, localizedText, candidates?)` adds publication checks:
every supplied registration must match the immutable checked-in reviewed catalog
in full. Recomputing a seal or claiming approval cannot publish altered content.
Unknown IDs/content produce `unapproved-pack`; a different version produces
`stale-pack`; an absent requested locale produces `missing-pack`. Structural
validation alone is not publication authorization. The function returns trusted
catalog objects, never a candidate object.

Any invalid candidate makes that registry fail closed. Missing, malformed, stale,
incompatible or unapproved packs return the frozen last-known-good English
baseline with diagnostic reasons and mode `last-known-good-baseline`. It cannot be
replaced through the candidates argument, even if the supplied baseline is corrupt.
Resolution does not recurse through fallback chains, consult the time, mutate
inputs, read storage, fetch files, or generate content.

The caller's `localizedText` (dictionary or existing translator function) is
returned by identity in every outcome. No English dictionary replaces it. Existing
`LocaleProvider.t()` semantics remain active dictionary → English → key; this
foundation neither loads dictionaries nor changes their review metadata.

## Review and future child packs

The approved scored foundation scope authorizes only repository-owned baseline
metadata. Its evidence is the materialized #123 spec, and publication of this
catalog still requires daniel-silvers's PR review. The approval field does not
claim an independent cultural review or license for future media.

A future child issue must separately specify and record:

1. Cultural evidence and designated native-language/cultural and brand reviewers;
   explicit review of stereotypes, political/religious treatments, artist imitation
   and unsupported cultural claims. Do not infer approval from a locale label.
2. Ownership/license, creator, source and provenance for every proposed asset,
   including voice, music, imagery and fonts. No unprovenanced, paid-provider or
   remotely loaded assets enter through this foundation.
3. Accessibility evidence: reduced motion, silent equivalence, readable contrast,
   keyboard/focus behavior, timing/readability on mobile, and a single announcement
   channel. Arabic/Hebrew direction must remain metadata only.
4. Exact compatibility pins, integrity evidence, deterministic fallback tests and
   an independently versioned pack. Extend the schema/allowlist and reviewed
   catalog through that PR only when the child scope authorizes it.

Semantic validation cannot establish cultural suitability or legal ownership.
Human evidence review plus the checked-in catalog is the publication boundary.

## Versioning and rollback

Stable SemVer is required (no prerelease or range selection). Keep IDs stable;
bump the affected pack's patch for compatible metadata corrections, minor for
compatible reviewed additions, and major for breaking pack changes. Workflow,
clock, silhouette, interaction or schema changes require separately scored work;
a pack version cannot override invariants. Do not bump other locales or their text
versions merely because one locale's reviewed content changes.

Rollback is a reviewed code change restoring the exact prior compatible manifest
and its version pin in `LOCALE_PACKS`, including the original content seal and
approval/provenance evidence. Keep prior versions accessible in repository history;
never overwrite a historical version with different content. Restore fallback
pins together if the English baseline changes. There is no automatic latest-version
selection or network lookup. In this initial release the only approved content
pin is `uzor-robo-tech-rap-en@1.0.0`; there is no fabricated earlier baseline.

Run `npm run build` (full repository tests, TypeScript and Vite). The new test
suite covers every rejection class, all locales, tampered and self-approved
candidates, fallback failure, RTL order, immutable trusted data, no IO, provenance
paths and absence of imports from the rendered app. No deployment is required for
these currently unconsumed modules. Runtime consumption and real cultural content
remain child issues.
