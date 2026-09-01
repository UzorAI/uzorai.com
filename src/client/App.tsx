import { Route, Routes } from 'react-router-dom'
import NavMenu from './components/NavMenu'
import Footer from './components/Footer'
import VersionFooter from './components/VersionFooter'
import StagingNotice from './components/StagingNotice'
import { ROUTES } from './config/routes'

export default function App() {
  return (
    // paddingBottom clears the fixed-bottom VersionFooter stripe (~44px) so the
    // content Footer and page never sit hidden behind it (FEAT #57).
    <div className="app" style={{ paddingBottom: 56 }}>
      <StagingNotice />
      <NavMenu />
      <main>
        <div className="wrap">
          <Routes>
            {ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Routes>
        </div>
      </main>
      <Footer />
      <VersionFooter />
    </div>
  )
}
