/**
 * Canonical UZOR Loop semantic model (FEAT #94, Phase 1 of EPIC #69 / #70).
 *
 * One typed, versioned, ordered source of truth for the public workflow
 * narrative: Authoring -> Governance -> Implementation and verification ->
 * Deployment -> Learning and continuation. Compact/detailed public sequences
 * are *derived* from `UZOR_LOOP_STAGES` below, never independently
 * maintained, so they cannot drift from each other.
 *
 * Transient status, evidence, and HUD concepts are real and named, but are
 * explicitly typed as `WorkflowConcept` and kept out of `UZOR_LOOP_STAGES` —
 * mixing a status/evidence/HUD entry into the process-stage array (or vice
 * versa) is a validation failure (AC4), because the two have different
 * public-narrative semantics: stages are the story visitors are told,
 * concepts are the operational/runtime detail behind it.
 *
 * This module is additive: nothing here is imported by Home.tsx or any
 * other rendered route in this phase (see
 * docs/uzor-loop-evidence-and-ownership.md, "Compatibility"). #71 owns
 * wiring a derived sequence into the visible hero.
 */

export const UZOR_LOOP_MODEL_VERSION = '1.0.0'

export type StageCategory = 'process'
export type ConceptCategory = 'status' | 'evidence' | 'hud'
export type SemanticCategory = StageCategory | ConceptCategory

export const SUPPORTED_CATEGORIES: readonly SemanticCategory[] = [
  'process',
  'status',
  'evidence',
  'hud',
] as const

export function isSemanticCategory(value: string): value is SemanticCategory {
  return (SUPPORTED_CATEGORIES as readonly string[]).includes(value)
}

/** A citation into repository-verified evidence — never a guess. */
export interface EvidenceRef {
  /** Repository-relative path this stage's existence/behavior is grounded in. */
  readonly path: string
  /** Why that path is evidence for this stage. */
  readonly note: string
}

export interface ProcessStage {
  /** Stable identifier. Changing it is a "trigger for change" re-approval event. */
  readonly id: string
  readonly category: StageCategory
  /** Position in the canonical logical progression (0-based, gapless). */
  readonly order: number
  readonly label: string
  readonly inputs: readonly string[]
  readonly outputs: readonly string[]
  readonly evidence: readonly EvidenceRef[]
}

/** Transient status / evidence / HUD concept — never a peer of a process stage. */
export interface WorkflowConcept {
  readonly id: string
  readonly category: ConceptCategory
  readonly label: string
  readonly description: string
}

/**
 * The canonical UZOR Loop, in approved logical order. `order` is redundant
 * with array position today (both are authored together); validation checks
 * them against each other so the two can never silently disagree.
 */
export const UZOR_LOOP_STAGES: readonly ProcessStage[] = [
  {
    id: 'authoring',
    category: 'process',
    order: 0,
    label: 'Authoring',
    inputs: ['operator intent', 'prior repository evidence'],
    outputs: ['a scored spec'],
    evidence: [
      { path: '.claude/commands/implw.md', note: 'spec acquisition (Path A/B) and ZAI scoring contract' },
    ],
  },
  {
    id: 'governance',
    category: 'process',
    order: 1,
    label: 'Governance',
    inputs: ['a scored spec'],
    outputs: ['Gate 1 clearance (AUTO, reply, or label-absent)'],
    evidence: [
      { path: '.claude/commands/implw.md', note: 'Gate 1 classifier and the interactive/headless HOLD approval channels' },
    ],
  },
  {
    id: 'implementation-verification',
    category: 'process',
    order: 2,
    label: 'Implementation and verification',
    inputs: ['Gate 1 clearance'],
    outputs: ['a passing build/test run', 'an open PR'],
    evidence: [
      { path: 'package.json', note: '"test" and "build" scripts implw runs before opening a PR' },
    ],
  },
  {
    id: 'deployment',
    category: 'process',
    order: 3,
    label: 'Deployment',
    inputs: ['a reviewed and merged PR'],
    outputs: ['a live Worker deployment'],
    evidence: [
      { path: 'wrangler.toml', note: 'the four custom-domain routes bound to the production Worker' },
    ],
  },
  {
    id: 'learning-continuation',
    category: 'process',
    order: 4,
    label: 'Learning and continuation',
    inputs: ['deployment outcome', 'operator feedback'],
    outputs: ['updated repository evidence', 'the next authored spec'],
    evidence: [
      { path: 'docs/implw-observability.md', note: 'telemetry captured from each run and fed back into the next iteration' },
    ],
  },
] as const

