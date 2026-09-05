import type { ApprovedPhrase } from './schema'
import type { VocalLocale } from '../vocal/schema'

export const RESERVOIR_VERSION = '1.0.0'

// Configurable bounded policy inputs (thresholds not finalized — AC6, Final Spec).
export interface InventoryPolicy {
  readonly lowWatermark: number
  readonly maxCapacity: number
}

export interface InventoryStatus {
  readonly total: number
  readonly approved: number
  readonly publishable: number
  readonly needsReplenishment: boolean
  readonly lowWatermark: number
}

export interface ReplenishmentSignal {
  readonly kind: 'replenishment-signal'
  readonly reservoirVersion: string
  readonly publishable: number
  readonly lowWatermark: number
  readonly emittedAt: string
}

export interface PhraseReservoir {
  readonly version: string
  readonly phrases: readonly ApprovedPhrase[]
  readonly inventoryPolicy: InventoryPolicy
}

function isPublishable(phrase: ApprovedPhrase, now: Date): boolean {
  return phrase.state === 'approved'
    && phrase.supersededBy === null
    && new Date(phrase.freshUntil) > now
}

// Pure read — no network call, no generation (AC6).
export function checkInventory(reservoir: PhraseReservoir, locale?: VocalLocale, now = new Date()): InventoryStatus {
  const phrases = locale
    ? reservoir.phrases.filter(p => p.locale === locale)
    : reservoir.phrases
  const approved = phrases.filter(p => p.state === 'approved').length
  const publishable = phrases.filter(p => isPublishable(p, now)).length
  return {
    total: phrases.length,
    approved,
    publishable,
    needsReplenishment: publishable < reservoir.inventoryPolicy.lowWatermark,
    lowWatermark: reservoir.inventoryPolicy.lowWatermark,
  }
}

// Returns a signal when inventory is low; never triggers LLM or browser publish (AC6).
export function emitReplenishmentSignal(reservoir: PhraseReservoir, locale?: VocalLocale, now = new Date()): ReplenishmentSignal | null {
  const status = checkInventory(reservoir, locale, now)
  if (!status.needsReplenishment) return null
  return Object.freeze({
    kind: 'replenishment-signal',
    reservoirVersion: reservoir.version,
    publishable: status.publishable,
    lowWatermark: status.lowWatermark,
    emittedAt: now.toISOString(),
  })
}

// Only publishable phrases enter the active distribution set (AC7).
export function getPublishablePhrases(reservoir: PhraseReservoir, locale?: VocalLocale, now = new Date()): readonly ApprovedPhrase[] {
  return reservoir.phrases.filter(p =>
    isPublishable(p, now) && (locale === undefined || p.locale === locale),
  )
}

// Active cycles that already started continue safely; only NEW distributions stop (AC7).
export function isDistributionBlocked(phrase: ApprovedPhrase, now = new Date()): boolean {
  return phrase.state === 'superseded'
    || phrase.state === 'quarantined'
    || new Date(phrase.freshUntil) <= now
    || phrase.supersededBy !== null
}
