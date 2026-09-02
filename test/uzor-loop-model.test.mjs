import test from 'node:test'
import assert from 'node:assert/strict'
import {
  UZOR_LOOP_MODEL_VERSION,
  UZOR_LOOP_STAGES,
  WORKFLOW_CONCEPTS,
  getCompactSequence,
  getDetailedSequence,
  getCanonicalStageIds,
  getPresentationSequence,
  validateUzorLoopModel,
  isUzorLoopModelValid,
  sequenceMatchesCanonicalOrder,
  rtlPreservesCanonicalOrder,
} from '../src/client/workflow/uzorLoopModel.ts'

const CANONICAL_ORDER = [
  'authoring',
  'governance',
  'implementation-verification',
  'deployment',
  'learning-continuation',
]

test('the shipped canonical model is versioned and valid', () => {
  assert.equal(typeof UZOR_LOOP_MODEL_VERSION, 'string')
  assert.match(UZOR_LOOP_MODEL_VERSION, /^\d+\.\d+\.\d+$/)
  assert.deepEqual(validateUzorLoopModel(), [])
  assert.equal(isUzorLoopModelValid(), true)
})

test('canonical stage order matches the approved logical progression', () => {
  assert.deepEqual(getCanonicalStageIds(), CANONICAL_ORDER)
})

test('compact and detailed sequences are derived from the same canonical order', () => {
  const compactIds = getCompactSequence().map((s) => s.id)
  const detailedIds = getDetailedSequence().map((s) => s.id)
  assert.deepEqual(compactIds, CANONICAL_ORDER)
  assert.deepEqual(detailedIds, CANONICAL_ORDER)
  assert.deepEqual(compactIds, detailedIds)
  // Detailed carries the full record; compact is a strict id/label projection of it.
  for (const step of getCompactSequence()) {
    const detailed = getDetailedSequence().find((s) => s.id === step.id)
    assert.equal(detailed.label, step.label)
  }
})

test('every stage has a stable id, semantic category, inputs, outputs, and evidence', () => {
  for (const stage of UZOR_LOOP_STAGES) {
    assert.equal(typeof stage.id, 'string')
    assert.ok(stage.id.length > 0)
    assert.equal(stage.category, 'process')
    assert.ok(Array.isArray(stage.inputs) && stage.inputs.length > 0)
    assert.ok(Array.isArray(stage.outputs) && stage.outputs.length > 0)
    assert.ok(Array.isArray(stage.evidence) && stage.evidence.length > 0)
    for (const ref of stage.evidence) {
      assert.equal(typeof ref.path, 'string')
      assert.equal(typeof ref.note, 'string')
    }
  }
})

test('RTL presentation does not reverse canonical stage ids', () => {
  const ltrIds = getPresentationSequence('ltr').map((s) => s.id)
  const rtlIds = getPresentationSequence('rtl').map((s) => s.id)
  assert.deepEqual(ltrIds, CANONICAL_ORDER)
  assert.deepEqual(rtlIds, CANONICAL_ORDER)
  assert.deepEqual(rtlIds, ltrIds)
  assert.equal(rtlPreservesCanonicalOrder(), true)

  // dir is presentation metadata only, never reordering.
  for (const step of getPresentationSequence('rtl')) {
    assert.equal(step.dir, 'rtl')
  }
})

test('rejects duplicate ids across stages and concepts', () => {
  const stages = [
    UZOR_LOOP_STAGES[0],
    { ...UZOR_LOOP_STAGES[1], id: UZOR_LOOP_STAGES[0].id },
  ]
  const errors = validateUzorLoopModel(stages, WORKFLOW_CONCEPTS)
  assert.ok(errors.some((e) => e.code === 'duplicate-id'))

  const clashingConcepts = [
    { ...WORKFLOW_CONCEPTS[0], id: UZOR_LOOP_STAGES[0].id },
  ]
  const errors2 = validateUzorLoopModel(UZOR_LOOP_STAGES, clashingConcepts)
  assert.ok(errors2.some((e) => e.code === 'duplicate-id'))
})

test('rejects unsupported categories', () => {
  const stages = [{ ...UZOR_LOOP_STAGES[0], category: 'workflow-stage' }]
  const errors = validateUzorLoopModel(stages, [])
  assert.ok(errors.some((e) => e.code === 'unsupported-category'))

  const concepts = [{ ...WORKFLOW_CONCEPTS[0], category: 'transient' }]
  const errors2 = validateUzorLoopModel([], concepts)
  assert.ok(errors2.some((e) => e.code === 'unsupported-category'))
})

test('rejects peer-level semantic mixing (status/evidence/HUD inside stages, or a stage-labeled concept)', () => {
  const mixedStages = [{ ...UZOR_LOOP_STAGES[0], category: 'status' }]
  const errors = validateUzorLoopModel(mixedStages, [])
  assert.ok(errors.some((e) => e.code === 'category-mismatch'))

  const mixedConcepts = [{ ...WORKFLOW_CONCEPTS[0], category: 'process' }]
  const errors2 = validateUzorLoopModel([], mixedConcepts)
  assert.ok(errors2.some((e) => e.code === 'category-mismatch'))
})

test('rejects a divergent derived sequence (a hand-rolled array that disagrees with canonical order)', () => {
  const reversed = [...CANONICAL_ORDER].reverse()
  assert.equal(sequenceMatchesCanonicalOrder(reversed), false)
  assert.equal(sequenceMatchesCanonicalOrder(CANONICAL_ORDER.slice(0, -1)), false)
  assert.equal(sequenceMatchesCanonicalOrder(CANONICAL_ORDER), true)
})

test('rejects out-of-order `order` values', () => {
  const badOrder = UZOR_LOOP_STAGES.map((stage, index) =>
    index === 0 ? { ...stage, order: 5 } : stage,
  )
  const errors = validateUzorLoopModel(badOrder, [])
  assert.ok(errors.some((e) => e.code === 'order-mismatch'))
})

test('every workflow concept is explicitly typed and excluded from the process-stage array', () => {
  const stageIds = new Set(UZOR_LOOP_STAGES.map((s) => s.id))
  for (const concept of WORKFLOW_CONCEPTS) {
    assert.ok(['status', 'evidence', 'hud'].includes(concept.category))
    assert.equal(stageIds.has(concept.id), false)
  }
})
