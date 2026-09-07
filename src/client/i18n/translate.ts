export type Dictionary = Record<string, string>

/** Hebrew is complete by contract: never silently substitute English. */
export function translate(locale: string, dict: Dictionary, source: Dictionary, key: string): string {
  if (locale === 'he' && (typeof dict[key] !== 'string' || !dict[key].trim())) {
    throw new Error(`Missing Hebrew translation: ${key}`)
  }
  return dict[key] ?? source[key] ?? key
}
