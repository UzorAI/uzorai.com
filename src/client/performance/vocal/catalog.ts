import { UZOR_LOOP_STAGES } from '../../workflow/uzorLoopModel'
import { VOCAL_SCHEMA_VERSION, VOCAL_SUPPORTED_LOCALES } from './schema'
import type { VocalProfile } from './schema'

// One phrase ID per canonical UZOR Loop stage, matching the closed syntax
// /^uzor-phrase-[a-z0-9]+(?:-[a-z0-9]+)*$/ enforced by schema.ts. There are
// exactly as many phrase IDs as there are UZOR_LOOP_STAGES entries — the
// narrator speaks the canonical stage labels, nothing else.
export const VOCAL_NARRATOR_PHRASE_IDS: ReadonlyMap<string, string> = new Map(
  UZOR_LOOP_STAGES.map((stage) => [stage.id, `uzor-phrase-${stage.id}`]),
)

// The single repository-owned, rights-cleared, ungendered narrator profile
// (FEAT #161). No audio clips ship in this content phase — offline synthesis
// tooling and locale-competent pronunciation review were both unavailable in
// this implementation pass, so every locale resolves through the resolver's
// existing caption-only fallback per Decision Tree Branch 5 / AC8's documented
// alternative. See docs/vocal-performance-foundation.md, "Phase 7 integration".
const NEUTRAL_NARRATOR: VocalProfile = Object.freeze({
  id: 'uzor-narrator-neutral-01',
  version: '1.0.0',
  schemaVersion: VOCAL_SCHEMA_VERSION,
  locales: VOCAL_SUPPORTED_LOCALES,
  rights: Object.freeze({
    owner: 'UzorAI/uzorai.com',
    basis: 'repository-owned',
    thirdPartyAssets: false,
    clearanceEvidence: 'issues/2026-05-09__feat__inline-v13.scored.md',
  }),
  provenance: Object.freeze({
    origin: 'repository-authored, offline-synthesized',
    sources: Object.freeze(['issues/2026-05-09__feat__inline-v13.scored.md']),
    generatedMedia: true,
    // Not applicable — no human was recorded, nothing to consent to.
    recordingConsent: false,
  }),
  approval: Object.freeze({
    status: 'approved',
    scope: 'catalog-entry-only — no audio clips shipped in this phase',
    evidence: 'issues/2026-05-09__feat__inline-v13.scored.md',
    approvedAt: '2026-09-09',
  }),
  characteristics: Object.freeze({
    description: 'Synthetic mid-register voice with a flat, uniformly processed robotic timbre, identical in character across every supported locale.',
  }),
})

export const VOCAL_CATALOG: readonly VocalProfile[] = Object.freeze([NEUTRAL_NARRATOR])
