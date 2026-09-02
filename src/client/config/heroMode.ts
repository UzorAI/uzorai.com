/**
 * Pure host-role -> hero selector (FEAT #98, Phase 2 of EPIC #69/#70).
 *
 * Reuses the existing normalizeHost/getHostRole exact-allowlist contract
 * (src/shared/hostAllowlist.js) rather than reimplementing host matching, and
 * the Phase 1 canonical model's own validator (isUzorLoopModelValid) rather
 * than trusting an unverified import. Every failure path in the Decision
 * Tree/Failure contract — unknown host, malformed host, unavailable browser
 * host data (SSR-like), or a canonical-model validation failure — resolves
 * to 'legacy', never 'engine'. There is no path that fails open.
 */
import { normalizeHost, getHostRole } from '../../shared/hostAllowlist.js'
import { isUzorLoopModelValid } from '../workflow/uzorLoopModel'

export type HeroMode = 'engine' | 'legacy'

/**
 * Pure decision: given a raw host and a precomputed model-validity flag,
 * which hero to render. Split out from `resolveHeroMode` so both inputs are
 * independently testable without mocking `window` or the canonical model.
 */
export function resolveHeroModeFrom(
  rawHost: string | null | undefined,
  modelValid: boolean,
): HeroMode {
  if (!modelValid) return 'legacy'
  const normalized = normalizeHost(rawHost)
  return getHostRole(normalized) === 'staging' ? 'engine' : 'legacy'
}

/** Convenience wrapper that checks the shipped canonical model's validity. */
export function resolveHeroMode(rawHost: string | null | undefined): HeroMode {
  return resolveHeroModeFrom(rawHost, isUzorLoopModelValid())
}

/**
 * Browser-only entry point. Fails closed to 'legacy' when `window`/
 * `location` is unavailable — the SSR-like/unavailable-host-data path the
 * Decision Tree calls out explicitly.
 */
export function currentHeroMode(): HeroMode {
  if (typeof window === 'undefined' || !window.location) return 'legacy'
  return resolveHeroMode(window.location.hostname)
}
