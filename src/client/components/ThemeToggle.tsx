import { useTheme } from '../theme/ThemeProvider'

// Ported from htu-foundation's ThemeToggle. Toggles light/dark via the
// ThemeProvider; all colours resolve from data-theme tokens so the control
// restyles with the theme it sets.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--fg)',
        background: 'transparent',
        border: '1px solid var(--slate-700)',
        borderRadius: 8,
        cursor: 'pointer',
      }}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
