import markUrl from '../brand/uzor-mark.svg'

export default function Home() {
  return (
    <section style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
      <img src={markUrl} alt="" width={88} height={88} />
      <h1 style={{ fontSize: 44, fontWeight: 800, marginTop: 24 }}>UzorAI</h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        Orchestrate. Govern. Execute.
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16 }}>
        Branded stub — the Home copy lands in Phase 2 of the uzorai.com framework
        port (#15).
      </p>
    </section>
  )
}
