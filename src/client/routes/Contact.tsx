import markUrl from '../brand/uzor-mark.svg'
import { useLocale } from '../i18n/LocaleProvider'

// On-brand Contact route. Routes enterprise buyers to a demo request; deeper
// lead-capture wiring is out of scope for this phase. Copy resolves through t()
// against the active dictionary (fallback en); the mono tagline reuses
// header.tagline and the CTA reuses home.cta.demo.
export default function Contact() {
  const { t } = useLocale()
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>
        {t('contact.title')}
      </h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        {t('header.tagline')}
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
        {t('contact.body')}
      </p>
      <a
        href="mailto:hello@uzorai.com?subject=UzorAI%20demo%20request"
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
      </a>
      <p className="mono" style={{ color: 'var(--muted)', marginTop: 16, fontSize: 13 }}>
        {t('contact.email')}
      </p>
    </section>
  )
}
