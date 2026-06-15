import { Route, Routes } from 'react-router-dom'
import NavMenu from './components/NavMenu'
import Footer from './components/Footer'
import VersionFooter from './components/VersionFooter'
import { ROUTES } from './config/routes'

export default function App() {
  return (
    <div className="app">
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
