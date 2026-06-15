import { Link } from 'react-router-dom'
import markUrl from '../brand/uzor-mark.svg'
import { useLocale } from '../i18n/LocaleProvider'

// On-brand Pricing route. No published price sheet exists yet, so this presents
// the enterprise-engagement model on brand and routes buyers to Contact, rather
// than inventing figures. Copy resolves through t() against the active
// dictionary (fallback en); the CTA reuses home.cta.demo.
export default function Pricing() {
  const { t } = useLocale()
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>
        {t('pricing.title')}
      </h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        {t('pricing.tagline')}
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
        {t('pricing.body')}
      </p>
      <Link
        to="/contact"
        style={{
          display: 'inline-block',
          marginTop: 24,
          background: 'var(--teal)',
          color: '#fff',
          padding: '13px 26px',
          borderRadius: 11,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {t('home.cta.demo')}
      </Link>
    </section>
  )
}
