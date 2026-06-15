// Footer carries the UZOR tagline — a one-line essence of the product that
// echoes the "Orchestrate. Govern. Execute." copyright.
export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--slate-700)',
        background: 'var(--surface)',
        color: 'var(--muted)',
      }}
    >
      <div
        className="wrap"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'space-between',
          padding: '24px 32px',
          fontSize: 13,
        }}
      >
        <span className="mono">
          UZOR — the pattern beneath orchestration, governance, and execution.
        </span>
        <span>© UzorAI. Orchestrate. Govern. Execute.</span>
      </div>
    </footer>
  )
}
