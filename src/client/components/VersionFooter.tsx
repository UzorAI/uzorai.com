import { version } from '../../../package.json'

// VersionFooter — ported from htu.io: a small build/version stamp pinned at the
// app foot. The version is package.json's, inlined at build time; the mode
// (development/production) comes from Vite's import.meta.env and is only shown
// outside production. Rendered in the mono brand face, muted, so it reads as
// metadata rather than content.
export default function VersionFooter() {
  const mode = import.meta.env.MODE
  return (
    <div
      className="mono"
      style={{
        textAlign: 'center',
        padding: '8px 32px 20px',
        fontSize: 11,
        color: 'var(--muted)',
        opacity: 0.8,
      }}
    >
      uzorai.com · v{version}
      {mode !== 'production' ? ` · ${mode}` : ''}
    </div>
  )
}