/**
 * Real but non-process concepts. Deliberately outside `UZOR_LOOP_STAGES`:
 * a label describing transient status, evidence, or HUD state is not a
 * public workflow stage (Decision Tree row 2 of issue #94).
 */
export const WORKFLOW_CONCEPTS: readonly WorkflowConcept[] = [
  { id: 'status-queued', category: 'status', label: 'Queued', description: 'Accepted, not yet started.' },
  { id: 'status-running', category: 'status', label: 'Running', description: 'Actively executing a stage.' },
  { id: 'status-blocked', category: 'status', label: 'Blocked', description: 'Held at Gate 1 pending approval.' },
  { id: 'status-passed', category: 'status', label: 'Passed', description: 'The stage completed successfully.' },
  { id: 'status-failed', category: 'status', label: 'Failed', description: 'The stage exited without completing.' },
  { id: 'evidence-spec-score', category: 'evidence', label: 'ZAI Spec Score', description: 'The rubric score block attached to a spec.' },
  { id: 'evidence-ci-run', category: 'evidence', label: 'CI run result', description: 'Build/test/typecheck outcome for a change.' },
  { id: 'evidence-pr-review', category: 'evidence', label: 'PR review', description: 'Reviewer decision on an opened PR.' },
  { id: 'hud-progress-indicator', category: 'hud', label: 'Progress indicator', description: 'Which stage is active, for display only.' },
  { id: 'hud-elapsed-timer', category: 'hud', label: 'Elapsed timer', description: 'Wall-clock time in the current stage, for display only.' },
] as const

/** Ordered by `order`, ascending. The single sort point every derivation shares. */
function orderedStages(stages: readonly ProcessStage[]): readonly ProcessStage[] {
  return stages.slice().sort((a, b) => a.order - b.order)
}

export interface CompactStep {
  readonly id: string
  readonly label: string
}

/** Compact public sequence: id + label only, derived — never independently authored. */
export function getCompactSequence(
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
): readonly CompactStep[] {
  return orderedStages(stages).map(({ id, label }) => ({ id, label }))
}

/** Detailed public sequence: the full stage record, derived from the same source. */
export function getDetailedSequence(
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
): readonly ProcessStage[] {
  return orderedStages(stages)
}

export function getCanonicalStageIds(
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
): readonly string[] {
  return orderedStages(stages).map((stage) => stage.id)
}

export type PresentationDirection = 'ltr' | 'rtl'

export interface PresentationStep extends CompactStep {
  /** Display metadata only. Never changes stage order or IDs — see module docstring. */
  readonly dir: PresentationDirection
}

/**
 * Presentation-layer sequence for a given direction. `dir` is attached as
 * metadata for the consumer to apply CSS-level mirroring (as `styles/rtl.css`
 * already does under `[dir="rtl"]`); the canonical ID order is identical for
 * every direction — RTL never reverses the array.
 */
export function getPresentationSequence(
  dir: PresentationDirection,
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
): readonly PresentationStep[] {
  return getCompactSequence(stages).map((step) => ({ ...step, dir }))
}

export interface ModelValidationError {
  readonly code:
    | 'duplicate-id'
    | 'unsupported-category'
    | 'category-mismatch'
    | 'order-mismatch'
    | 'sequence-divergence'
    | 'rtl-order-mismatch'
  readonly message: string
}

/** IDs appearing more than once across stages + concepts combined. */
export function findDuplicateIds(
  stages: readonly ProcessStage[],
  concepts: readonly WorkflowConcept[],
): readonly string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const entry of [...stages, ...concepts]) {
    if (seen.has(entry.id)) duplicates.add(entry.id)
    seen.add(entry.id)
  }
  return [...duplicates]
}

