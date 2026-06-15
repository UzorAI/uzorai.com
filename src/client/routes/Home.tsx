import { Link } from 'react-router-dom'
import markUrl from '../brand/uzor-mark.svg'
import { useLocale } from '../i18n/LocaleProvider'

// Home ports the live uzorai.com hero verbatim (headline, subhead, the UZOR
// pattern gloss, and the "one control plane, three jobs" section) into the scaffold.
// The cube master is the only brand mark here; the legacy graphical artifact on
// the live static page is NOT carried over (it stays there until the cutover).
// Copy resolves through t() against the active dictionary (fallback en).
const PILLAR_KEYS = ['orchestrate', 'govern', 'execute'] as const

export default function Home() {
  const { t } = useLocale()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
      {/* Hero */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: 40,
          alignItems: 'center',
        }}
      >
        <div>
          <p
            className="mono"
            style={{
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}
          >
            {t('home.eyebrow')}
          </p>
          <h1
            style={{
              fontSize: 'clamp(40px, 6.5vw, 76px)',
              fontWeight: 800,
              letterSpacing: '-0.035em',
              lineHeight: 1.02,
              margin: '20px 0 18px',
            }}
          >
            {t('home.hero.headline.1')}
            <br />
            <span style={{ color: 'var(--accent)' }}>
              {t('home.hero.headline.2')}
            </span>{' '}
            {t('home.hero.headline.3')}
          </h1>
          <p
            style={{
              fontSize: 19,
              color: 'var(--muted)',
              maxWidth: '48ch',
              lineHeight: 1.6,
            }}
          >
            {t('home.hero.subhead')}
          </p>
          <div
            style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}
          >
            <Link
              to="/contact"
              style={{
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
            <Link
              to="/docs"
              style={{
                border: '1px solid rgba(255,255,255,0.16)',
                padding: '13px 24px',
                borderRadius: 11,
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--fg)',
              }}
            >
              {t('home.cta.docs')}
            </Link>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: '108%',
              paddingBottom: '108%',
              border: '1px solid rgba(167,227,229,0.12)',
              borderRadius: '50%',
            }}
          />
          <img
            src={markUrl}
            alt="UzorAI cube mark"
            style={{
              width: 'min(360px, 80%)',
              height: 'auto',
              filter: 'drop-shadow(0 0 40px rgba(167,227,229,0.25))',
            }}
          />
        </div>
      </section>

      {/* Meaning strip — the UZOR pattern gloss */}
      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(30,41,59,0.35)',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <span
          className="mono"
          style={{ fontSize: 12, letterSpacing: '0.06em', color: 'var(--accent)' }}
        >
          UZOR · THE PATTERN
        </span>
        <span style={{ fontSize: 14.5, color: 'var(--muted)' }}>
          {t('home.meaning.text')}
        </span>
      </section>

      {/* Three pillars — one control plane, three jobs */}
      <section>
        <h2
          className="mono"
          style={{
            fontSize: 13,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            textAlign: 'center',
            marginBottom: 34,
          }}
        >
          {t('home.pillars.heading')}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {PILLAR_KEYS.map((key) => (
            <div
              key={key}
              style={{
                background:
                  'linear-gradient(180deg, rgba(30,41,59,0.55), rgba(30,41,59,0.2))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                padding: 30,
              }}
            >
              <div
                className="mono"
                style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.08em' }}
              >
                {t(`home.pillar.${key}.k`)}
              </div>
              <h3 style={{ fontSize: 21, fontWeight: 700, margin: '12px 0 8px' }}>
                {t(`home.pillar.${key}.h`)}
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65 }}>
                {t(`home.pillar.${key}.p`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise MCP endpoint */}
      <section>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid rgba(167,227,229,0.18)',
            borderRadius: 18,
            padding: '34px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              className="mono"
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {t('home.mcp.eyebrow')}
            </div>
            <h3
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginTop: 8,
              }}
            >
              {t('home.mcp.heading')}
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--muted)',
                marginTop: 6,
                maxWidth: '52ch',
              }}
            >
              {t('home.mcp.body')}
            </p>
          </div>
          <span
            className="mono"
            style={{
              fontSize: 14,
              color: 'var(--accent)',
              border: '1px solid rgba(167,227,229,0.25)',
              borderRadius: 10,
              padding: '12px 18px',
              whiteSpace: 'nowrap',
            }}
          >
            https://skills.uzorai.com/mcp
          </span>
        </div>
      </section>
    </div>
  )
}
