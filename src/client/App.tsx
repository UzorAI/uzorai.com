import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './routes/Home'
import Platform from './routes/Platform'
import Governance from './routes/Governance'
import Docs from './routes/Docs'
import Pricing from './routes/Pricing'
import Contact from './routes/Contact'

export default function App() {
  return (
    <div className="app">
      <Header />
      <Nav />
      <main>
        <div className="wrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}