/** Entries (from either collection) whose category isn't in `SUPPORTED_CATEGORIES`. */
export function findUnsupportedCategories(
  stages: readonly ProcessStage[],
  concepts: readonly WorkflowConcept[],
): readonly string[] {
  const bad: string[] = []
  for (const entry of [...stages, ...concepts]) {
    if (!isSemanticCategory(entry.category)) bad.push(entry.id)
  }
  return bad
}

/**
 * Peer-level semantic mixing: a process stage whose category isn't
 * `'process'`, or a concept whose category IS `'process'` (i.e. it was
 * smuggled in as if it were a public workflow stage).
 */
export function findCategoryMixing(
  stages: readonly ProcessStage[],
  concepts: readonly WorkflowConcept[],
): readonly string[] {
  const offending: string[] = []
  for (const stage of stages) {
    if (stage.category !== 'process') offending.push(stage.id)
  }
  for (const concept of concepts) {
    if ((concept.category as string) === 'process') offending.push(concept.id)
  }
  return offending
}

/** `order` must be a gapless 0-based ascending sequence matching array intent. */
export function hasConsistentOrder(stages: readonly ProcessStage[]): boolean {
  const orders = orderedStages(stages).map((s) => s.order)
  return orders.every((value, index) => value === index)
}

/**
 * True when a candidate ID sequence exactly matches the canonical stage
 * order — the check both derivations run against, and what a test can use
 * to prove a hand-rolled "independent" array would be rejected.
 */
export function sequenceMatchesCanonicalOrder(
  candidateIds: readonly string[],
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
): boolean {
  const canonical = getCanonicalStageIds(stages)
  return (
    candidateIds.length === canonical.length &&
    candidateIds.every((id, index) => id === canonical[index])
  )
}

/** True when RTL presentation preserves the canonical stage ID order. */
export function rtlPreservesCanonicalOrder(
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
): boolean {
  const ltrIds = getPresentationSequence('ltr', stages).map((s) => s.id)
  const rtlIds = getPresentationSequence('rtl', stages).map((s) => s.id)
  return sequenceMatchesCanonicalOrder(rtlIds, stages) && sequenceMatchesCanonicalOrder(ltrIds, stages)
}

/**
 * Full model validation. Defaults to the shipped canonical model; tests
 * pass fabricated fixtures to prove each rejection path independently
 * (AC4) without mutating the real, immutable exports.
 */
export function validateUzorLoopModel(
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
  concepts: readonly WorkflowConcept[] = WORKFLOW_CONCEPTS,
): readonly ModelValidationError[] {
  const errors: ModelValidationError[] = []

  for (const id of findDuplicateIds(stages, concepts)) {
    errors.push({ code: 'duplicate-id', message: `duplicate id across the model: "${id}"` })
  }

  for (const id of findUnsupportedCategories(stages, concepts)) {
    errors.push({ code: 'unsupported-category', message: `entry "${id}" has an unsupported category` })
  }

  for (const id of findCategoryMixing(stages, concepts)) {
    errors.push({ code: 'category-mismatch', message: `entry "${id}" mixes process-stage and concept semantics` })
  }

  if (!hasConsistentOrder(stages)) {
    errors.push({ code: 'order-mismatch', message: 'stage `order` values are not a gapless 0-based sequence' })
  }

  const canonicalIds = getCanonicalStageIds(stages)
  if (
    !sequenceMatchesCanonicalOrder(getCompactSequence(stages).map((s) => s.id), stages) ||
    !sequenceMatchesCanonicalOrder(getDetailedSequence(stages).map((s) => s.id), stages)
  ) {
    errors.push({
      code: 'sequence-divergence',
      message: `derived compact/detailed sequences diverge from the canonical order [${canonicalIds.join(', ')}]`,
    })
  }

  if (!rtlPreservesCanonicalOrder(stages)) {
    errors.push({ code: 'rtl-order-mismatch', message: 'RTL presentation reordered canonical stage ids' })
  }

  return errors
}

export function isUzorLoopModelValid(
  stages: readonly ProcessStage[] = UZOR_LOOP_STAGES,
  concepts: readonly WorkflowConcept[] = WORKFLOW_CONCEPTS,
): boolean {
  return validateUzorLoopModel(stages, concepts).length === 0
}
