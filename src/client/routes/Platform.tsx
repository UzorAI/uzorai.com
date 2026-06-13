import markUrl from '../brand/uzor-mark.svg'

// On-brand Platform content. No dedicated live source beyond the Home hero, so
// this elaborates the orchestration control-plane story on brand (cube mark,
// graphite/mint tokens) rather than shipping a bare stub.
const CAPABILITIES = [
  {
    h: 'One control plane',
    p: 'Agents, tools, and MCP servers coordinated from a single woven lattice — no fragmented glue code between systems.',
  },
  {
    h: 'MCP-native',
    p: 'Speak the Model Context Protocol end to end. Connect enterprise tools and agents through one governed endpoint.',
  },
  {
    h: 'Auditable by construction',
    p: 'Every routed action carries a verifiable trail, so orchestration stays provable long after it runs.',
  },
]

export default function Platform() {
  return (
    <section style={{ maxWidth: 960, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
        <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>Platform</h1>
        <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
          The woven control plane
        </p>
        <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
          UzorAI coordinates enterprise agents, tools, and workflows from one
          governed control plane — orchestration, governance, and execution as a
          single auditable pattern.
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
        {CAPABILITIES.map((c) => (
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
