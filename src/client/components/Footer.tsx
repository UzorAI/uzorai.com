// Footer carries the узор line as text (Russian "узор" — pattern/ornament,
// the root of the Uzor brand name).
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
          узор — the pattern beneath orchestration, governance, and execution.
        </span>
        <span>© UzorAI. Orchestrate. Govern. Execute.</span>
      </div>
    </footer>
  )
}
