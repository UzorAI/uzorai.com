import { LANGUAGES, type LocaleCode } from '../config/languages'
import { useLocale } from '../i18n/LocaleProvider'

// Ported switcher: a native <select> over the bundled locales. Switching calls
// setLocale, which persists to localStorage `uzor-locale` and re-renders all
// copy wired through t(). Native select keeps it keyboard- and RTL-correct.
export default function LanguagePicker() {
  const { locale, setLocale, t } = useLocale()

  return (
    <label
      className="mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'var(--muted)',
      }}
    >
      <span style={{ letterSpacing: '0.06em' }}>{t('picker.label')}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        aria-label={t('picker.label')}
        style={{
          appearance: 'auto',
          background: 'var(--bg)',
          color: 'var(--fg)',
          border: '1px solid var(--slate-700)',
          borderRadius: 8,
          padding: '5px 8px',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}
