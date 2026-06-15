import markUrl from '../brand/uzor-mark.svg'
import { useLocale } from '../i18n/LocaleProvider'

// On-brand Governance content — the "Govern" pillar elaborated. No standalone
// live source, so this stays on brand rather than a bare stub. Copy resolves
// through t() against the active dictionary (fallback en).
const CONTROL_KEYS = ['1', '2', '3'] as const

export default function Governance() {
  const { t } = useLocale()
  return (
    <section style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
        <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>
          {t('governance.title')}
        </h1>
        <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
          {t('governance.tagline')}
        </p>
        <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
          {t('governance.body')}
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginTop: 48,
        }}
      >
        {CONTROL_KEYS.map((k) => (
          <div
            key={k}
            style={{
              background:
                'linear-gradient(180deg, rgba(30,41,59,0.55), rgba(30,41,59,0.2))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18,
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>
              {t(`governance.ctrl.${k}.h`)}
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65 }}>
              {t(`governance.ctrl.${k}.p`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
