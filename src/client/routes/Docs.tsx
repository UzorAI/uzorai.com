import markUrl from '../brand/uzor-mark.svg'
import { useLocale } from '../i18n/LocaleProvider'

// On-brand Docs route. The one concrete doc surface that exists today is the
// governed MCP endpoint, so this links it directly; deeper docs land in a later
// phase of #15. Copy resolves through t() against the active dictionary
// (fallback en); the endpoint URL stays literal (build metadata, not prose).
export default function Docs() {
  const { t } = useLocale()
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>
        {t('docs.title')}
      </h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        {t('docs.tagline')}
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
        {t('docs.body')}
      </p>
      <a
        href="https://skills.uzorai.com/mcp"
        className="mono"
        style={{
          display: 'inline-block',
          marginTop: 24,
          fontSize: 14,
          color: 'var(--accent)',
          border: '1px solid rgba(167,227,229,0.25)',
          borderRadius: 10,
          padding: '12px 18px',
        }}
      >
        https://skills.uzorai.com/mcp
      </a>
    </section>
  )
}
