import { classifyHost } from '../../server/security'
import { useLocale } from '../i18n/LocaleProvider'

// StagingNotice — the client-side half of the host contract (CHORE #84 §1).
// The built SPA is byte-identical on all four bound domains (one Worker, one
// dist/client), so "staging vs production presentation" can't be baked into
// the static bundle at build time; it's resolved at render time from
// location.hostname through the SAME classifyHost() the Worker uses to gate
// requests, so client and server can never disagree on which of the four
// hosts is which. Renders nothing on production or on any host classifyHost
// doesn't recognize — only the two staging hosts get the banner.
export default function StagingNotice() {
  const { t } = useLocale()
  const role =
    typeof window === 'undefined' ? null : classifyHost(window.location.hostname)

  if (role !== 'staging') return null

  return (
    <div
      role="status"
      style={{
        background: 'var(--color-warning, #b45309)',
        color: '#fff',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
        padding: '8px 16px',
      }}
    >
      {t('staging.notice')}
    </div>
  )
}
