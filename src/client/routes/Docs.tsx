import markUrl from '../brand/uzor-mark.svg'

// On-brand Docs route. The one concrete doc surface that exists today is the
// governed MCP endpoint, so this links it directly; deeper docs land in a later
// phase of #15.
export default function Docs() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>Docs</h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        Connect to the platform
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
        UzorAI exposes a governed, OAuth-secured MCP server on a clean enterprise
        domain. Point an MCP client at the endpoint below to connect.
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
