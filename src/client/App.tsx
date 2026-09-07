import { useLayoutEffect } from 'react'
import { useLocale } from './i18n/LocaleProvider'
import { Link, useLocation, Route, Routes } from 'react-router-dom'
import NavMenu from './components/NavMenu'
import Footer from './components/Footer'
import VersionFooter from './components/VersionFooter'
import { ROUTES } from './config/routes'

export default function App() {
  const { t } = useLocale()
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    const route = ROUTES.find((r) => r.path === pathname)
    document.title = `${t(route?.labelKey ?? 'notFound.title')} · UzorAI — ${t('header.tagline')}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('home.hero.subhead'))
  }, [pathname, t])
  return (
    // paddingBottom clears the fixed-bottom VersionFooter stripe (~44px) so the
    // content Footer and page never sit hidden behind it (FEAT #57).
    <div className="app" style={{ paddingBottom: 56 }}>
      <NavMenu />
      <main>
        <div className="wrap">
          <Routes>
            {ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            <Route path="*" element={<section>
              <h1>{t('notFound.title')}</h1>
              <p>{t('notFound.body')}</p>
              <Link to="/">{t('notFound.back')}</Link>
            </section>} />
          </Routes>
        </div>
      </main>
      <Footer />
      <VersionFooter />
    </div>
  )
}
