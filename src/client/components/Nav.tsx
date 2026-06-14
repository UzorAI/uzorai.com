import { NavLink } from 'react-router-dom'
import { useLocale } from '../i18n/LocaleProvider'

// Single source of truth for the six routes; App.tsx wires the same paths.
// `labelKey` resolves through the active dictionary (fallback en).
export const NAV_ITEMS = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/platform', labelKey: 'nav.platform' },
  { to: '/governance', labelKey: 'nav.governance' },
  { to: '/docs', labelKey: 'nav.docs' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/contact', labelKey: 'nav.contact' },
] as const

export default function Nav() {
  const { t } = useLocale()
  return (
    <nav
      style={{
        borderBottom: '1px solid var(--slate-700)',
        background: 'var(--surface)',
      }}
    >
      <div
        className="wrap"
        style={{ display: 'flex', gap: 8, padding: '0 32px' }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              padding: '14px 12px',
              fontSize: 15,
              fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--slate-400)',
              borderBottom: isActive
                ? '2px solid var(--accent)'
                : '2px solid transparent',
            })}
          >
            {t(item.labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
