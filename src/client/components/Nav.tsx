import { NavLink } from 'react-router-dom'

// Single source of truth for the six routes; App.tsx wires the same paths.
export const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/platform', label: 'Platform' },
  { to: '/governance', label: 'Governance' },
  { to: '/docs', label: 'Docs' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
] as const

export default function Nav() {
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
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
