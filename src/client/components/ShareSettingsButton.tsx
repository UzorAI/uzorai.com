import { useState } from 'react'
import { useLocale } from '../i18n/LocaleProvider'
import { readSoundPref } from '../content/uzorEngineDemo'
import { buildShareUrl } from '../settings/shareProfile'
import { useTheme } from '../theme/ThemeProvider'

export default function ShareSettingsButton() {
  const { locale, t } = useLocale()
  const { theme } = useTheme()
  const [status, setStatus] = useState<'idle' | 'shared' | 'failed'>('idle')

  async function share() {
    const url = buildShareUrl(window.location, {
      locale,
      theme,
      sound: readSoundPref(),
    })
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        throw new Error('sharing unavailable')
      }
      setStatus('shared')
    } catch {
      setStatus('failed')
    }
  }

  const label = status === 'shared'
    ? t('settings.shared')
    : status === 'failed'
      ? t('settings.shareFailed')
      : t('settings.share')

  return (
    <button
      type="button"
      onClick={() => { void share() }}
      aria-label={label}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
        height: 32,
        padding: '0 8px',
        border: '1px solid var(--slate-700)',
        borderRadius: 8,
        background: 'var(--surface)',
        color: 'var(--muted)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
      }}
    >
      {label}
    </button>
  )
}
