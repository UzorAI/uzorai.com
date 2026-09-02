/**
 * UZOR GO's checked-in, immutable demo manifest and finite state machine
 * (FEAT #98, Phase 2 of EPIC #69/#70).
 *
 * The manifest is derived 1:1 from the Phase 1 canonical `UZOR_LOOP_STAGES`
 * (src/client/workflow/uzorLoopModel.ts) — never an independently authored
 * workflow array (Final Spec, AC1). It carries only pre-generated local i18n
 * keys; there is no network request, LLM call, or dynamic generation
 * anywhere in this module.
 *
 * The cycle is a small pure state machine (`startUzorGoCycle` /
 * `advanceUzorGoCycle`) so the component can drive it with a single
 * `setTimeout` chain while this file stays fully unit-testable without a
 * DOM. All functions are pure and total: every input, including inputs from
 * an already-`complete` or already-`running` state, maps to a defined
 * output (no throw), satisfying the "unsupported state" fallback in the
 * Failure and fallback contract.
 */
import { UZOR_LOOP_STAGES } from '../workflow/uzorLoopModel'
import { readBoundedStorage, writeBoundedStorage } from '../../shared/safeStorage'

export interface DemoStageCopy {
  /** Must equal a canonical `UZOR_LOOP_STAGES` id — see the manifest below. */
  readonly id: string
  /** i18n key resolving this stage's one-line cached demo copy. */
  readonly detailKey: string
}

/** One-to-one with `UZOR_LOOP_STAGES`, same order, same ids. Frozen: this is
 *  checked-in data, never mutated at runtime. */
export const UZOR_GO_MANIFEST: readonly DemoStageCopy[] = Object.freeze(
  UZOR_LOOP_STAGES.map((stage) =>
    Object.freeze({ id: stage.id, detailKey: `home.engine.stage.${stage.id}` }),
  ),
)

/** Bounded per-stage timer. Finite and small — this is a cached preview, not
 *  a live clock. */
export const UZOR_GO_STAGE_DURATION_MS = 900

export type UzorGoStatus = 'idle' | 'running' | 'complete'

export interface UzorGoState {
  readonly status: UzorGoStatus
  /** -1 while idle; otherwise a valid index into `UZOR_GO_MANIFEST`. */
  readonly stageIndex: number
}

export const UZOR_GO_INITIAL_STATE: UzorGoState = Object.freeze({
  status: 'idle',
  stageIndex: -1,
})

/**
 * Start (or restart) the cycle from its first stage. A request while already
 * `running` is rejected by returning the same state unchanged — the caller
 * must not start a second timer (Decision Tree: "do not start a second
 * timer"; AC4: "rejects overlapping cycles").
 */
export function startUzorGoCycle(state: UzorGoState): UzorGoState {
  if (state.status === 'running') return state
  return { status: 'running', stageIndex: 0 }
}

/**
 * Advance one stage. A no-op outside `running` (idle/complete/unsupported
 * states are returned unchanged rather than throwing). Resolves to
 * `complete` once the manifest is exhausted and never advances the index
 * past the manifest's final entry — bricks stop at the manifest limit and
 * never accumulate indefinitely (AC6).
 */
export function advanceUzorGoCycle(state: UzorGoState): UzorGoState {
  if (state.status !== 'running') return state
  const next = state.stageIndex + 1
  if (next >= UZOR_GO_MANIFEST.length) {
    return { status: 'complete', stageIndex: UZOR_GO_MANIFEST.length - 1 }
  }
  return { status: 'running', stageIndex: next }
}

/** The manifest entry for the current stage, or null when idle/out of range
 *  (a missing-manifest-entry fails to no detail copy, never a throw). */
export function currentUzorGoStage(state: UzorGoState): DemoStageCopy | null {
  return UZOR_GO_MANIFEST[state.stageIndex] ?? null
}

// --- Independent sound preference -----------------------------------------
//
// Bounded-storage backed (src/shared/safeStorage.js), explicit muted/unmuted
// states only. This preference never starts, stops, or aliases UZOR GO (no
// audio asset ships in this phase; Phase #72 owns real audio) — it is wired
// nowhere near the cycle functions above.

export const SOUND_PREF_STORAGE_KEY = 'uzor-engine-sound-pref'

export type SoundPref = 'muted' | 'unmuted'

/** Muted by default: no phase before #72 introduces audio, so silence is the
 *  honest starting state. */
export const DEFAULT_SOUND_PREF: SoundPref = 'muted'

export function isSoundPref(value: string | null): value is SoundPref {
  return value === 'muted' || value === 'unmuted'
}

/** A corrupted/unknown stored value fails the enum check and falls back to
 *  the default rather than reaching UI state. */
export function readSoundPref(): SoundPref {
  const stored = readBoundedStorage(SOUND_PREF_STORAGE_KEY)
  return isSoundPref(stored) ? stored : DEFAULT_SOUND_PREF
}

export function writeSoundPref(pref: SoundPref): boolean {
  return writeBoundedStorage(SOUND_PREF_STORAGE_KEY, pref)
}

export function toggleSoundPref(pref: SoundPref): SoundPref {
  return pref === 'muted' ? 'unmuted' : 'muted'
}
