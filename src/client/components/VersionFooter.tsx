import { useEffect, useState } from 'react'
import { useLocale } from '../i18n/LocaleProvider'

// VersionFooter — TypeScript port of htu.io's foundation VersionFooter
// (src/foundation/components/VersionFooter.jsx). A fixed-bottom version stripe
// whose label is a button that opens a Deployment History overlay: a release
// list, then a per-release detail (status + change bullets) reached by clicking
// a row and dismissed with the back button, ESC, the backdrop, or the close ✕.
//
// Two deliberate divergences from htu.io, per FEAT #57:
//   1. The version source is the CURRENT_VERSION const + DEPLOYMENTS array below
//      (carrying per-release metadata) — not the package.json read it replaces.
//   2. uzorai hosts LanguagePicker/ThemeToggle in its header, so the stripe
//      carries only the version button — they are not duplicated here.
//
// htu.io's `--color-*` stripe/overlay tokens are kept verbatim in the JSX and
// mapped onto uzorai's design tokens centrally in brand/tokens.css, so the
// module stays a faithful port and theme-correct in both light and dark.

const CURRENT_VERSION = '0.2.0'

type Deployment = {
  version: string
  date: string
  title: string
  environment: string
  status: string
  details: string[]
}

// Hand-maintained release history. Reviewed in the PR alongside the code it
// describes (no entry ships without review); rendered as text only, never HTML.
const DEPLOYMENTS: Deployment[] = [
  {
    version: '0.2.0',
    date: '2026-06-18',
    title: 'footer.release.020.title',
    environment: 'production',
    status: 'success',
    details: [
      'footer.release.020.detail.1',
      'footer.release.020.detail.2',
      'footer.release.020.detail.3',
      'footer.release.020.detail.4',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-14',
    title: 'footer.release.010.title',
    environment: 'production',
    status: 'success',
    details: [
      'footer.release.010.detail.1',
      'footer.release.010.detail.2',
      'footer.release.010.detail.3',
      'footer.release.010.detail.4',
    ],
  },
]

export default function VersionFooter() {
  const { t, locale } = useLocale()
  const mode = import.meta.env.MODE
  const isProd = import.meta.env.PROD
  const [showVersions, setShowVersions] = useState(false)
  const [selectedDeploy, setSelectedDeploy] = useState<Deployment | null>(null)
  const versionLabel = isProd
    ? `v${CURRENT_VERSION}`
    : `v${CURRENT_VERSION}-${mode}`

  useEffect(() => {
    if (!showVersions) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowVersions(false)
        setSelectedDeploy(null)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [showVersions])

  return (
    <>
      {/* VERSION STRIPE — fixed bottom */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-stripe-bg)',
          borderTop: '1px solid var(--color-stripe-border)',
          padding: '10px 20px',
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            aria-label={t('footer.deploymentHistory')}
            dir="ltr"
            onClick={() => {
              setShowVersions(!showVersions)
              setSelectedDeploy(null)
            }}
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              letterSpacing: 0.5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-tertiary)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--color-text-muted)')
            }
          >
            {versionLabel}
          </button>
        </div>
      </div>

      {/* VERSION HISTORY OVERLAY */}
      {showVersions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'var(--color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => {
            setShowVersions(false)
            setSelectedDeploy(null)
          }}
        >
          <div
            role="dialog"
            aria-label={t('footer.deploymentHistory')}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span
                style={{
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {selectedDeploy
                  ? `v${selectedDeploy.version}`
                  : t('footer.deploymentHistory')}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {selectedDeploy && (
                  <button
                    onClick={() => setSelectedDeploy(null)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border-strong)',
                      color: 'var(--color-text-tertiary)',
                      borderRadius: 6,
                      padding: '4px 12px',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {`${locale === 'he' || locale === 'ar' ? '→' : '←'} ${t('footer.back')}`}
                  </button>
                )}
                <button
                  aria-label={t('footer.close')}
                  onClick={() => {
                    setShowVersions(false)
                    setSelectedDeploy(null)
                  }}
                  style={{
                    background: 'var(--color-error)',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    lineHeight: 1,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {'✕'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 20 }}>
              {!selectedDeploy ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  {DEPLOYMENTS.map((d) => (
                    <button
                      type="button"
                      key={d.version}
                      onClick={() => setSelectedDeploy(d)}
                      style={{
                        background: 'var(--color-surface)',
                        borderRadius: 8,
                        padding: '14px 18px',
                        cursor: 'pointer',
                        border: '1px solid var(--color-border-strong)',
                        transition: 'border-color 0.2s',
                        textAlign: 'start',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-accent)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor =
                          'var(--color-border-strong)')
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--color-text-primary)',
                            fontWeight: 600,
                            fontSize: 15,
                          }}
                        >
                          {t(d.title)}
                        </span>
                        <span
                          style={{
                            color: 'var(--color-accent)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 13,
                          }}
                        >
                          <bdi>{`v${d.version}`}</bdi>
                        </span>
                      </div>
                      <div
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: 12,
                          marginTop: 4,
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <bdi>{d.date}</bdi>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <h3
                    style={{
                      color: 'var(--color-text-primary)',
                      margin: '0 0 4px',
                      fontSize: 18,
                    }}
                  >
                    {t(selectedDeploy.title)}
                  </h3>
                  <p
                    style={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      margin: '0 0 16px',
                    }}
                  >
                    <bdi>{`${selectedDeploy.date} · v${selectedDeploy.version}`}</bdi>
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: 16,
                      flexWrap: 'wrap',
                      marginBottom: 16,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                      {t('footer.environment')}: {' '}
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {t(`footer.environment.${selectedDeploy.environment}`)}
                      </span>
                    </span>
                    {selectedDeploy.status && (
                      <span style={{ color: 'var(--color-text-tertiary)' }}>
                        {t('footer.status')}: {' '}
                        <span
                          style={{
                            color:
                              selectedDeploy.status === 'success'
                                ? 'var(--color-brand)'
                                : 'var(--color-error)',
                          }}
                        >
                          {t(`footer.status.${selectedDeploy.status}`)}
                        </span>
                      </span>
                    )}
                  </div>
                  {selectedDeploy.details && (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {selectedDeploy.details.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                            color: 'var(--color-text-secondary)',
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--color-brand)',
                              flexShrink: 0,
                            }}
                          >
                            {'✓'}
                          </span>
                          <span>{t(item)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
