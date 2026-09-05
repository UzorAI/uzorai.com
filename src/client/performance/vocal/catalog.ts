import type { VocalProfile } from './schema'

// Production catalog is empty until repository-owned, rights-cleared, approved voice profiles exist.
// Tests use synthetic fixture profiles defined in the test file — no binary audio here.
export const VOCAL_CATALOG: readonly VocalProfile[] = Object.freeze([])
