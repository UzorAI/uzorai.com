import markUrl from '../brand/uzor-mark.svg'

// On-brand Contact route. Routes enterprise buyers to a demo request; deeper
// lead-capture wiring is out of scope for this phase.
export default function Contact() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <img src={markUrl} alt="UzorAI cube mark" width={72} height={72} />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginTop: 24 }}>Contact</h1>
      <p className="mono" style={{ color: 'var(--accent)', marginTop: 8 }}>
        Orchestrate. Govern. Execute.
      </p>
      <p style={{ color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
        Ready to see the woven control plane in action? Request a demo and we
        will walk through orchestration, governance, and execution against your
        own agents and tools.
      </p>
      <a
        href="mailto:hello@uzorai.com?subject=UzorAI%20demo%20request"
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
      </a>
      <p className="mono" style={{ color: 'var(--muted)', marginTop: 16, fontSize: 13 }}>
        hello@uzorai.com
      </p>
    </section>
  )
}
