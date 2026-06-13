import markUrl from '../brand/uzor-mark.svg'

// On-brand Governance content — the "Govern" pillar elaborated. No standalone
// live source, so this stays on brand rather than a bare stub.
const CONTROLS = [
  {
    h: 'Identity & permissions',
    p: 'Every agent and tool acts under an explicit identity. Permissions are scoped, not assumed.',
  },
  {
    h: 'Approval gates',
    p: 'Policy is enforced before execution — high-impact actions pause for the gate, not after the fact.',
  },
  {
    h: 'Zero-Trust, audit-ready',
    p: 'Host-correct by construction, with a cryptographic trail that makes every decision provable.',
  },
]

export default function Governance() {
  return (
    <section style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
        <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>Governance</h1>
        <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
          Policy at the core
        </p>
        <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
          Identity, permissions, and approval gates are enforced before
          execution — Zero-Trust, audit-ready, and host-correct, so orchestration
          stays accountable end to end.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginTop: 48,
        }}
      >
        {CONTROLS.map((c) => (
          <div
            key={c.h}
            style={{
              background:
                'linear-gradient(180deg, rgba(30,41,59,0.55), rgba(30,41,59,0.2))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 18,
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>
              {c.h}
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65 }}>
              {c.p}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
