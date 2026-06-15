import { useLocale } from '../i18n/LocaleProvider'

// Footer carries the UZOR tagline — a one-line essence of the product that
// echoes the "Orchestrate. Govern. Execute." copyright. Both resolve through
// t(): the tagline via footer.tagline, the copyright verbs reuse header.tagline.
// "© UzorAI." and the UZOR wordmark stay literal (brand marks).
export default function Footer() {
  const { t } = useLocale()
  return (
    <footer
      style={{
        borderTop: '1px solid var(--slate-700)',
        background: 'var(--surface)',
        color: 'var(--muted)',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'space-between',
          padding: '24px 32px',
          fontSize: 13,
        }}
      >
        <span className="mono">{t('footer.tagline')}</span>
        <span>© UzorAI. {t('header.tagline')}</span>
      </div>
    </footer>
  )
}
