import { LOCALE_STORAGE_KEY, isSupportedLocale, type LocaleCode } from '../config/languages'
import { writeBoundedStorage } from '../../shared/safeStorage'
import { THEME_STORAGE_KEY, isTheme, type Theme } from '../theme/initTheme'
import { SOUND_PREF_STORAGE_KEY, isSoundPref, type SoundPref } from '../content/uzorEngineDemo'

export const SHARE_THEME_PARAM = 'uzor_theme'
export const SHARE_LOCALE_PARAM = 'uzor_lang'
export const SHARE_SOUND_PARAM = 'uzor_sound'

export interface ShareProfile {
  theme?: Theme
  locale?: LocaleCode
  sound?: SoundPref
}

export function readShareProfile(source: Pick<Location, 'search'> | string): ShareProfile {
  const search = typeof source === 'string' ? source : source.search
  const params = new URLSearchParams(search)
  const profile: ShareProfile = {}
  const theme = params.get(SHARE_THEME_PARAM)
  const locale = params.get(SHARE_LOCALE_PARAM)
  const sound = params.get(SHARE_SOUND_PARAM)
  if (isTheme(theme)) profile.theme = theme
  if (isSupportedLocale(locale)) profile.locale = locale
  if (isSoundPref(sound)) profile.sound = sound
  return profile
}

export function applyShareProfile(source: Pick<Location, 'search'> | string = window.location): ShareProfile {
  const profile = readShareProfile(source)
  if (profile.theme) writeBoundedStorage(THEME_STORAGE_KEY, profile.theme)
  if (profile.locale) writeBoundedStorage(LOCALE_STORAGE_KEY, profile.locale)
  if (profile.sound) writeBoundedStorage(SOUND_PREF_STORAGE_KEY, profile.sound)
  return profile
}

export function buildShareUrl(
  source: Pick<Location, 'href'>,
  profile: Required<ShareProfile>,
): string {
  const url = new URL(source.href)
  url.searchParams.set(SHARE_THEME_PARAM, profile.theme)
  url.searchParams.set(SHARE_LOCALE_PARAM, profile.locale)
  url.searchParams.set(SHARE_SOUND_PARAM, profile.sound)
  return url.toString()
}
