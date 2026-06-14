import { Link } from 'react-router-dom'
import markUrl from '../brand/uzor-mark.svg'
import ThemeToggle from './ThemeToggle'

// The cube master (branding/uzor-logo.svg, copied verbatim to brand/uzor-mark.svg)
// is the only brand mark in the scaffold; no superseded inline symbol is used.
export default function Header() {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--slate-700)',
        background: 'var(--surface)',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 32px',
        }}
      >
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          aria-label="UzorAI home"
        >
          <img src={markUrl} alt="UzorAI" width={36} height={36} />
          <span
            style={{ fontWeight: 800, fontSize: 20, letterSpacing: '0.02em' }}
          >
            UzorAI
          </span>
        </Link>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            className="mono"
            style={{ color: 'var(--accent)', fontSize: 13 }}
          >
            Orchestrate. Govern. Execute.
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
