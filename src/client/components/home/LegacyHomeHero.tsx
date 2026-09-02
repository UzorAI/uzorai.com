import { Link } from 'react-router-dom'
import markUrl from '../../brand/uzor-mark.svg'
import { useLocale } from '../../i18n/LocaleProvider'

// The stable-production hero, extracted verbatim from Home.tsx (FEAT #98,
// Phase 2 of EPIC #69/#70). Copy, routes, brand mark, and behavior are
// unchanged — this component is what every host renders until a role
// resolves to 'engine' (src/client/config/heroMode.ts), and it is what every
// host falls back to on any host/model failure (see heroMode.ts docstring).
export default function LegacyHomeHero() {
  const { t } = useLocale()
  return (
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
  )
}
