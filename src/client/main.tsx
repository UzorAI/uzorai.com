import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LocaleProvider } from './i18n/LocaleProvider'
import { ThemeProvider } from './theme/ThemeProvider'
import { applyShareProfile } from './settings/shareProfile'
import './brand/tokens.css'
import './styles/fonts.css'
import './styles/rtl.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

// A shared settings URL takes precedence over local preferences before the
// providers resolve their initial locale, theme, and sound state.
applyShareProfile()

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
