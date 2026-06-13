import { Link } from 'react-router-dom'
import markUrl from '../brand/uzor-mark.svg'

// On-brand Pricing route. No published price sheet exists yet, so this presents
// the enterprise-engagement model on brand and routes buyers to Contact, rather
// than inventing figures.
export default function Pricing() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>Pricing</h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        Enterprise, by engagement
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
        UzorAI is sold as a governed enterprise platform. Pricing is scoped to
        your agents, tools, and governance requirements — talk to us and we will
        shape an engagement around the control plane you need.
      </p>
      <Link
        to="/contact"
        style={{
          display: 'inline-block',
          marginTop: 24,
          background: 'var(--teal)',
          color: '#fff',
          padding: '13px 26px',
          borderRadius: 11,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Request demo
      </Link>
    </section>
  )
}
