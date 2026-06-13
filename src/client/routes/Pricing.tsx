import markUrl from '../brand/uzor-mark.svg'

export default function Pricing() {
  return (
    <section style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
      <img src={markUrl} alt="" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>Pricing</h1>
      <p style={{ color: 'var(--muted)', marginTop: 16 }}>
        Branded stub — the Pricing copy lands in Phase 2 of the uzorai.com
        framework port (#15).
      </p>
    </section>
  )
}
