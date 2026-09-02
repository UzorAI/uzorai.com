import test from 'node:test'
import assert from 'node:assert/strict'
import { getCanonicalStageIds, getPresentationSequence } from '../src/client/workflow/uzorLoopModel.ts'
import {
  UZOR_GO_INITIAL_STATE,
  UZOR_GO_MANIFEST,
  UZOR_GO_STAGE_DURATION_MS,
  DEFAULT_SOUND_PREF,
  advanceUzorGoCycle,
  currentUzorGoStage,
  readSoundPref,
  startUzorGoCycle,
  toggleSoundPref,
  writeSoundPref,
} from '../src/client/content/uzorEngineDemo.ts'

test('the manifest is derived 1:1 from the canonical stages, in canonical order, and immutable', () => {
  assert.deepEqual(
    UZOR_GO_MANIFEST.map((s) => s.id),
    getCanonicalStageIds(),
  )
  assert.ok(Object.isFrozen(UZOR_GO_MANIFEST))
  for (const entry of UZOR_GO_MANIFEST) assert.ok(Object.isFrozen(entry))
})

test('LTR and RTL presentation sequences preserve canonical stage id order', () => {
  const ltrIds = getPresentationSequence('ltr').map((s) => s.id)
  const rtlIds = getPresentationSequence('rtl').map((s) => s.id)
  assert.deepEqual(ltrIds, getCanonicalStageIds())
  assert.deepEqual(rtlIds, getCanonicalStageIds())
  assert.deepEqual(rtlIds, ltrIds)
})

test('starting from idle begins at the first stage', () => {
  assert.deepEqual(startUzorGoCycle(UZOR_GO_INITIAL_STATE), { status: 'running', stageIndex: 0 })
})

test('activating while running does not start a second timer (overlapping cycles rejected)', () => {
  const running = startUzorGoCycle(UZOR_GO_INITIAL_STATE)
  const again = startUzorGoCycle(running)
  assert.deepEqual(again, running)
})

test('advancing walks every canonical stage in order, then resolves to complete', () => {
  let state = startUzorGoCycle(UZOR_GO_INITIAL_STATE)
  const visited = [currentUzorGoStage(state)?.id]
  for (let i = 1; i < UZOR_GO_MANIFEST.length; i += 1) {
    state = advanceUzorGoCycle(state)
    assert.equal(state.status, 'running')
    visited.push(currentUzorGoStage(state)?.id)
  }
  assert.deepEqual(visited, getCanonicalStageIds())

  state = advanceUzorGoCycle(state)
  assert.equal(state.status, 'complete')
  assert.equal(state.stageIndex, UZOR_GO_MANIFEST.length - 1)
})

test('bricks never accumulate past the manifest limit', () => {
  let state = startUzorGoCycle(UZOR_GO_INITIAL_STATE)
  for (let i = 0; i < UZOR_GO_MANIFEST.length; i += 1) state = advanceUzorGoCycle(state)
  const complete = state
  assert.equal(complete.status, 'complete')

  // Advancing further after completion is a no-op — the index never exceeds
  // the manifest's final entry.
  const again = advanceUzorGoCycle(complete)
  assert.deepEqual(again, complete)
})

test('starting again after completion restarts cleanly from the first stage', () => {
  let state = startUzorGoCycle(UZOR_GO_INITIAL_STATE)
  for (let i = 0; i < UZOR_GO_MANIFEST.length; i += 1) state = advanceUzorGoCycle(state)
  assert.equal(state.status, 'complete')

  const restarted = startUzorGoCycle(state)
  assert.deepEqual(restarted, { status: 'running', stageIndex: 0 })
})

test('the per-stage timer is a small bounded duration, not a live clock', () => {
  assert.ok(Number.isFinite(UZOR_GO_STAGE_DURATION_MS))
  assert.ok(UZOR_GO_STAGE_DURATION_MS > 0 && UZOR_GO_STAGE_DURATION_MS < 10_000)
})

test('sound preference toggles independently of the UZOR GO cycle and defaults muted', () => {
  assert.equal(DEFAULT_SOUND_PREF, 'muted')
  assert.equal(toggleSoundPref('muted'), 'unmuted')
  assert.equal(toggleSoundPref('unmuted'), 'muted')
})

test('sound preference storage fails closed without a browser window (no throw, no network)', () => {
  assert.equal(typeof window, 'undefined')
  assert.equal(readSoundPref(), DEFAULT_SOUND_PREF)
  assert.equal(writeSoundPref('unmuted'), false)
})
