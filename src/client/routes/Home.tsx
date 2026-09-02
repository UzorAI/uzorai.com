import { useState } from 'react'
import { useLocale } from '../i18n/LocaleProvider'
import LegacyHomeHero from '../components/home/LegacyHomeHero'
import UzorEngineHero from '../components/home/UzorEngineHero'
import { currentHeroMode } from '../config/heroMode'

// Home ports the live uzorai.com hero verbatim (headline, subhead, the UZOR
// pattern gloss, and the "one control plane, three jobs" section) into the scaffold.
// The cube master is the only brand mark here; the legacy graphical artifact on
// the live static page is NOT carried over (it stays there until the cutover).
// Copy resolves through t() against the active dictionary (fallback en).
//
// FEAT #98 (Phase 2 of EPIC #69/#70): the hero itself is now selected by
// host role. `currentHeroMode()` fails closed to 'legacy' for every host
// that isn't the exact staging pair (production, unknown, malformed, or
// SSR-like/no-window) — see src/client/config/heroMode.ts. Resolved once per
// mount via useState's lazy initializer so the choice is stable for the
// component's lifetime and never flips mid-render.
const PILLAR_KEYS = ['orchestrate', 'govern', 'execute'] as const

export default function Home() {
  const { t } = useLocale()
  const [heroMode] = useState(currentHeroMode)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
      {heroMode === 'engine' ? <UzorEngineHero /> : <LegacyHomeHero />}

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
          {t('home.meaning.label')}
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
