/**
 * Bounded, defensive localStorage access (EPIC #82 child: Worker/Browser
 * Boundary Hardening). Every persisted UI preference in this app (locale,
 * theme) is untrusted the moment it's read back — a corrupted, oversized,
 * or attacker-planted value must never reach app state unchecked. Plain
 * JS — imported directly by LocaleProvider/initTheme and by the CI
 * regression script scripts/security/assert-browser-boundary.mjs, so the
 * test can never drift from what actually ships.
 */

// Generous but bounded — every real key/value this app persists
// (uzor-locale, uzor-theme) is a short enum string; anything near these
// limits is already not a legitimate preference value.
export const MAX_STORAGE_KEY_LENGTH = 64
export const MAX_STORAGE_VALUE_LENGTH = 256

/**
 * @param {string} key
 * @returns {string | null} the stored value, or null if unavailable,
 *   out-of-bounds, or storage throws (private mode / quota / disabled).
 */
export function readBoundedStorage(key) {
  if (typeof window === 'undefined' || !window.localStorage) return null
  if (typeof key !== 'string' || key.length === 0 || key.length > MAX_STORAGE_KEY_LENGTH) {
    return null
  }
  try {
    const value = window.localStorage.getItem(key)
    if (value === null) return null
    if (value.length > MAX_STORAGE_VALUE_LENGTH) return null
    return value
  } catch {
    return null
  }
}

/**
 * @param {string} key
 * @param {string} value
 * @returns {boolean} whether the write was attempted (bounds satisfied and
 *   storage didn't throw)
 */
export function writeBoundedStorage(key, value) {
  if (typeof window === 'undefined' || !window.localStorage) return false
  if (typeof key !== 'string' || key.length === 0 || key.length > MAX_STORAGE_KEY_LENGTH) {
    return false
  }
  if (typeof value !== 'string' || value.length > MAX_STORAGE_VALUE_LENGTH) {
    return false
  }
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
